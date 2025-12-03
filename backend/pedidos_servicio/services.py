"""
Servicios de lógica de negocio para pedidos_servicio.

Este módulo contiene la lógica de negocio reutilizable, separada de los views.
Incluye funciones para validaciones, cálculos y operaciones con reintentos.
"""

import time
import logging
from django.db import transaction, OperationalError
from django.db.models import Max
from .models import ItemPedidoServicio
from .constants import (
    TRANSICIONES_ESTADO_VALIDAS,
    DB_LOCK_MAX_RETRIES,
    DB_LOCK_RETRY_BASE_DELAY
)

logger = logging.getLogger(__name__)


class PedidoServicioService:
    """Servicio con lógica de negocio para Pedidos de Servicio"""
    
    @staticmethod
    def get_next_numero_item(pedido_id):
        """
        Calcula el siguiente número de item para un pedido.
        
        Args:
            pedido_id: ID del pedido de servicio
            
        Returns:
            int: Siguiente número de item disponible
        """
        max_item = ItemPedidoServicio.objects.filter(
            pedido_servicio_id=pedido_id
        ).aggregate(Max('numero_item'))['numero_item__max']
        
        return (max_item or 0) + 1
    
    @staticmethod
    def validate_state_transition(current_state, new_state):
        """
        Valida que una transición de estado sea permitida.
        
        Args:
            current_state: Estado actual del pedido
            new_state: Estado al que se quiere cambiar
            
        Returns:
            tuple: (is_valid: bool, error_message: str or None)
        """
        if current_state not in TRANSICIONES_ESTADO_VALIDAS:
            return False, f"Estado actual '{current_state}' no es válido"
        
        allowed_states = TRANSICIONES_ESTADO_VALIDAS[current_state]
        
        if not allowed_states:
            return False, f"El estado '{current_state}' es terminal y no puede cambiar"
        
        if new_state not in allowed_states:
            return False, f"No se puede cambiar de '{current_state}' a '{new_state}'"
        
        return True, None
    
    @staticmethod
    def save_with_retry(serializer, max_retries=None, retry_delay=None):
        """
        Guarda un serializer con reintentos para manejar database locks.
        
        Args:
            serializer: Serializer de Django REST Framework
            max_retries: Número máximo de reintentos (default: DB_LOCK_MAX_RETRIES)
            retry_delay: Delay base entre reintentos (default: DB_LOCK_RETRY_BASE_DELAY)
            
        Raises:
            OperationalError: Si falla después de todos los reintentos
        """
        max_retries = max_retries or DB_LOCK_MAX_RETRIES
        retry_delay = retry_delay or DB_LOCK_RETRY_BASE_DELAY
        
        for attempt in range(max_retries):
            try:
                with transaction.atomic():
                    serializer.save()
                logger.info(f"✅ Guardado exitoso en intento {attempt + 1}")
                return
            except OperationalError as e:
                if 'database is locked' in str(e) and attempt < max_retries - 1:
                    wait_time = retry_delay * (attempt + 1)
                    logger.warning(
                        f"⚠️ BD bloqueada, reintentando en {wait_time}s "
                        f"(intento {attempt + 1}/{max_retries})"
                    )
                    time.sleep(wait_time)
                else:
                    logger.error(f"❌ Error después de {attempt + 1} intentos: {str(e)}")
                    raise
            except Exception as e:
                logger.error(f"❌ Error guardando: {str(e)}")
                raise


class ItemPedidoServicioService:
    """Servicio con lógica de negocio para Items de Pedidos"""
    
    @staticmethod
    def update_with_retry(serializer, max_retries=None, retry_delay=None):
        """
        Actualiza un item con reintentos para manejar database locks.
        
        Args:
            serializer: Serializer del item
            max_retries: Número máximo de reintentos
            retry_delay: Delay base entre reintentos
        """
        return PedidoServicioService.save_with_retry(
            serializer, 
            max_retries, 
            retry_delay
        )
