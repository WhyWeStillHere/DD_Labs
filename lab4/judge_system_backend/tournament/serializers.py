from rest_framework import serializers
from .models import TournamentPlayer, Tournament, TournamentGame, TournamentUser


from users.serializers import ProfileSerializer


class TournamentPlayerSerializer(serializers.ModelSerializer):
    UserInfo = ProfileSerializer(source='UserId.profile')

    class Meta:
        model = TournamentPlayer
        fields = '__all__'


class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'


class TournamentGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentGame
        fields = '__all__'


class TournamentUserSerializer(serializers.ModelSerializer):
    UserInfo = ProfileSerializer(source='UserId.profile')

    class Meta:
        model = TournamentUser
        fields = '__all__'
