# config/urls.py

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


# Optional home route to prevent 404 at root
def home_view(request):
    return JsonResponse({"message": "Django backend is running."})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),  # Include URLs from accounts app
    path('', home_view),  # Root URL just shows a message
]
