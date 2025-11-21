from django.core.management.base import BaseCommand
from instaladores.models import Instalador
from common.fixtures.seed_instaladores import INSTALADORES_DATA


class Command(BaseCommand):
    help = 'Carga instaladores de prueba en la base de datos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Eliminar todos los instaladores antes de cargar nuevos',
        )

    def handle(self, *args, **options):
        if options['delete']:
            count = Instalador.objects.all().count()
            Instalador.objects.all().delete()
            self.stdout.write(self.style.SUCCESS(f'✓ {count} instaladores eliminados'))

        created_count = 0
        skipped_count = 0
        errors = []

        self.stdout.write('Cargando instaladores...\n')

        for data in INSTALADORES_DATA:
            documento = data['documento']
            
            # Verificar si ya existe
            if Instalador.objects.filter(documento=documento).exists():
                skipped_count += 1
                self.stdout.write(
                    self.style.WARNING(f'⊘ {data["nombre"]} {data["apellido"]} ({documento}) - Ya existe')
                )
                continue
            
            try:
                instalador = Instalador.objects.create(**data)
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ {instalador.get_full_name()} (ID: {instalador.id})')
                )
            except Exception as e:
                skipped_count += 1
                errors.append(f'{documento}: {str(e)}')
                self.stdout.write(self.style.ERROR(f'✗ Error con {documento}: {str(e)}'))

        # Resumen
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS(f'✓ Creados: {created_count}'))
        self.stdout.write(self.style.WARNING(f'⊘ Saltados: {skipped_count}'))
        
        if errors:
            self.stdout.write(self.style.ERROR(f'✗ Errores: {len(errors)}'))
            for error in errors:
                self.stdout.write(f'  - {error}')
        
        self.stdout.write(self.style.SUCCESS('\n✓ Carga completada\n'))

        # Mostrar disponibles
        self.stdout.write('Instaladores disponibles:')
        self.stdout.write('-' * 60)
        instaladores = Instalador.objects.all().order_by('nombre')
        for inst in instaladores:
            estado_icon = '✓' if inst.estado == 'ACTIVO' else '✗'
            self.stdout.write(
                f'{estado_icon} ID: {inst.id:2d} | {inst.get_full_name():30s} | {inst.documento:15s} | {inst.especialidad}'
            )
        
        self.stdout.write('-' * 60)
        self.stdout.write(f'Total: {instaladores.count()} instaladores\n')
