def build_prompt(user_query: str, selection: dict) -> dict:
    """
    Returns a structured prompt plan:
    - system prompt
    - user prompt
    - metadata (for FE / debugging)
    """
    system = (
        "You are a helpful learning assistant for PDFs and research papers. "
        "Answer ONLY using the provided selection context. "
        "If the selection is insufficient, ask a clarifying question."
    )

    if selection["type"] == "text":
        selected_text = selection.get("content") or ""
        user = (
            f"User question: {user_query}\n\n"
            f"Selected text (page {selection['page']}):\n"
            f"{selected_text}"
        )
        used_context = {
            "type": "text",
            "page": selection["page"],
            "chars": len(selected_text),
        }
        return {"system": system, "user": user, "used_context": used_context}

    # image: prompt without adding the raw image bytes here (LLM service will attach)
    user = (
        f"User question: {user_query}\n\n"
        f"Selected image crop from page {selection['page']}. "
        "Explain what it shows. If it contains math, explain step-by-step."
    )
    used_context = {"type": "image", "page": selection["page"]}
    return {"system": system, "user": user, "used_context": used_context}
