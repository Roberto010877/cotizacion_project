# common/management/commands/seed_clientes.py
from django.core.management.base import BaseCommand
from django.db import transaction
from clientes.models import Cliente, Pais, TipoDocumentoConfig
from common.fixtures.seed_clientes import CLIENTES_DATA

class Command(BaseCommand):
    help = 'Carga datos de prueba de clientes desde fixtures'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Eliminar clientes existentes antes de cargar nuevos',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        clear = options.get('clear', False)
        
        # Limpieza opcional
        if clear:
            Cliente.objects.all().delete()
            self.stdout.write(self.style.WARNING('🗑️  Se eliminaron todos los clientes existentes'))

        # Mapa de códigos de país a objeto Pais
        paises_map = {}
        for pais in Pais.objects.filter(is_active=True):
            paises_map[pais.codigo] = pais

        # Mapa de tipos de documento
        tipos_doc_map = {}
        for tipo in TipoDocumentoConfig.objects.filter(is_active=True):
            key = f"{tipo.pais.codigo}_{tipo.codigo}"
            tipos_doc_map[key] = tipo

        # Cargar clientes
        clientes_creados = 0
        clientes_duplicados = 0
        errores = 0

        for cliente_data in CLIENTES_DATA:
            try:
                pais_codigo = cliente_data.pop('pais')
                tipo_doc_codigo = cliente_data.pop('tipo_documento')
                numero_documento = cliente_data.pop('numero_documento')
                
                # Obtener objetos relacionados
                pais = paises_map.get(pais_codigo)
                if not pais:
                    self.stdout.write(
                        self.style.ERROR(f"❌ País no encontrado: {pais_codigo}")
                    )
                    errores += 1
                    continue

                tipo_doc_key = f"{pais_codigo}_{tipo_doc_codigo}"
                tipo_documento = tipos_doc_map.get(tipo_doc_key)
                if not tipo_documento:
                    self.stdout.write(
                        self.style.ERROR(
                            f"❌ Tipo de documento no encontrado: {tipo_doc_codigo} para {pais_codigo}"
                        )
                    )
                    errores += 1
                    continue

                # Crear o actualizar cliente sin validación
                try:
                    cliente = Cliente.objects.get(
                        numero_documento=numero_documento,
                        tipo_documento=tipo_documento,
                        pais=pais
                    )
                    clientes_duplicados += 1
                    self.stdout.write(
                        self.style.WARNING(f"⚠️  Cliente ya existe: {cliente.nombre}")
                    )
                except Cliente.DoesNotExist:
                    cliente = Cliente(
                        numero_documento=numero_documento,
                        tipo_documento=tipo_documento,
                        pais=pais,
                        **cliente_data
                    )
                    cliente.full_clean()
                    cliente.save()
                    clientes_creados += 1
                    self.stdout.write(
                        self.style.SUCCESS(f"✅ Cliente creado: {cliente.nombre}")
                    )

            except Exception as e:
                errores += 1
                self.stdout.write(
                    self.style.ERROR(f"❌ Error al crear cliente: {str(e)}")
                )

        # Resumen
        self.stdout.write("\n" + "="*70)
        self.stdout.write(self.style.SUCCESS("📊 RESUMEN DE CARGA"))
        self.stdout.write("="*70)
        self.stdout.write(self.style.SUCCESS(f"✅ Clientes creados: {clientes_creados}"))
        self.stdout.write(self.style.WARNING(f"⚠️  Clientes duplicados: {clientes_duplicados}"))
        self.stdout.write(self.style.ERROR(f"❌ Errores: {errores}"))
        self.stdout.write(self.style.SUCCESS(f"📈 Total de clientes: {Cliente.objects.count()}"))
        self.stdout.write("="*70)
