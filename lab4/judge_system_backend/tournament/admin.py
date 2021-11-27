from django.contrib import admin
from .models import Tournament, TournamentPlayer, TournamentGame, TournamentUser

admin.site.register(Tournament)
admin.site.register(TournamentPlayer)
admin.site.register(TournamentGame)
admin.site.register(TournamentUser)
