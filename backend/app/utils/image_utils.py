from PIL import Image


def crop_bbox(img: Image.Image, bbox: dict) -> Image.Image:
    """
    bbox expected: {x, y, w, h} in image pixel coordinates.
    """
    x = int(bbox["x"])
    y = int(bbox["y"])
    w = int(bbox["w"])
    h = int(bbox["h"])

    x2 = max(x + w, x + 1)
    y2 = max(y + h, y + 1)

    x = max(x, 0)
    y = max(y, 0)
    x2 = min(x2, img.width)
    y2 = min(y2, img.height)

    return img.crop((x, y, x2, y2))
