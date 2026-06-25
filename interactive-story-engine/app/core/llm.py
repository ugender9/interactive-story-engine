from __future__ import annotations

from functools import lru_cache
from typing import Any

from app.core.config import settings


@lru_cache(maxsize=1)
def get_llm() -> Any:
    """Return a configured LLM instance (cached singleton).

    Selects backend based on LLM_BACKEND env var:
      - "groq"     → Groq cloud, OpenAI-compatible, free (default)
                     Free key: https://console.groq.com
      - "grok"     → xAI Grok API, OpenAI-compatible
                     Free key: https://console.x.ai
      - "ollama"   → local model via Ollama (no account needed)
      - "watsonx"  → IBM watsonx.ai cloud
    """
    backend = settings.llm_backend.lower()

    if backend == "groq":
        try:
            from langchain_openai import ChatOpenAI  # noqa: PLC0415
        except ImportError as exc:
            raise RuntimeError(
                "langchain-openai is required for the Groq backend. "
                "Install it with: pip install langchain-openai"
            ) from exc
        return ChatOpenAI(
            model=settings.groq_model,
            api_key=settings.groq_api_key,
            base_url=settings.groq_base_url,
            temperature=0.7,
            max_tokens=512,
        )

    if backend == "grok":
        try:
            from langchain_openai import ChatOpenAI  # noqa: PLC0415
        except ImportError as exc:
            raise RuntimeError(
                "langchain-openai is required for the Grok backend. "
                "Install it with: pip install langchain-openai"
            ) from exc
        return ChatOpenAI(
            model=settings.grok_model,
            api_key=settings.grok_api_key,
            base_url=settings.grok_base_url,
            temperature=0.7,
            max_tokens=512,
        )

    if backend == "ollama":
        try:
            from langchain_ollama import OllamaLLM  # noqa: PLC0415
        except ImportError as exc:
            raise RuntimeError(
                "langchain-ollama is required for the Ollama backend. "
                "Install it with: pip install langchain-ollama"
            ) from exc
        return OllamaLLM(
            model=settings.ollama_model,
            base_url=settings.ollama_base_url,
            temperature=0.7,
            num_predict=512,
        )

    if backend == "watsonx":
        try:
            from langchain_ibm import WatsonxLLM  # noqa: PLC0415
        except ImportError as exc:
            raise RuntimeError(
                "langchain-ibm is required for the watsonx backend. "
                "Install it with: pip install langchain-ibm"
            ) from exc
        return WatsonxLLM(
            model_id=settings.granite_model_id,
            url=settings.watsonx_url,
            apikey=settings.watsonx_api_key,
            project_id=settings.watsonx_project_id,
            params={
                "max_new_tokens": 512,
                "temperature": 0.7,
                "top_p": 0.9,
            },
        )

    raise ValueError(
        f"Unknown LLM_BACKEND '{backend}'. Valid options: 'grok', 'ollama', 'watsonx'."
    )
