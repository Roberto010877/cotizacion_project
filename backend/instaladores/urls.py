from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InstaladorViewSet

router = DefaultRouter()
router.register(r'', InstaladorViewSet, basename='instalador')

urlpatterns = [
    path('', include(router.urls)),
]
