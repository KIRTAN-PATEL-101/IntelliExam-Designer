import os
from typing import List, Dict, Any

try:
    from google import generativeai
except Exception:
    generativeai = None

def configure(api_key: str):
    """
    Configure the Gemini / Google Generative AI client.
    Provide api_key (set GEMINI_API_KEY in environment).
    """
    if not generativeai:
        raise RuntimeError("google-generative-ai is not installed. pip install google-generative-ai")
    if not api_key:
        raise RuntimeError("No API key provided for Gemini (GEMINI_API_KEY).")
    generativeai.configure(api_key=api_key)

def chat_completion(messages: List[Dict[str, str]], model: str = "models/chat-bison-001") -> str:
    """
    messages: list of {"role": "system|user|assistant", "content": "..."}
    model: Gemini model identifier (default is text/chat-bison style placeholder)
    Returns the assistant text content (string).
    """
    if not generativeai:
        raise RuntimeError("google-generative-ai is not installed. pip install google-generative-ai")

    # Convert to the API format expected by google.generativeai (role/content)
    api_messages = []
    for m in messages:
        role = m.get("role", "user")
        content = m.get("content") if "content" in m else m.get("text", "")
        api_messages.append({"role": role, "content": content})

    # Use chat completions API
    resp = generativeai.chat.completions.create(
        model=model,
        messages=api_messages
    )

    # Try a few ways to extract response text (different client versions)
    if hasattr(resp, "candidates") and resp.candidates:
        candidate = resp.candidates[0]
        # candidate may have 'content' or 'message' fields
        if hasattr(candidate, "content"):
            return candidate.content if isinstance(candidate.content, str) else getattr(candidate.content, "text", str(candidate.content))
        if isinstance(candidate, dict):
            return candidate.get("content") or (candidate.get("message") or {}).get("content", "")
    # older versions sometimes expose last
    if hasattr(resp, "last"):
        return getattr(resp, "last")
    # fallback to dict
    try:
        d = resp.to_dict()
        c = d.get("candidates", [])
        if c:
            c0 = c[0]
            return c0.get("content") or (c0.get("message") or {}).get("content", "")
    except Exception:
        pass

    return str(resp)