from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.authentication import JWTTokenUserAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from users.models import User

def get_requester_info(request):
    header = JWTAuthentication().get_header(request)
    raw_token = JWTAuthentication().get_raw_token(header)
    try:
        validated_token = JWTAuthentication().get_validated_token(raw_token)
        return User.objects.get(id=JWTTokenUserAuthentication().get_user(validated_token).id)
    except InvalidToken:
        return None
