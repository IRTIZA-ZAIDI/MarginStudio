# tests/conftest.py
import os
import shutil
import pytest
from pathlib import Path


@pytest.fixture(scope="session", autouse=True)
def _set_test_env():
    """
    IMPORTANT:
    Set env BEFORE importing app modules so settings/engine use test config.
    """
    base = Path("tests/_tmp_storage")
    pdf_dir = base / "pdfs"
    img_dir = base / "images"

    # Clean slate each session
    if base.exists():
        shutil.rmtree(base)
    pdf_dir.mkdir(parents=True, exist_ok=True)
    img_dir.mkdir(parents=True, exist_ok=True)

    os.environ["ENV"] = "test"
    os.environ["STORAGE_DIR"] = str(base)
    os.environ["PDF_DIR"] = str(pdf_dir)
    os.environ["IMAGE_DIR"] = str(img_dir)
    os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{base / 'test.db'}"
    os.environ["CORS_ORIGINS"] = "http://localhost:3000"
    os.environ["DEFAULT_MODEL"] = "gpt-4o-mini"

    # Keys not needed because we mock LiteLLM calls
    os.environ["OPENAI_API_KEY"] = "test"
    os.environ["ANTHROPIC_API_KEY"] = "test"

    yield

    # teardown
    if base.exists():
        shutil.rmtree(base)


@pytest.fixture()
def client():
    """
    Creates a TestClient for the FastAPI app.
    Startup event runs and creates DB tables.
    """
    from fastapi.testclient import TestClient
    from app.main import app  # import after env setup

    with TestClient(app) as c:
        yield c
