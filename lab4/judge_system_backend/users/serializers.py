from rest_framework import serializers

from .models import User, Profile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password')
        extra_kwargs = {
            'password': {'write_only': True}
        }


class ProfileSerializer(serializers.ModelSerializer):
    Username = serializers.SerializerMethodField('get_username')
    Password = serializers.SerializerMethodField('get_password')

    class Meta:
        model = Profile
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def get_username(self, obj):
        return obj.user.username

    def get_password(self, obj):
        pass