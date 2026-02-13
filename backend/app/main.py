from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.api.routes import router
from app.db.database import engine
from app.db.models import Base
import os


def create_app() -> FastAPI:
    setup_logging()

    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    os.makedirs(settings.PDF_DIR, exist_ok=True)
    os.makedirs(settings.IMAGE_DIR, exist_ok=True)

    app = FastAPI(title=settings.APP_NAME)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router, prefix="/api")

    @app.on_event("startup")
    async def _startup():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    return app


app = create_app()
