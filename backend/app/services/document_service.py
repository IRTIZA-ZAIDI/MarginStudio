import os
import uuid
from app.core.config import settings
from app.utils.pdf_utils import get_page_count, extract_page_text, render_page_to_image
from app.utils.image_utils import crop_bbox


def ensure_dirs():
    os.makedirs(settings.PDF_DIR, exist_ok=True)
    os.makedirs(settings.IMAGE_DIR, exist_ok=True)


async def save_pdf(file_bytes: bytes, original_name: str) -> dict:
    ensure_dirs()
    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    safe_name = original_name.replace("/", "_").replace("\\", "_")
    pdf_path = os.path.join(settings.PDF_DIR, f"{doc_id}_{safe_name}")

    with open(pdf_path, "wb") as f:
        f.write(file_bytes)

    pages = get_page_count(pdf_path)
    return {"doc_id": doc_id, "filename": safe_name, "path": pdf_path, "pages": pages}


def get_page_text(pdf_path: str, page: int) -> str:
    return extract_page_text(pdf_path, page)


def crop_page_region_to_file(pdf_path: str, page: int, bbox: dict) -> str:
    """
    Renders page -> crops bbox -> saves png -> returns path
    """
    ensure_dirs()
    img = render_page_to_image(pdf_path, page, zoom=2.0)
    cropped = crop_bbox(img, bbox)

    out_path = os.path.join(settings.IMAGE_DIR, f"crop_{uuid.uuid4().hex[:12]}.png")
    cropped.save(out_path, format="PNG")
    return out_path
