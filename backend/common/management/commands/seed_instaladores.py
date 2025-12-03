from django.core.management.base import BaseCommand
from manufactura.models import Manufactura
from common.fixtures.seed_instaladores import INSTALADORES_DATA


class Command(BaseCommand):
    help = 'Carga personal de manufactura (instaladores y fabricadores) de prueba en la base de datos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Eliminar todo el personal de manufactura antes de cargar nuevos',
        )

    def handle(self, *args, **options):
        if options['delete']:
            count = Manufactura.objects.all().count()
            Manufactura.objects.all().delete()
            self.stdout.write(self.style.SUCCESS(f'✓ {count} registros de manufactura eliminados'))

        created_count = 0
        skipped_count = 0
        errors = []

        self.stdout.write('Cargando personal de manufactura...\n')

        for data in INSTALADORES_DATA:
            documento = data['documento']
            
            # Verificar si ya existe
            if Manufactura.objects.filter(documento=documento).exists():
                skipped_count += 1
                self.stdout.write(
                    self.style.WARNING(f'⊘ {data["nombre"]} {data["apellido"]} ({documento}) - Ya existe')
                )
                continue
            
            try:
                personal = Manufactura.objects.create(**data)
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ {personal.get_full_name()} - {personal.cargo} (ID: {personal.id})')
                )
            except Exception as e:
                skipped_count += 1
                errors.append(f'{documento}: {str(e)}')
                self.stdout.write(self.style.ERROR(f'✗ Error con {documento}: {str(e)}'))

        # Resumen
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS(f'✓ Creados: {created_count}'))
        self.stdout.write(self.style.WARNING(f'⊘ Saltados: {skipped_count}'))
        
        if errors:
            self.stdout.write(self.style.ERROR(f'✗ Errores: {len(errors)}'))
            for error in errors:
                self.stdout.write(f'  - {error}')
        
        self.stdout.write(self.style.SUCCESS('\n✓ Carga completada\n'))

        # Mostrar disponibles por cargo
        self.stdout.write('Personal de Manufactura disponible:')
        self.stdout.write('-' * 70)
        
        fabricadores = Manufactura.objects.filter(cargo='FABRICADOR').order_by('nombre')
        instaladores = Manufactura.objects.filter(cargo='INSTALADOR').order_by('nombre')
        
        self.stdout.write('\n📦 FABRICADORES:')
        for personal in fabricadores:
            estado_icon = '✓' if personal.estado == 'ACTIVO' else '✗'
            self.stdout.write(
                f'  {estado_icon} ID: {personal.id:2d} | {personal.get_full_name():30s} | {personal.documento:15s}'
            )
        
        self.stdout.write('\n🔧 INSTALADORES:')
        for personal in instaladores:
            estado_icon = '✓' if personal.estado == 'ACTIVO' else '✗'
            self.stdout.write(
                f'  {estado_icon} ID: {personal.id:2d} | {personal.get_full_name():30s} | {personal.documento:15s}'
            )
        
        self.stdout.write('-' * 70)
        self.stdout.write(f'Total: {Manufactura.objects.count()} registros\n')
