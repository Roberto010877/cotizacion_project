from .base import *
from decouple import config

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY')

# Aquí deberías poner tu dominio o dominios de producción
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=lambda v: [s.strip() for s in v.split(',')])

# CORS para producción
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', cast=lambda v: [s.strip() for s in v.split(',')])