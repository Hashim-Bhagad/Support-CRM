from app.config import settings
print(settings.secret_key[:8], settings.database_url, settings.admin_email, settings.admin_password)