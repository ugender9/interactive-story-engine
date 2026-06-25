from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # LLM backend: "groq" (default, free), "grok" (xAI), "ollama" (local), "watsonx" (IBM)
    llm_backend: str = "groq"

    # Groq settings (used when llm_backend=groq)
    # Free API key: https://console.groq.com → API Keys
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    groq_base_url: str = "https://api.groq.com/openai/v1"

    # Grok / xAI settings (used when llm_backend=grok)
    grok_api_key: str = ""
    grok_model: str = "grok-3-mini"
    grok_base_url: str = "https://api.x.ai/v1"

    # Ollama settings (used when llm_backend=ollama)
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "granite3.1-dense:2b"

    # watsonx settings (used when llm_backend=watsonx)
    watsonx_api_key: str = ""
    watsonx_project_id: str = ""
    watsonx_url: str = "https://us-south.ml.cloud.ibm.com"
    granite_model_id: str = "ibm/granite-13b-instruct-v2"

    app_env: str = "development"


settings = Settings()
