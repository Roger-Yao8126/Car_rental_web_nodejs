"""Flask config class."""
import os

class Config:
    """Base config vars."""
    TESTING = os.environ.get('TESTING')
    DEBUG = os.environ.get('DEBUG')
    FLASK_ENV = os.environ.get('FLASK_ENV')
    DATABASE_URI = os.environ.get('DATABASE_URI')
    JWT_SECRET = os.environ.get('JWT_SECRET')

class ProdConfig(Config):
    DEBUG = False
    TESTING = False


class DevConfig(Config):
    DEBUG = True
    TESTING = True