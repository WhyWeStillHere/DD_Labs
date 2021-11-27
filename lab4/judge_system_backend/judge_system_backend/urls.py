from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tournaments/', include('tournament.urls')),
    path('users/', include('users.urls')),
]
