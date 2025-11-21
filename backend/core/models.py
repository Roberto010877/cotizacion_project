from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = "ADMIN", _("Administrador")
        COLLABORATOR = "COLLABORATOR", _("Colaborador")

    role = models.CharField(
        _("role"), max_length=20, choices=Roles.choices, default=Roles.COLLABORATOR
    )

    language = models.CharField(
        _("language"),
        max_length=2,
        choices=[("es", "Español"), ("en", "English"), ("pt", "Português")],
        default="es",
    )