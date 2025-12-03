"""
Constantes y configuraciones para la app pedidos_servicio.

Este módulo centraliza todas las constantes, estados, transiciones
y configuraciones utilizadas en el flujo de pedidos de servicio.
"""

# Estados que puede modificar cada tipo de usuario
ESTADOS_PERMITIDOS_PARA_FABRICADOR = ['EN_FABRICACION', 'CANCELADO']
ESTADOS_PERMITIDOS_PARA_INSTALADOR = ['LISTO_INSTALAR', 'INSTALADO', 'COMPLETADO']

# Transiciones válidas de estado (desde -> hacia)
TRANSICIONES_ESTADO_VALIDAS = {
    'ENVIADO': ['ACEPTADO', 'RECHAZADO'],
    'ACEPTADO': ['EN_FABRICACION', 'CANCELADO'],
    'EN_FABRICACION': ['LISTO_INSTALAR', 'CANCELADO'],
    'LISTO_INSTALAR': ['INSTALADO', 'CANCELADO'],
    'INSTALADO': ['COMPLETADO'],
    'RECHAZADO': [],  # Estado terminal
    'CANCELADO': [],  # Estado terminal
    'COMPLETADO': [],  # Estado terminal
}

# Estados que requieren notificación por email al fabricador
ESTADOS_NOTIFICACION_FABRICADOR = ['EN_FABRICACION', 'CANCELADO']

# Estados que requieren notificación por email al instalador
ESTADOS_NOTIFICACION_INSTALADOR = ['LISTO_INSTALAR', 'INSTALADO', 'COMPLETADO']

# Estados considerados "próximos a ejecutar" (para endpoint proximamente)
ESTADOS_PROXIMOS = ['ACEPTADO', 'ENVIADO']

# Mensajes de estado en español
MENSAJES_ESTADO = {
    'ENVIADO': 'El pedido ha sido enviado',
    'ACEPTADO': 'El pedido ha sido aceptado',
    'EN_FABRICACION': 'El pedido ha entrado en fabricación',
    'LISTO_INSTALAR': 'El pedido está listo para instalar',
    'INSTALADO': 'El pedido ha sido instalado',
    'COMPLETADO': 'El pedido ha sido completado',
    'RECHAZADO': 'El pedido ha sido rechazado',
    'CANCELADO': 'El pedido ha sido cancelado',
}

# Configuración de retry para database locks
DB_LOCK_MAX_RETRIES = 3
DB_LOCK_RETRY_BASE_DELAY = 0.5  # segundos

# Configuración de paginación
PEDIDOS_PER_PAGE = 25
PEDIDOS_MAX_PER_PAGE = 100

# Días para considerar "próximamente" en el endpoint
DIAS_PROXIMAMENTE = 7
