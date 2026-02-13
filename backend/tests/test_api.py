# tests/test_api.py
import io
import os
import pytest


def make_pdf_bytes(text: str = "Hello PDF", pages: int = 1) -> bytes:
    """
    Creates a simple PDF in-memory using PyMuPDF.
    """
    import fitz  # PyMuPDF

    doc = fitz.open()
    for i in range(pages):
        page = doc.new_page()
        page.insert_text((72, 72), f"{text} (page {i+1})")
        # draw a visible rectangle too (helps for crop tests)
        rect = fitz.Rect(50, 120, 300, 220)
        page.draw_rect(rect, color=(1, 0, 0), width=2)
    out = doc.tobytes()
    doc.close()
    return out


class _FakeChoice:
    def __init__(self, content: str):
        self.message = {"content": content}


class _FakeResp:
    def __init__(self, content: str):
        self.choices = [_FakeChoice(content)]


@pytest.fixture()
def mock_litellm(monkeypatch):
    """
    Patch app.services.llm_service.completion (imported as `completion`)
    so /ask doesn't call any real provider.
    """

    def _fake_completion(*args, **kwargs):
        # Return different text based on whether it's multimodal
        messages = kwargs.get("messages", [])
        # if user content is list => image+text message in our code
        try:
            user_content = messages[-1]["content"]
            if isinstance(user_content, list):
                return _FakeResp("FAKE_IMAGE_ANSWER")
        except Exception:
            pass
        return _FakeResp("FAKE_TEXT_ANSWER")

    import app.services.llm_service as llm_service

    monkeypatch.setattr(llm_service, "completion", _fake_completion)


def upload_sample_pdf(client, pages: int = 2):
    pdf_bytes = make_pdf_bytes("Test Document", pages=pages)
    files = {"file": ("sample.pdf", pdf_bytes, "application/pdf")}
    resp = client.post("/api/upload", files=files)
    assert resp.status_code == 200, resp.text
    return resp.json()


def test_upload_and_get_document(client):
    out = upload_sample_pdf(client, pages=2)
    assert "doc_id" in out
    assert out["filename"] == "sample.pdf"
    assert out["pages"] == 2

    doc_id = out["doc_id"]
    resp = client.get(f"/api/documents/{doc_id}")
    assert resp.status_code == 200
    doc = resp.json()
    assert doc["id"] == doc_id
    assert doc["pages"] == 2


def test_get_page_text(client):
    out = upload_sample_pdf(client, pages=2)
    doc_id = out["doc_id"]

    resp = client.get(f"/api/documents/{doc_id}/page/1/text")
    assert resp.status_code == 200
    data = resp.json()
    assert data["doc_id"] == doc_id
    assert data["page"] == 1
    assert "Test Document (page 1)" in data["text"]


def test_ask_text_with_content(client, mock_litellm):
    out = upload_sample_pdf(client, pages=1)
    doc_id = out["doc_id"]

    payload = {
        "model": "gpt-4o-mini",
        "document_id": doc_id,
        "user_query": "Explain this",
        "selection": {"type": "text", "page": 1, "content": "Some selected snippet"},
    }
    resp = client.post("/api/ask", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["model"] == "gpt-4o-mini"
    assert data["answer"] == "FAKE_TEXT_ANSWER"
    assert data["used_context"]["type"] == "text"
    assert data["used_context"]["page"] == 1


def test_ask_text_without_content_falls_back_to_page_text(client, mock_litellm):
    out = upload_sample_pdf(client, pages=1)
    doc_id = out["doc_id"]

    payload = {
        "model": "gpt-4o-mini",
        "document_id": doc_id,
        "user_query": "Explain page",
        "selection": {
            "type": "text",
            "page": 1,
            # no content
        },
    }
    resp = client.post("/api/ask", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["answer"] == "FAKE_TEXT_ANSWER"
    assert data["used_context"]["type"] == "text"
    assert data["used_context"]["page"] == 1


def test_ask_image_requires_document_id(client, mock_litellm):
    payload = {
        "model": "gpt-4o-mini",
        "user_query": "Explain this crop",
        "selection": {
            "type": "image",
            "page": 1,
            "bbox": {"x": 10, "y": 10, "w": 100, "h": 100},
        },
    }
    resp = client.post("/api/ask", json=payload)
    assert resp.status_code == 400
    assert "document_id required" in resp.text


def test_ask_image_requires_bbox(client, mock_litellm):
    out = upload_sample_pdf(client, pages=1)
    doc_id = out["doc_id"]

    payload = {
        "model": "gpt-4o-mini",
        "document_id": doc_id,
        "user_query": "Explain this crop",
        "selection": {
            "type": "image",
            "page": 1,
            # missing bbox
        },
    }
    resp = client.post("/api/ask", json=payload)
    assert resp.status_code == 400
    assert "selection.bbox required" in resp.text


def test_ask_image_crop_success(client, mock_litellm):
    out = upload_sample_pdf(client, pages=1)
    doc_id = out["doc_id"]

    # bbox is in rendered image pixel coords; any valid box is ok for test
    payload = {
        "model": "gpt-4o-mini",
        "document_id": doc_id,
        "user_query": "Explain this diagram",
        "selection": {
            "type": "image",
            "page": 1,
            "bbox": {"x": 50, "y": 50, "w": 300, "h": 200},
        },
    }
    resp = client.post("/api/ask", json=payload)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["answer"] == "FAKE_IMAGE_ANSWER"
    assert data["used_context"]["type"] == "image"
    assert data["used_context"]["page"] == 1

    # ensure a crop was actually saved in IMAGE_DIR
    img_dir = os.environ["IMAGE_DIR"]
    saved = [f for f in os.listdir(img_dir) if f.endswith(".png")]
    assert len(saved) >= 1
