from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import Document, ChatMessage


async def insert_document(db: AsyncSession, doc: Document) -> None:
    db.add(doc)
    await db.commit()


async def get_document(db: AsyncSession, doc_id: str) -> Document | None:
    res = await db.execute(select(Document).where(Document.id == doc_id))
    return res.scalar_one_or_none()


async def insert_chat(db: AsyncSession, msg: ChatMessage) -> None:
    db.add(msg)
    await db.commit()
