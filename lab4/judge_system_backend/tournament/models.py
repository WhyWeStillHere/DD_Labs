from django.db import models
from django.db.models.deletion import CASCADE
from users.models import User
from enum import Enum


class Tournament(models.Model):
    Id = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=100, null=False)
    LocationName = models.CharField(max_length=256, null=False)
    StartDate = models.CharField(max_length=256, null=True, blank=True)
    EndDate = models.CharField(max_length=256, null=True, blank=True)
    RulesInfo = models.CharField(max_length=256, null=True, blank=True)
    ParticipationType = models.IntegerField(null=False)
    ParticipationTypeName = models.CharField(max_length=50, null=False, default='Personal')
    TournamentType = models.IntegerField(null=False, default=0)
    IsHeadStart = models.BooleanField(null=False, default=False)
    TimeControlInfo = models.CharField(max_length=256, null=True, blank=True)
    IsRated = models.BooleanField(null=False, default=False)
    BoardNum = models.IntegerField(null=True, blank=True)
    CurrentRoundNum = models.IntegerField(null=False, default=0)
    RoundNum = models.IntegerField(null=False)
    State = models.IntegerField(null=False, default=0)
    StateName = models.CharField(max_length=50, null=False, default='Registration')
    TossType = models.IntegerField(null=False)
    TossName = models.CharField(max_length=50, null=False)


class TournamentPlayer(models.Model):
    Id = models.AutoField(primary_key=True)
    UserId = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    TournamentId = models.ForeignKey(Tournament, null=True, blank=True, on_delete=models.SET_NULL)
    Rating = models.IntegerField(null=True, blank=True)
    RegistrationStatus = models.IntegerField(null=False, default=0)
    Rating = models.IntegerField(null=False, default=0)


class TournamentGame(models.Model):
    class Result(Enum):
        FIRST_WIN = 0
        SECOND_WIN = 1
        FIRST_WIN_NO_GAME = 2
        SECOND_WIN_NO_GAME = 3
        NOT_STARTED = 4
        DRAW = 5
        BOTH_LOSE = 6
        UNKNOWN = 7
        DRAW_NO_GAME = 8

    Id = models.AutoField(primary_key=True)
    TournamentId = models.ForeignKey(Tournament, null=True, blank=True, on_delete=models.SET_NULL)
    FirstPlayerId = models.ForeignKey(
        TournamentPlayer,
        null=True,
        on_delete=models.SET_NULL,
        related_name='FirstPlayerId',
        blank=True)
    SecondPlayerId = models.ForeignKey(
        TournamentPlayer,
        null=True,
        on_delete=models.SET_NULL,
        related_name='SecondPlayerId',
        blank=True)
    Date = models.DateField(null=True, blank=True)
    ResultType = models.IntegerField(null=False, default=4)
    ResultName = models.CharField(max_length=20, null=False)
    RoundNumber = models.IntegerField(null=False)


class TournamentUser(models.Model):
    class Role(Enum):
        ORGANIZER = 0
        JUDGE = 1
    
    Id = models.AutoField(primary_key=True)

    UserId = models.ForeignKey(
        User,
        null=False,
        on_delete=models.CASCADE)
    TournamentId = models.ForeignKey(
        Tournament,
        null=False,
        on_delete=models.CASCADE)
    Status = models.IntegerField(null=False)
