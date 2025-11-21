import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

user, created = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'testuser@test.com', 'is_staff': False}
)
if created:
    user.set_password('testpass123')
    user.save()
    print(f'Created user: {user.username}')
else:
    print(f'User already exists: {user.username}')

print(f'Username: testuser')
print(f'Password: testpass123')
print(f'Use these credentials to obtain a JWT token')
