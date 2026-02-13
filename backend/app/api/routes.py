from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.schemas.dto import UploadResponse, AskRequest, AskResponse
from app.db.database import get_db
from app.db.models import Document, ChatMessage
from app.db.repo import insert_document, get_document, insert_chat
from app.services import document_service
from app.services.prompt_engine import build_prompt
from app.services.llm_service import ask

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported")

    data = await file.read()
    saved = await document_service.save_pdf(data, file.filename)

    doc = Document(
        id=saved["doc_id"],
        filename=saved["filename"],
        path=saved["path"],
        pages=saved["pages"],
    )
    await insert_document(db, doc)

    return UploadResponse(doc_id=doc.id, filename=doc.filename, pages=doc.pages)


@router.get("/documents/{doc_id}")
async def get_doc(doc_id: str, db: AsyncSession = Depends(get_db)):
    doc = await get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"id": doc.id, "filename": doc.filename, "pages": doc.pages}


@router.get("/documents/{doc_id}/page/{page}/text")
async def get_page_text(doc_id: str, page: int, db: AsyncSession = Depends(get_db)):
    doc = await get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if page < 1 or page > doc.pages:
        raise HTTPException(status_code=400, detail="Invalid page number")

    text = document_service.get_page_text(doc.path, page)
    return {"doc_id": doc_id, "page": page, "text": text}


@router.post("/ask", response_model=AskResponse)
async def ask_ai(payload: AskRequest, db: AsyncSession = Depends(get_db)):
    doc_path = None
    if payload.document_id:
        doc = await get_document(db, payload.document_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        doc_path = doc.path

    sel = payload.selection.model_dump()

    # minimal validation for v1
    if sel["type"] == "text":
        if not sel.get("content"):
            # fallback: if FE doesn't send text, pull whole page text (still basic)
            if not doc_path:
                raise HTTPException(
                    status_code=400,
                    detail="selection.content required or provide document_id",
                )
            sel["content"] = document_service.get_page_text(doc_path, sel["page"])
    elif sel["type"] == "image":
        if not sel.get("bbox"):
            raise HTTPException(
                status_code=400, detail="selection.bbox required for image selection"
            )
        if not doc_path:
            raise HTTPException(
                status_code=400, detail="document_id required for image selection"
            )

    prompt_plan = build_prompt(payload.user_query, sel)

    image_path = None
    if sel["type"] == "image":
        image_path = document_service.crop_page_region_to_file(
            doc_path, sel["page"], sel["bbox"]
        )

    chosen_model, answer = ask(payload.model, prompt_plan, image_path=image_path)

    # persist chat (basic)
    user_msg = ChatMessage(
        id=f"msg_{uuid.uuid4().hex[:12]}",
        doc_id=payload.document_id,
        role="user",
        content=payload.user_query,
    )
    assistant_msg = ChatMessage(
        id=f"msg_{uuid.uuid4().hex[:12]}",
        doc_id=payload.document_id,
        role="assistant",
        content=answer,
    )
    await insert_chat(db, user_msg)
    await insert_chat(db, assistant_msg)

    return AskResponse(
        model=chosen_model,
        answer=answer,
        used_context=prompt_plan["used_context"],
    )
