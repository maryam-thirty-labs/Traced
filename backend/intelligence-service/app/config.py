from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    spring_base_url: str = "http://localhost:8080"
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    ncbi_api_key: str = ""
    nhs_api_key: str = ""
    database_url: str = "postgresql://postgres:postgres@localhost:5434/traced"
    redis_url: str = "redis://localhost:6380"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
