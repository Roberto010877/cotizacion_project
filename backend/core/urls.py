from django.urls import path
from .views import CurrentUserView, UpdateLanguageView

urlpatterns = [
    path('users/me/', CurrentUserView.as_view(), name='current-user'),
    path('users/me/language/', UpdateLanguageView.as_view(), name='update-language'),
]