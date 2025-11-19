from .base import *
from decouple import config

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-)s4fsgu^(x+r0sk*%bi7j+3@(y&61!xv%@3$1(9#5$6!!)a!bl')

ALLOWED_HOSTS = ['127.0.0.1', 'localhost']

# Puedes agregar aquí otras configuraciones específicas de desarrollo,
# como por ejemplo, la Django Debug Toolbar.