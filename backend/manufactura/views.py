from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .permissions import (
    CanViewManufactura,
    CanCreateManufactura,
    CanEditManufactura,
    CanDeleteManufactura,
)
from django.conf import settings
from django.utils.crypto import get_random_string
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import transaction, OperationalError
from django.db.utils import OperationalError as DjangoOperationalError
import time

from .models import Manufactura
from .serializers import (
    ManufacturaBasicSerializer,
    ManufacturaListSerializer,
    ManufacturaDetailSerializer,
    ManufacturaCreateUpdateSerializer,
)
from common.email_utils import send_installer_access_email

User = get_user_model()


class ManufacturaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar Personal de Manufactura

    Acciones disponibles:
    - list: Listar todo el personal
    - create: Crear nuevo personal
    - retrieve: Obtener detalles de una persona
    - update: Actualizar una persona
    - partial_update: Actualizar parcialmente una persona
    - destroy: Eliminar una persona
    - disponibles: Listar solo personal disponible
    - por_especialidad: Filtrar por especialidad
    """
    queryset = Manufactura.objects.all()
    # Por defecto, se sobrescribe en get_permissions
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['estado', 'especialidad', 'ciudad']
    search_fields = ['nombre', 'apellido', 'documento', 'email', 'telefono']
    ordering_fields = ['nombre', 'fecha_contratacion',
                       'calificacion', 'total_instalaciones']
    ordering = ['nombre']

    def get_permissions(self):
        """
        Permisos granulares según la acción.

        - list, retrieve: Requieren permiso view_manufactura
        - create: Requiere permiso de creación
        - update, partial_update: Requiere permiso de edición
        - destroy: Requiere permiso de eliminación
        """
        if self.action in ['list', 'retrieve']:
            # Usuarios con permiso pueden ver lista (get_queryset filtra por estado)
            permission_classes = [
                permissions.IsAuthenticated, CanViewManufactura]
        elif self.action == 'create':
            permission_classes = [
                permissions.IsAuthenticated, CanCreateManufactura]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [
                permissions.IsAuthenticated, CanEditManufactura]
        elif self.action == 'destroy':
            permission_classes = [
                permissions.IsAuthenticated, CanDeleteManufactura]
        else:
            # Otras acciones personalizadas requieren permiso de visualización
            permission_classes = [
                permissions.IsAuthenticated, CanViewManufactura]

        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        """Retornar serializador según la acción"""
        if self.action == 'list':
            return ManufacturaListSerializer
        elif self.action == 'retrieve':
            return ManufacturaDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ManufacturaCreateUpdateSerializer
        else:
            return ManufacturaBasicSerializer

    def get_queryset(self):
        """Filtrar queryset según permisos del usuario y parámetros"""
        queryset = super().get_queryset()

        # Filtrar por cargo si se proporciona el parámetro
        cargo = self.request.query_params.get('cargo')
        if cargo:
            queryset = queryset.filter(cargo=cargo)

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
        estados_validos = [choice[0]
                           for choice in Instalador.EstadoInstalador.choices]
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

    @action(detail=True, methods=['post'])
    def crear_acceso(self, request, pk=None):
        """
        Crear acceso de login para un personal de manufactura.
        Asigna automáticamente el grupo según el cargo (MANUFACTURADOR o INSTALADOR).

        POST /api/v1/manufactura/{id}/crear_acceso/
        """
        personal = self.get_object()

        # Verificar si ya tiene usuario
        if personal.usuario:
            return Response(
                {'detail': 'Este personal ya tiene acceso de usuario'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generar username (email sin @dominio)
        username_base = personal.email.split('@')[0]
        username = username_base
        counter = 1

        # Si el username ya existe, agregar número
        while User.objects.filter(username=username).exists():
            username = f"{username_base}{counter}"
            counter += 1

        # Generar contraseña aleatoria
        password = get_random_string(12)

        # Reintentar hasta 3 veces si hay lock de base de datos
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Usar transacción atómica con timeout
                with transaction.atomic():
                    # Crear usuario
                    usuario = User.objects.create_user(
                        username=username,
                        email=personal.email,
                        password=password,
                        first_name=personal.nombre,
                        last_name=personal.apellido
                    )

                    # Asignar grupo según cargo
                    grupo_nombre = 'instalador' if personal.cargo == 'INSTALADOR' else 'manufacturador'
                    try:
                        grupo = Group.objects.get(name=grupo_nombre)
                        usuario.groups.add(grupo)
                        grupo_asignado = grupo_nombre
                    except Group.DoesNotExist:
                        # Si el grupo no existe, lo creamos
                        grupo = Group.objects.create(name=grupo_nombre)
                        usuario.groups.add(grupo)
                        grupo_asignado = f"{grupo_nombre} (nuevo)"

                    # Vincular usuario con personal de manufactura
                    personal.usuario = usuario
                    personal.save()

                # Si llegamos aquí, la transacción fue exitosa
                # Enviar email con credenciales (fuera de la transacción)
                try:
                    email_sent = send_installer_access_email(
                        personal, username, password)
                except:
                    email_sent = False

                return Response({
                    'detail': 'Acceso de usuario creado exitosamente',
                    'usuario': {
                        'username': username,
                        'email': usuario.email,
                        'grupo': grupo_asignado,
                    },
                    'email_sent': email_sent,
                    'message': f'Usuario creado y asignado al grupo "{grupo_asignado}". Las credenciales han sido enviadas por email.' if email_sent else 'Usuario creado pero hubo un problema al enviar el email'
                }, status=status.HTTP_201_CREATED)

            except (OperationalError, DjangoOperationalError) as e:
                if 'database is locked' in str(e).lower() and attempt < max_retries - 1:
                    # Esperar un poco antes de reintentar
                    time.sleep(0.5 * (attempt + 1))
                    continue
                else:
                    # Si es el último intento o no es error de lock
                    return Response(
                        {'detail': f'Error al crear usuario: Base de datos temporalmente ocupada. Intente nuevamente en unos segundos.'},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE
                    )
            except Exception as e:
                return Response(
                    {'error': f'Error al crear el usuario: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
