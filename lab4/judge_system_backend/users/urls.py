from django.contrib import admin
from django.urls import path
from .views import UserViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

user_create = UserViewSet.as_view({
    'post': 'create'
})

user_authenticate = UserViewSet.as_view({
    'post': 'authenticate'
})

user_update = UserViewSet.as_view({
    'post': 'update'
})

user_set_role = UserViewSet.as_view({
    'post': 'set_role'
})

user_get = UserViewSet.as_view({
    'get': 'get_user'
})

user_get_id = UserViewSet.as_view({
    'post': 'get_id'
})

user_get_rfg = UserViewSet.as_view({
    'post': 'rfg_info'
})


urlpatterns = [
    path('sign_up/', user_create, name='user_create'),
    path('sign_in/', user_authenticate, name='user_authenticate'),
    path('set_role/', user_set_role, name='user_set_role'),
    path('<int:user_id>/update/', user_update, name='user_update'),
    path('<int:user_id>/', user_get, name='user_get'),
    path('get_id/', user_get_id, name='user_get_id'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('rfg_info/', user_get_rfg, name='user_rfg_info'),
]
