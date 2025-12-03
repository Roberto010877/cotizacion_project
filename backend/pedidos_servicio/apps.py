from django.apps import AppConfig


class PedidosServicioConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pedidos_servicio'
    
    def ready(self):
        """Importar signals cuando la app está lista"""
        import pedidos_servicio.signals  # noqa: F401