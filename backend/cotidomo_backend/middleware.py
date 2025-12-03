"""
Middleware para manejar bloqueos de SQLite con reintentos
"""
import time
import logging
from django.db import OperationalError, connection
from django.utils.decorators import sync_and_async_middleware

logger = logging.getLogger(__name__)


@sync_and_async_middleware
def sqlite_database_lock_handler(get_response):
    """
    Middleware que maneja bloqueos de SQLite con reintentos
    """
    max_retries = 3
    
    def middleware(request):
        for attempt in range(max_retries):
            try:
                response = get_response(request)
                
                # Cerrar conexión después de la respuesta
                connection.close()
                return response
                
            except OperationalError as e:
                if 'database is locked' in str(e) and attempt < max_retries - 1:
                    wait_time = 0.1 * (2 ** attempt)  # Backoff exponencial: 0.1s, 0.2s, 0.4s
                    logger.warning(
                        f"⚠️ BD bloqueada en {request.path}, reintentando en {wait_time:.2f}s "
                        f"(intento {attempt + 1}/{max_retries})"
                    )
                    # Cerrar conexión antes de reintentar
                    connection.close()
                    time.sleep(wait_time)
                else:
                    logger.error(f"❌ BD bloqueada después de {attempt + 1} intentos en {request.path}")
                    # Cerrar conexión en caso de error
                    connection.close()
                    raise
            except Exception as e:
                logger.error(f"❌ Error procesando solicitud: {str(e)}")
                # Cerrar conexión en caso de error
                connection.close()
                raise
    
    return middleware
