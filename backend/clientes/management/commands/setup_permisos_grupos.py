# clientes/management/commands/setup_permisos_grupos.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from clientes.models import Cliente

class Command(BaseCommand):
    help = 'Configura grupos y permisos para clientes'

    def handle(self, *args, **options):
        # Obtener el ContentType de Cliente
        cliente_ct = ContentType.objects.get_for_model(Cliente)

        # Obtener permisos de Cliente
        perms_cliente = Permission.objects.filter(content_type=cliente_ct)
        perm_view = Permission.objects.get(content_type=cliente_ct, codename='view_cliente')
        perm_add = Permission.objects.get(content_type=cliente_ct, codename='add_cliente')
        perm_change = Permission.objects.get(content_type=cliente_ct, codename='change_cliente')
        perm_delete = Permission.objects.get(content_type=cliente_ct, codename='delete_cliente')

        # Crear o actualizar grupo Administrador
        grupo_admin, created = Group.objects.get_or_create(name='Administrador')
        grupo_admin.permissions.set([perm_view, perm_add, perm_change, perm_delete])
        if created:
            self.stdout.write(self.style.SUCCESS('✅ Grupo "Administrador" creado'))
        else:
            self.stdout.write(self.style.SUCCESS('✅ Grupo "Administrador" actualizado'))

        # Crear o actualizar grupo Colaborador
        grupo_colaborador, created = Group.objects.get_or_create(name='Colaborador')
        # Los colaboradores pueden ver y agregar clientes
        grupo_colaborador.permissions.set([perm_view, perm_add, perm_change])
        if created:
            self.stdout.write(self.style.SUCCESS('✅ Grupo "Colaborador" creado'))
        else:
            self.stdout.write(self.style.SUCCESS('✅ Grupo "Colaborador" actualizado'))

        self.stdout.write(self.style.SUCCESS('✅ Configuración de permisos completada'))
        self.stdout.write(f'\n📋 Permisos asignados:')
        self.stdout.write(f'   Administrador: Ver, Crear, Editar, Eliminar')
        self.stdout.write(f'   Colaborador: Ver, Crear, Editar')
