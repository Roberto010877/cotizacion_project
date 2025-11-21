from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Instalador
from .serializers import (
    InstaladorBasicSerializer,
    InstaladorListSerializer,
    InstaladorDetailSerializer,
    InstaladorCreateUpdateSerializer,
)


class InstaladorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Instaladores
    
    Acciones disponibles:
    - list: Listar todos los instaladores
    - create: Crear nuevo instalador
    - retrieve: Obtener detalles de un instalador
    - update: Actualizar un instalador
    - partial_update: Actualizar parcialmente un instalador
    - destroy: Eliminar un instalador
    - disponibles: Listar solo instaladores disponibles
    - por_especialidad: Filtrar por especialidad
    """
    queryset = Instalador.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['estado', 'especialidad', 'ciudad']
    search_fields = ['nombre', 'apellido', 'documento', 'email', 'telefono']
    ordering_fields = ['nombre', 'fecha_contratacion', 'calificacion', 'total_instalaciones']
    ordering = ['nombre']

    def get_serializer_class(self):
        """Retornar serializador según la acción"""
        if self.action == 'list':
            return InstaladorListSerializer
        elif self.action == 'retrieve':
            return InstaladorDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return InstaladorCreateUpdateSerializer
        else:
            return InstaladorBasicSerializer

    def get_queryset(self):
        """Filtrar queryset según permisos del usuario"""
        queryset = super().get_queryset()
        # Admin puede ver todos
        if self.request.user.is_staff:
            return queryset
        # Otros usuarios solo ven instaladores activos
        return queryset.filter(estado='ACTIVO')

    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """
        Retornar solo instaladores disponibles
        GET /api/v1/instaladores/disponibles/
        """
        queryset = self.get_queryset().filter(estado='ACTIVO')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def por_especialidad(self, request):
        """
        Filtrar instaladores por especialidad
        GET /api/v1/instaladores/por_especialidad/?especialidad=CORTINAS
        """
        especialidad = request.query_params.get('especialidad')
        if not especialidad:
            return Response(
                {'error': 'Se requiere parámetro "especialidad"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(especialidad=especialidad)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):
        """
        Cambiar estado del instalador
        POST /api/v1/instaladores/{id}/cambiar_estado/
        Body: {"estado": "INACTIVO"}
        """
        instalador = self.get_object()
        nuevo_estado = request.data.get('estado')
        
        if not nuevo_estado:
            return Response(
                {'error': 'Se requiere campo "estado"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que sea un estado válido
        estados_validos = [choice[0] for choice in Instalador.EstadoInstalador.choices]
        if nuevo_estado not in estados_validos:
            return Response(
                {'error': f'Estado inválido. Válidos: {", ".join(estados_validos)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instalador.estado = nuevo_estado
        instalador.save()
        
        serializer = self.get_serializer(instalador)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def incrementar_instalaciones(self, request, pk=None):
        """
        Incrementar contador de instalaciones completadas
        POST /api/v1/instaladores/{id}/incrementar_instalaciones/
        """
        instalador = self.get_object()
        instalador.total_instalaciones += 1
        instalador.save()
        
        serializer = self.get_serializer(instalador)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def actualizar_calificacion(self, request, pk=None):
        """
        Actualizar calificación del instalador
        PATCH /api/v1/instaladores/{id}/actualizar_calificacion/
        Body: {"calificacion": 4.5}
        """
        instalador = self.get_object()
        calificacion = request.data.get('calificacion')
        
        if calificacion is None:
            return Response(
                {'error': 'Se requiere campo "calificacion"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            calificacion = float(calificacion)
            if calificacion < 0 or calificacion > 5:
                raise ValueError()
        except (TypeError, ValueError):
            return Response(
                {'error': 'La calificación debe ser un número entre 0 y 5'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instalador.calificacion = calificacion
        instalador.save()
        
        serializer = self.get_serializer(instalador)
        return Response(serializer.data)
