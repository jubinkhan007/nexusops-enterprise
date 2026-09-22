import os

class Settings:
    PROJECT_NAME: str = "NexusOps AI Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", 5432))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "nexusops_db")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "nexus_admin")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "nexus_secret_123")

    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))

    RABBITMQ_HOST: str = os.getenv("RABBITMQ_HOST", "localhost")

settings = Settings()
