from rest_framework.response import Response
from rest_framework import status

from .models import User, Tournament, TournamentUser


def no_user_response() -> Response:
    return Response({'error': 'No such user'}, status=status.HTTP_400_BAD_REQUEST)


def no_tournament_response() -> Response:
    return Response({'error': 'No such tournament'}, status=status.HTTP_400_BAD_REQUEST)


def tournament_is_over_response() -> Response:
    return Response({'error': 'Tournament is over'}, status=status.HTTP_400_BAD_REQUEST)


def tournament_is_going_response() -> Response:
    return Response({'error': 'Tournament is going'}, status=status.HTTP_400_BAD_REQUEST)

def ok_response() -> Response:
    return Response({'State': 'OK'}, status=status.HTTP_200_OK)


def forbidden_response() -> Response:
    return Response({'error': 'Not enough privelleges'}, status=status.HTTP_403_FORBIDDEN)


def is_organizer(user: User, tournament: Tournament) -> bool:
    return TournamentUser.objects.filter(
        UserId=user,
        TournamentId=tournament,
        Status=TournamentUser.Role.ORGANIZER.value).exists()


def is_judge(user: User, tournament: Tournament) -> bool:
    return TournamentUser.objects.filter(
        UserId=user,
        TournamentId=tournament,
        Status=TournamentUser.Role.JUDGE.value
    ).exists()
