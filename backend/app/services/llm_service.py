import base64
from litellm import completion
from app.core.config import settings


def _pick_model(requested: str | None) -> str:
    return (
        requested.strip() if requested and requested.strip() else settings.DEFAULT_MODEL
    )


def _read_image_b64(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def ask_text(model: str, system: str, user: str) -> str:
    resp = completion(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    return resp.choices[0].message["content"]


def ask_image(model: str, system: str, user: str, image_path: str) -> str:
    """
    Uses OpenAI/Anthropic-style multimodal messages via LiteLLM.
    (Works for models that support vision.)
    """
    img_b64 = _read_image_b64(image_path)

    resp = completion(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{img_b64}"},
                    },
                ],
            },
        ],
    )
    return resp.choices[0].message["content"]


def ask(
    model: str | None, prompt_plan: dict, image_path: str | None = None
) -> tuple[str, str]:
    chosen = _pick_model(model)
    system = prompt_plan["system"]
    user = prompt_plan["user"]

    if image_path:
        return chosen, ask_image(chosen, system, user, image_path)
    return chosen, ask_text(chosen, system, user)
