import datetime
from users import utils
from users.utils import get_requester_info
from users import rfg

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import viewsets, mixins, permissions
from .models import User
from django.contrib.auth import authenticate
from django.http import HttpResponse
from rest_framework import status

from .serializers import UserSerializer, ProfileSerializer

class UserViewSet(viewsets.GenericViewSet, mixins.CreateModelMixin):
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
    queryset = User.objects.all()
    
    def authenticate(self, request):
        user = authenticate(username=request.data.get('username'),
                            password=request.data.get('password'))
        if user:
            return Response({'Id': user.id}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid login or password'}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors[list(serializer.errors.keys())[0]]},
                            status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=serializer.validated_data.get('username')).exists():
            return Response({'error': 'Such user already exists'}, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        user = User.objects.create_user(**serializer.validated_data)

    def get_user(self, request, user_id):
        user = User.objects.get(pk=user_id)
        if not user:
            return Response({'error': 'No such user'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ProfileSerializer(user.profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_id(self, request):
        username = request.data.get('username')
        users = User.objects.filter(username=username)
        if len(users) == 0:
            return Response({'error': 'No such user'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'id': users[0].id}, status=status.HTTP_200_OK)


    def set_role(self, request):
        user = User.objects.get(pk=request.data.get('Id'))
        if not user:
            return Response({'error': 'No such user'}, status=status.HTTP_400_BAD_REQUEST)
        
        author = utils.get_requester_info(request)
        if author is None or author.profile.OfficialRole == 0:
            return Response({'error': 'Not enough privelleges'}, status=status.HTTP_403_FORBIDDEN)

        role = request.data.get('Role')
        if not role:
            return Response({'error': 'No role provided'}, status=status.HTTP_400_BAD_REQUEST)

        if role == 1:
            if (
                user.profile.City is None or
                user.profile.FirstName is None or
                user.profile.SecondName is None
            ):
                return Response({'error': 'Some fields are empty'}, status=status.HTTP_400_BAD_REQUEST)
            user.profile.Confirmed = True
        if role == 2:
            user.profile.Confirmed = False
        if role == 3:
            user.profile.OfficialRole = 1 # Official user
        if role == 4:
            user.profile.OfficialRole = 0 # Unofficial user
        user.save()

        return Response(status=status.HTTP_200_OK)

    def update(self, request, user_id):
        user = get_requester_info(request)
        if user is None or user.id != user_id:
            return Response({'error': 'No such user'}, status=status.HTTP_400_BAD_REQUEST)
        
        new_password = request.data.get('NewPassword', '')
        current_password = request.data.get('CurrentPassword', '')
        if len(new_password) > 0:
            is_valid_password = user.check_password(current_password)
            if is_valid_password:
                user.set_password(new_password)
            else:
                return Response({'error': 'Invalid current passord'}, status=status.HTTP_400_BAD_REQUEST)

        pref_first_name = (user.profile.FirstName or '')
        prev_second_name = (user.profile.SecondName or '')
        prev_city = (user.profile.City or '')
        if pref_first_name != request.data.get('FirstName', '') or \
           prev_second_name != request.data.get('SecondName', '') or \
           prev_city != request.data.get('City', ''):
            user.profile.Confirmed = False
            user.profile.OfficialRole = 0

        user.profile.FirstName = request.data.get('FirstName')
        user.profile.SecondName = request.data.get('SecondName')
        user.profile.MiddleName = request.data.get('MiddleName')
        user.profile.Email = request.data.get('Email')
        user.profile.City = request.data.get('City')

        birth_date = request.data.get('BirthDate')
        if birth_date:
            birth_date_time_obj = datetime.datetime.strptime(birth_date,
                                                            '%Y-%m-%dT%H:%M:%S.%fZ')
            user.profile.BirthDate = birth_date_time_obj.date()
        else:
            user.profile.BirthDate = None
        user.save()

        return Response(status=status.HTTP_200_OK)
    
    def rfg_info(self, request):
        fullname = request.data.get('FullName')
        info = rfg.get_user_info(fullname)
        if info is None:
            return Response({'error': 'No such user'}, status=status.HTTP_404_NOT_FOUND)
        data = {
            'Rating': info[0],
            'City': info[1],
        }
        return Response(data)
