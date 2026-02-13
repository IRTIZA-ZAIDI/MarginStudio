import fitz  # PyMuPDF


def get_page_count(pdf_path: str) -> int:
    doc = fitz.open(pdf_path)
    n = doc.page_count
    doc.close()
    return n


def extract_page_text(pdf_path: str, page_number_1idx: int) -> str:
    doc = fitz.open(pdf_path)
    page = doc.load_page(page_number_1idx - 1)
    text = page.get_text("text")
    doc.close()
    return text.strip()


def render_page_to_image(pdf_path: str, page_number_1idx: int, zoom: float = 2.0):
    """
    Returns PIL.Image for the page render.
    """
    from PIL import Image

    doc = fitz.open(pdf_path)
    page = doc.load_page(page_number_1idx - 1)
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    doc.close()
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    return img
