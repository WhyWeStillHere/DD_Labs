from django.urls import path
from .views import TournamentPlayerViewSet, TournamentViewSet

add_participant = TournamentPlayerViewSet.as_view({
    'post': 'add_participant'
})

remove_participant = TournamentPlayerViewSet.as_view({
    'post': 'remove_participant'
})

get_participants = TournamentPlayerViewSet.as_view({
    'get': 'get_participants'
})

confirm_participant = TournamentPlayerViewSet.as_view({
    'post': 'confirm_participant'
})

set_rating = TournamentPlayerViewSet.as_view({
    'post': 'set_rating'
})

end_tournament = TournamentViewSet.as_view({
    'post': 'end_tournament'
})

close_registration = TournamentViewSet.as_view({
    'post': 'close_registration'
})

tournament_list = TournamentViewSet.as_view({
    'get': 'tournament_list'
})

get_tournament = TournamentViewSet.as_view({
    'get': 'get_tournament'
})

create_toss = TournamentViewSet.as_view({
    'post': 'create_toss'
})

get_toss = TournamentViewSet.as_view({
    'get': 'get_toss'
})

get_printable_toss = TournamentViewSet.as_view({
    'get': 'get_printable_toss'
})

create_tournament = TournamentViewSet.as_view({
    'post': 'create_tournament'
})

update_tournament = TournamentViewSet.as_view({
    'post': 'update_tournament'
})

start_tournament = TournamentViewSet.as_view({
    'post': 'start_tournament'
})

start_next_round = TournamentViewSet.as_view({
    'post': 'start_next_round'
})

set_game_result = TournamentViewSet.as_view({
    'post': 'set_game_result'
})

get_tournament_result = TournamentViewSet.as_view({
    'get': 'get_results',
})

add_judge = TournamentViewSet.as_view({
    'post': 'add_judge',
})

delete_judge = TournamentViewSet.as_view({
    'post': 'delete_judge'
})

get_roles = TournamentViewSet.as_view({
    'get': 'get_roles'
})

update_rating_for_user = TournamentViewSet.as_view({
    'post': 'update_rating_for_user'
})

urlpatterns = [
    path('<int:tournament_id>/add_participant/', add_participant),
    path('<int:tournament_id>/remove_participant/', remove_participant),
    path('<int:tournament_id>/participants/', get_participants),
    path('<int:tournament_id>/confirm_participant/', confirm_participant),
    path('<int:tournament_id>/set_rating/', set_rating),
    path('<int:tournament_id>/close_registration/', close_registration),
    path('create/', create_tournament),
    path('<int:tournament_id>/start/', start_tournament),
    path('<int:tournament_id>/update/', update_tournament),
    path('list/', tournament_list),
    path('update_rating_for_user/', update_rating_for_user),
    path('<int:tournament_id>/', get_tournament),
    path('<int:tournament_id>/create_toss/', create_toss),
    path('<int:tournament_id>/toss/<int:round_number>/', get_toss),
    path('<int:tournament_id>/download_toss/<int:round_number>/', get_printable_toss),
    path('<int:tournament_id>/start_next_round/', start_next_round),
    path('<int:tournament_id>/end/', end_tournament),
    path('<int:tournament_id>/set_game_result/', set_game_result),
    path('<int:tournament_id>/result/', get_tournament_result),
    path('<int:tournament_id>/add_judge/', add_judge),
    path('<int:tournament_id>/delete_judge/', delete_judge),
    path('<int:tournament_id>/roles/', get_roles),
]
