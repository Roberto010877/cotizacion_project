from rest_framework import serializers
from django.db import transaction
from .models import Cotizacion, CotizacionAmbiente, CotizacionItem
from productos_servicios.models import ProductoServicio
from manufactura.models import Manufactura
from core.serializers import UserSerializer

# -----------------------------------------------------------------------------
# 1. ITEM SERIALIZER (Nivel 3)
# -----------------------------------------------------------------------------


class CotizacionItemSerializer(serializers.ModelSerializer):
    """
    Serializador para el detalle de la cotización.
    Se vincula al Ambiente.
    """

    # Campo de solo lectura para el nombre del producto (Frontend)
    producto_nombre = serializers.CharField(
        source='producto.nombre', read_only=True)

    # Campo para la escritura, permitiendo crear el Item con el ID del producto
    producto_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductoServicio.objects.filter(is_active=True),
        source='producto',
        write_only=True
    )
    # Exponemos la unidad de medida para el Frontend
    unidad_medida = serializers.CharField(
        source='producto.unidad_medida', read_only=True)

    class Meta:
        model = CotizacionItem
        fields = [
            'id', 'numero_item', 'producto_id', 'producto_nombre', 'unidad_medida',
            'cantidad', 'ancho', 'alto', 'atributos_seleccionados', 'descripcion_tecnica',
            'precio_unitario', 'porcentaje_descuento', 'precio_total'
        ]
        # descripcion_tecnica y precio_total se generan en el .save() del modelo
        read_only_fields = ['precio_total',
                            'descripcion_tecnica', 'precio_unitario']

# -----------------------------------------------------------------------------
# 2. AMBIENTE SERIALIZER (Nivel 2)
# -----------------------------------------------------------------------------


class CotizacionAmbienteSerializer(serializers.ModelSerializer):
    """
    Serializador para el agrupador lógico (Ambientes).
    Contiene la lista de ítems.
    """

    # Relación de escritura: Un ambiente contiene una lista de items
    items = CotizacionItemSerializer(many=True)

    class Meta:
        model = CotizacionAmbiente
        fields = ['id', 'nombre', 'orden', 'items']
        # El orden puede ser gestionado en el create de la Cotización.
        read_only_fields = ['id']

# -----------------------------------------------------------------------------
# 3. COTIZACION SERIALIZER (Nivel 1)
# -----------------------------------------------------------------------------


class CotizacionSerializer(serializers.ModelSerializer):
    """
    Serializador para el encabezado de la Cotización.
    Contiene la lista de ambientes.
    """

    # Relación de escritura: Una cotización contiene una lista de ambientes
    ambientes = CotizacionAmbienteSerializer(many=True)

    # Campos de solo lectura para visibilidad
    cliente_nombre = serializers.CharField(
        source='cliente.nombre', read_only=True)
    vendedor_nombre = serializers.CharField(
        source='vendedor.nombre', read_only=True, allow_null=True)

    # Campo de escritura para asignar el vendedor (FK a Manufactura)
    vendedor_id = serializers.PrimaryKeyRelatedField(
        queryset=Manufactura.objects.all(),
        source='vendedor',
        write_only=True,
        required=False,
        allow_null=True
    )
    usuario_creacion_detalle = UserSerializer(
        source='usuario_creacion',
        read_only=True
    )

    class Meta:
        model = Cotizacion
        fields = [
            'id', 'numero', 'cliente', 'cliente_nombre', 'vendedor_id', 'vendedor_nombre',
            'fecha_emision', 'fecha_validez', 'estado', 'total_neto', 'descuento_total',
            'total_general', 'created_at', 'updated_at', 'usuario_creacion', 'usuario_creacion_detalle', 'ambientes'
        ]
        read_only_fields = ['numero', 'total_neto', 'total_general', 'fecha_emision', 
                           'created_at', 'updated_at', 'usuario_creacion', 'usuario_creacion_detalle']

    def create(self, validated_data):
        # 1. Extraer los ambientes anidados
        ambientes_data = validated_data.pop('ambientes')
        # 2. Reasignar la instancia de vendedor si vino por ID
        if 'vendedor' in validated_data:
            validated_data['vendedor'] = validated_data.pop('vendedor')

        # 2.5. Asignar usuario de creación desde el contexto del request
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['usuario_creacion'] = request.user

        # 3. Crear el encabezado de la cotización de forma atómica
        with transaction.atomic():
            cotizacion = Cotizacion.objects.create(**validated_data)

            # 4. Iterar sobre los ambientes
            for i, ambiente_data in enumerate(ambientes_data):
                items_data = ambiente_data.pop('items')

                # Crear el ambiente y vincularlo a la cotización
                ambiente = CotizacionAmbiente.objects.create(
                    cotizacion=cotizacion,
                    orden=i + 1,  # Asignamos orden secuencial
                    **ambiente_data
                )

                # 5. Iterar sobre los items dentro del ambiente
                for j, item_data in enumerate(items_data):
                    producto_instance = item_data.pop('producto')
                    # Extraer numero_item si viene en los datos (para evitar duplicación)
                    numero_item = item_data.pop('numero_item', j + 1)

                    # El precio base se toma como SNAPSHOT del catálogo
                    precio_snapshot = producto_instance.precio_base

                    # Crear el item con skip_recalculate=True para evitar múltiples saves
                    item = CotizacionItem(
                        ambiente=ambiente,
                        producto=producto_instance,
                        numero_item=numero_item,
                        precio_unitario=precio_snapshot,  # Precio de lista como snapshot
                        usuario_creacion=request.user if request and hasattr(request, 'user') else None,
                        **item_data
                    )
                    item.save(skip_recalculate=True)

            # 6. Recalcular totales UNA SOLA VEZ al final de la transacción
            # Esto garantiza atomicidad: todo se guarda o nada se guarda
            cotizacion.recalculate_totals()

            return cotizacion

    def update(self, instance, validated_data):
        """
        Actualiza una cotización existente incluyendo sus ambientes e items anidados.
        """
        # Extraer ambientes si vienen en los datos
        ambientes_data = validated_data.pop('ambientes', None)
        
        # Asignar usuario de modificación desde el contexto del request
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['usuario_modificacion'] = request.user
        
        # Manejo de encabezado con atomicidad
        with transaction.atomic():
            # Actualizar campos del encabezado
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            
            # Si se enviaron ambientes, actualizar la estructura completa
            if ambientes_data is not None:
                # Obtener IDs de ambientes que vienen en el request
                ambiente_ids_in_request = []
                
                for i, ambiente_data in enumerate(ambientes_data):
                    items_data = ambiente_data.pop('items', [])
                    ambiente_id = ambiente_data.pop('id', None)  # Extraer ID si existe
                    ambiente_data.pop('orden', None)  # Remover orden si viene del frontend
                    
                    if ambiente_id:
                        # Actualizar ambiente existente
                        try:
                            ambiente = CotizacionAmbiente.objects.get(
                                id=ambiente_id, 
                                cotizacion=instance
                            )
                            ambiente.nombre = ambiente_data.get('nombre', ambiente.nombre)
                            ambiente.orden = i + 1
                            ambiente.save()
                            ambiente_ids_in_request.append(ambiente_id)
                        except CotizacionAmbiente.DoesNotExist:
                            # Si no existe, crear uno nuevo
                            ambiente = CotizacionAmbiente.objects.create(
                                cotizacion=instance,
                                orden=i + 1,
                                **ambiente_data
                            )
                            ambiente_ids_in_request.append(ambiente.id)
                    else:
                        # Crear nuevo ambiente
                        ambiente = CotizacionAmbiente.objects.create(
                            cotizacion=instance,
                            orden=i + 1,
                            **ambiente_data
                        )
                        ambiente_ids_in_request.append(ambiente.id)
                    
                    # Procesar items del ambiente
                    item_ids_in_request = []
                    for j, item_data in enumerate(items_data):
                        producto_instance = item_data.pop('producto', None)
                        item_id = item_data.pop('id', None)  # Extraer ID si existe
                        item_data.pop('numero_item', None)  # Remover numero_item si viene del frontend
                        
                        if item_id:
                            # Actualizar item existente
                            try:
                                item = CotizacionItem.objects.get(
                                    id=item_id,
                                    ambiente=ambiente
                                )
                                # Actualizar campos del item
                                if producto_instance:
                                    item.producto = producto_instance
                                    item.precio_unitario = producto_instance.precio_base
                                
                                for field in ['cantidad', 'ancho', 'alto', 'porcentaje_descuento', 
                                            'atributos_seleccionados']:
                                    if field in item_data:
                                        setattr(item, field, item_data[field])
                                
                                item.numero_item = j + 1
                                item.save(skip_recalculate=True)
                                item_ids_in_request.append(item_id)
                            except CotizacionItem.DoesNotExist:
                                # Si no existe, crear uno nuevo
                                if not producto_instance:
                                    continue
                                item = CotizacionItem(
                                    ambiente=ambiente,
                                    producto=producto_instance,
                                    numero_item=j + 1,
                                    precio_unitario=producto_instance.precio_base,
                                    usuario_creacion=request.user if request and hasattr(request, 'user') else None,
                                    **item_data
                                )
                                item.save(skip_recalculate=True)
                                item_ids_in_request.append(item.id)
                        else:
                            # Crear nuevo item
                            if not producto_instance:
                                continue
                            item = CotizacionItem(
                                ambiente=ambiente,
                                producto=producto_instance,
                                numero_item=j + 1,
                                precio_unitario=producto_instance.precio_base,
                                usuario_creacion=request.user if request and hasattr(request, 'user') else None,
                                **item_data
                            )
                            item.save(skip_recalculate=True)
                            item_ids_in_request.append(item.id)
                    
                    # Eliminar items que no están en el request
                    CotizacionItem.objects.filter(
                        ambiente=ambiente
                    ).exclude(id__in=item_ids_in_request).delete()
                
                # Eliminar ambientes que no están en el request
                CotizacionAmbiente.objects.filter(
                    cotizacion=instance
                ).exclude(id__in=ambiente_ids_in_request).delete()
            
            # Recalcular totales después de actualizar
            instance.recalculate_totals()

        return instance
