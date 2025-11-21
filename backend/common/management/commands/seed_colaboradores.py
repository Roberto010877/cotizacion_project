# common/management/commands/seed_colaboradores.py
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Carga datos de prueba de colaboradores/instaladores desde fixtures'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Eliminar colaboradores existentes antes de cargar nuevos (excepto admin)',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        from common.fixtures.seed_colaboradores import COLABORADORES_DATA
        
        clear = options.get('clear', False)
        
        # Limpieza opcional (no eliminar admin)
        if clear:
            users_to_delete = User.objects.exclude(
                username__in=['admin', 'superuser']
            ).filter(is_staff=False)
            count_deleted = users_to_delete.count()
            users_to_delete.delete()
            self.stdout.write(
                self.style.WARNING(f'🗑️  Se eliminaron {count_deleted} colaboradores existentes')
            )

        # Cargar colaboradores
        colaboradores_creados = 0
        colaboradores_duplicados = 0
        errores = 0

        for colab_data in COLABORADORES_DATA:
            try:
                username = colab_data.get('username')
                email = colab_data.get('email')
                password = colab_data.pop('password')
                
                # Verificar si el usuario ya existe
                if User.objects.filter(username=username).exists():
                    colaboradores_duplicados += 1
                    user_existente = User.objects.get(username=username)
                    self.stdout.write(
                        self.style.WARNING(
                            f"⚠️  Colaborador ya existe: {user_existente.get_full_name() or username}"
                        )
                    )
                    continue
                
                # Crear usuario
                usuario = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=colab_data.get('first_name', ''),
                    last_name=colab_data.get('last_name', ''),
                    is_staff=colab_data.get('is_staff', False),
                    is_active=colab_data.get('is_active', True),
                )
                
                colaboradores_creados += 1
                nombre_completo = usuario.get_full_name() or username
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Colaborador creado: {nombre_completo}")
                )

            except Exception as e:
                errores += 1
                self.stdout.write(
                    self.style.ERROR(f"❌ Error al crear colaborador: {str(e)}")
                )

        # Resumen
        self.stdout.write("\n" + "="*70)
        self.stdout.write(self.style.SUCCESS(f"✅ Colaboradores creados: {colaboradores_creados}"))
        self.stdout.write(self.style.WARNING(f"⚠️  Colaboradores duplicados: {colaboradores_duplicados}"))
        self.stdout.write(self.style.ERROR(f"❌ Errores: {errores}"))
        self.stdout.write("="*70 + "\n")
        
        # Información útil
        self.stdout.write(self.style.SUCCESS("\n📝 Colaboradores disponibles para asignar en pedidos:"))
        self.stdout.write("-"*70)
        
        colaboradores = User.objects.filter(is_staff=False, is_active=True).values(
            'id', 'username', 'first_name', 'last_name', 'email'
        )
        
        for colab in colaboradores:
            nombre = f"{colab['first_name']} {colab['last_name']}".strip()
            self.stdout.write(
                f"  • ID: {colab['id']:2d} | {nombre:20s} | @{colab['username']:15s} | {colab['email']}"
            )
        
        self.stdout.write("-"*70 + "\n")
