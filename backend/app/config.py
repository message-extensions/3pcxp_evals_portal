"""Application configuration using Pydantic Settings."""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Azure AD / Microsoft Entra
    azure_client_id: str
    azure_client_secret: str
    azure_tenant_id: str
    azure_redirect_uri: str = "http://localhost:8000/api/auth/callback"
    azure_scope: str = "User.Read email"  # Don't include openid/profile - MSAL adds them automatically
    
    @property
    def azure_authority(self) -> str:
        """Construct Azure AD authority URL."""
        return f"https://login.microsoftonline.com/{self.azure_tenant_id}"
    
    # Application Security
    secret_key: str
    environment: str = "development"
    
    # CORS Configuration
    allowed_origins: str = "http://localhost:8000,http://127.0.0.1:8000"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse allowed origins from comma-separated string."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    # Storage Configuration
    data_dir: str = "./data"
    backup_enabled: bool = True
    backup_retention_days: int = 30
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True
    log_level: str = "INFO"
    
    # Feature Flags
    enable_api_docs: bool = True
    enable_metrics: bool = True
    
    # Session Configuration
    session_lifetime_hours: int = 24
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


# Global settings instance
settings = Settings()
