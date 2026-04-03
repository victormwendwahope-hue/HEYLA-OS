import os
from datetime import timedelta

class Config:
    # Database
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:password@localhost:5432/heyla_os'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security
    SECRET_KEY = 'heyla-super-secret-key-2024'
    JWT_SECRET_KEY = 'jwt-super-secret-key-2024'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # API Key
    API_KEY = 'apimyapiKEY'
    
    # CORS
    CORS_ORIGINS = ['http://localhost:5000', 'http://127.0.0.1:5000']
    
    # Email
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'noreply@heyla.com'
    MAIL_PASSWORD = 'your-email-password'
    
    # Redis (for caching and queues)
    REDIS_URL = 'redis://localhost:6379/0'
