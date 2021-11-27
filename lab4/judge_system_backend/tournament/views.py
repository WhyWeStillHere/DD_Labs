from collections import Counter, defaultdict
import functools

from rest_framework.serializers import Serializer
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status

from .models import Tournament, TournamentPlayer, TournamentGame, TournamentUser
from .serializers import TournamentSerializer, TournamentPlayerSerializer, TournamentGameSerializer, TournamentUserSerializer
from .toss.divisions import get_typed_division
from users.models import User, Profile
from users.serializers import UserSerializer
from collections import Counter, defaultdict
import json
import datetime
from users.utils import get_requester_info
from . import utils
import tournament
from users.rfg import get_user_info
import markdown
from weasyprint import HTML
from django.http import FileResponse
from tournament.toss import divisions


class TournamentPlayerViewSet(ViewSet):
    def add_participant(self, request, tournament_id):
        user = get_requester_info(request)
        tournament = Tournament.objects.get(Id=tournament_id)
        if tournament is None:
            return utils.no_tournament_response()
        player = TournamentPlayer(TournamentId=tournament, UserId=user)

        if user.profile.Confirmed:
            fullname = user.profile.SecondName + ' ' + user.profile.FirstName
            info = get_user_info(fullname)
            if info is not None:
                player.Rating = info[0]

        if len(TournamentPlayer.objects.filter(TournamentId=tournament, UserId=user)) > 0:
            return utils.ok_response()

        player.save()
        return utils.ok_response()
    
    def remove_participant(self, request, tournament_id):
        user = get_requester_info(request)
        tournament = Tournament.objects.get(Id=tournament_id)
        if tournament is None:
            return utils.no_tournament_response()
        player = TournamentPlayer.objects.get(TournamentId=tournament, UserId=user)
        player.delete()
        return utils.ok_response()

    def get_participants(self, request, tournament_id):
        players = TournamentPlayer.objects.filter(TournamentId=tournament_id).select_related().all()
        serializer = TournamentPlayerSerializer(players, many=True)
        return Response(serializer.data)

    def confirm_participant(self, request, tournament_id):
        user = get_requester_info(request)
        if user is None:
            return utils.forbidden_response()

        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()

        if not (utils.is_organizer(user, tournament) or utils.is_judge(user, tournament)):
            return utils.forbidden_response()

        tournamentPlayerId = request.data.get('TournamentPlayerId')
        is_confirmed = request.data.get('is_confirmed')
        player = TournamentPlayer.objects.filter(Id=tournamentPlayerId).all()[0]
        if is_confirmed:
            player.RegistrationStatus = 1
            player.save()
        else:
            player.RegistrationStatus = 0
            player.save()
        return utils.ok_response()

    def set_rating(self, request, tournament_id):
        user = get_requester_info(request)
        player_id = request.data.get('PlayerId')
        rating = request.data.get('Rating')

        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()

        if user is None:
            return utils.forbidden_response()
        if not utils.is_judge(user, tournament):
            return utils.forbidden_response()
        
        player = TournamentPlayer.objects.filter(Id=player_id).all()[0]
        player.Rating = rating
        player.save()
        return utils.ok_response()



class TournamentViewSet(ViewSet):
    def create_tournament(self, request):
        Name = request.data.get('Name')
        LocationName = request.data.get('LocationName')

        user = get_requester_info(request)
        if user is None:
            return utils.forbidden_response()

        StartDate = None
        if len(request.data.get('StartDate')) > 0:
            StartDate = request.data.get('StartDate')

        EndDate = None
        if len(request.data.get('EndDate')) > 0:
            EndDate = request.data.get('EndDate')

        RulesInfo = request.data.get('RulesInfo')
        ParticipationType = request.data.get('ParticipationType')
        ParticipationTypeName = 'Personal' if ParticipationType == 0 else 'Command'
        TournamentType = request.data.get('TournamentType')
        IsHeadStart = request.data.get('IsHeadStart')
        TimeControlInfo = request.data.get('TimeControlInfo')
        IsRated = request.data.get('IsRated')
        RoundNum = request.data.get('RoundNum')
        TossType = request.data.get('TossType')
        TossName = 'McMahon' if TossType == 0 else 'Olymp'

        tournament = Tournament(Name=Name,
                                LocationName=LocationName,
                                StartDate=StartDate,
                                EndDate=EndDate,
                                RulesInfo=RulesInfo,
                                ParticipationType=ParticipationType,
                                ParticipationTypeName=ParticipationTypeName,
                                TournamentType=TournamentType,
                                IsHeadStart=IsHeadStart,
                                TimeControlInfo=TimeControlInfo,
                                IsRated=IsRated,
                                RoundNum=RoundNum,
                                TossType=TossType,
                                TossName=TossName)
        tournament.save()

        organizer_record = TournamentUser(UserId=user, TournamentId=tournament, Status=TournamentUser.Role.ORGANIZER.value)
        organizer_record.save()

        judge_record = TournamentUser(UserId=user, TournamentId=tournament, Status=TournamentUser.Role.JUDGE.value)
        judge_record.save()

        return Response({'Id': tournament.Id}, status=status.HTTP_200_OK)

    def update_tournament(self, request, tournament_id):
        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()

        user = get_requester_info(request)
        if user is None:
            return utils.no_user_response()

        if not utils.is_organizer(user, tournament):
            return utils.forbidden_response()

        Name = request.data.get('Name')
        LocationName = request.data.get('LocationName')

        StartDate = None
        if len(request.data.get('StartDate')) > 0:
            StartDate = request.data.get('StartDate')

        EndDate = None
        if len(request.data.get('EndDate')) > 0:
            EndDate = request.data.get('EndDate')


        RulesInfo = request.data.get('RulesInfo')
        ParticipationType = request.data.get('ParticipationType')
        ParticipationTypeName = 'Personal' if ParticipationType == 0 else 'Command'
        TournamentType = request.data.get('TournamentType')
        IsHeadStart = request.data.get('IsHeadStart')
        TimeControlInfo = request.data.get('TimeControlInfo')
        IsRated = request.data.get('IsRated')
        RoundNum = request.data.get('RoundNum')
        TossType = request.data.get('TossType')
        TossName = 'McMahon' if TossType == 0 else 'Olymp'

        if tournament.State == 4:
            return utils.tournament_is_over_response()
        if tournament.State == 3:
            if (RoundNum != tournament.RoundNum) or (TossType != tournament.TossType):
                return utils.tournament_is_going_response()
        if tournament.State == 2:
            tournament.State = 1

        tournament.Name = Name
        tournament.LocationName = LocationName
        tournament.StartDate = StartDate
        tournament.EndDate = EndDate
        tournament.RulesInfo = RulesInfo
        tournament.ParticipationType = ParticipationType
        tournament.ParticipationTypeName = ParticipationTypeName
        tournament.TournamentType = TournamentType
        tournament.IsHeadStart = IsHeadStart
        tournament.TimeControlInfo = TimeControlInfo
        tournament.IsRated = IsRated
        tournament.RoundNum = RoundNum
        tournament.TossType = TossType
        tournament.TossName = TossName

        tournament.save()
        return utils.ok_response()

    def get_tournament(self, request, tournament_id):
        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()
        serializer = TournamentSerializer(tournament, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def start_next_round(self, request, tournament_id):
        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()

        user = get_requester_info(request)
        if user is None:
            return utils.no_user_response()

        if not utils.is_judge(user, tournament):
            return utils.forbidden_response()

        GAME_NOT_PLAYED_CODE = 4
        if tournament.CurrentRoundNum > 0:
            games = TournamentGame.objects.filter(TournamentId=tournament_id, RoundNumber=tournament.CurrentRoundNum).all()
            if len(games) == 0:
                return Response(
                    {
                        'error': 'No games played in round {number}'
                        .format(number=tournament.CurrentRoundNum)
                    },
                    status=status.HTTP_400_BAD_REQUEST)
            for game in games:
                if game.ResultType == GAME_NOT_PLAYED_CODE:
                    return Response({'error': 'Some games are not played in round {number}'
                                    .format(number=tournament.CurrentRoundNum)},
                                    status=status.HTTP_400_BAD_REQUEST)

        if tournament.CurrentRoundNum == tournament.RoundNum:
            return Response({'error': 'All rounds are played'}, status=status.HTTP_400_BAD_REQUEST)
        

        tournament.CurrentRoundNum += 1
        tournament.save()
        return utils.ok_response()

    def create_toss(self, request, tournament_id):
        APPROVED_REGISTRATION_STATUS = 1

        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()
        
        user = get_requester_info(request)
        if user is None:
            return utils.no_user_response()

        if not utils.is_judge(user, tournament):
            return utils.forbidden_response()
        
        finished_games = []
        for game in TournamentGame.objects.filter(TournamentId=tournament_id, RoundNumber=tournament.CurrentRoundNum).all():
            if TournamentGame.Result(game.ResultType) is not TournamentGame.Result.NOT_STARTED:
                finished_games.append((game.FirstPlayerId.UserId.username, game.SecondPlayerId.UserId.username))
        
        players = TournamentPlayer.objects.filter(TournamentId=tournament_id).all()
        users = []
        for player in players:
            if player.RegistrationStatus == APPROVED_REGISTRATION_STATUS:
                user = User.objects.get(username=player.UserId)
                if user is not None:
                    users.append(user)
        
        required_names = []
        for name1, name2 in list(request.data):
            required_names.append((name1, name2))
        
        required_names = list(set(required_names) | set(finished_games))
        total_users = {username for pair in required_names for username in pair}
        if len(total_users) != 2 * len(required_names):
            return Response({'error': 'Wrong pairs passed'}, status=status.HTTP_400_BAD_REQUEST)
        
        required_users = []
        for name1, name2 in required_names:
            try:
                user1 = User.objects.get(username=name1)
                user2 = User.objects.get(username=name2)
            except User.DoesNotExits:
                return utils.no_user_response()
            required_users.append((user1, user2))
        
        for game in TournamentGame.objects.filter(TournamentId=tournament_id, RoundNumber=tournament.CurrentRoundNum).all():
            if TournamentGame.Result(game.ResultType) is TournamentGame.Result.NOT_STARTED:
                game.delete()

        games = TournamentGame.objects.filter(TournamentId=tournament_id, RoundNumber__lt=tournament.CurrentRoundNum).order_by('-RoundNumber')
        players = [TournamentPlayer.objects.get(TournamentId=tournament, UserId=user) for user in users]
        required_players = []
        for user1, user2 in required_users:
            player1 = TournamentPlayer.objects.get(TournamentId=tournament, UserId=user1)
            player2 = TournamentPlayer.objects.get(TournamentId=tournament, UserId=user2)
            required_players.append((player1, player2))
        division = get_typed_division(players, required_players, games, tournament.CurrentRoundNum, tournament.TossType)
        
        for first_user, second_user in division:
            first_player_list = TournamentPlayer.objects.filter(TournamentId=tournament_id,
                                                                UserId=first_user.UserId).all()
            second_player_list = TournamentPlayer.objects.filter(TournamentId=tournament_id,
                                                                 UserId=second_user.UserId).all()

            game = TournamentGame(TournamentId=tournament,
                                  FirstPlayerId=first_player_list[0],
                                  SecondPlayerId=second_player_list[0],
                                  RoundNumber=tournament.CurrentRoundNum)
            game.save()
        finished_games_set = set(finished_games)
        for first_user, second_user in required_users:
            if (first_user.username, second_user.username) in finished_games_set:
                continue
            first_player = TournamentPlayer.objects.get(TournamentId=tournament_id, UserId=first_user)
            second_player = TournamentPlayer.objects.get(TournamentId=tournament_id, UserId=second_user)
            game = TournamentGame(TournamentId=tournament,
                                  FirstPlayerId=first_player,
                                  SecondPlayerId=second_player,
                                  RoundNumber=tournament.CurrentRoundNum)
            game.save()

        tournament.save()
        return utils.ok_response()

    def get_toss(self, request, tournament_id, round_number):
        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()

        games = TournamentGame.objects.filter(TournamentId=tournament,
                                              RoundNumber=round_number).all()

        serializer = TournamentGameSerializer(games, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_printable_toss(self, request, tournament_id, round_number):
        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()

        games = TournamentGame.objects.filter(TournamentId=tournament,
                                              RoundNumber=round_number).all()

        tournament_info = "##Турнир: " + tournament.Name + "\n" + \
                          "##Раунд: " + str(round_number) + "\n\n"
        
        toss_info = "###Жеребьевка:\n"
        for game_number, game in enumerate(games):
            first_player = "Неизвестно"
            if game.FirstPlayerId:
                tournament_player = game.FirstPlayerId
                player = Profile.objects.filter(user=tournament_player.UserId).get()
                username = tournament_player.UserId.username
                if player.FirstName == "" and player.SecondName == "":
                    first_player = username
                else:
                    first_player = player.FirstName + " " + player.SecondName + " " + (username)
            
            second_player = "Неизвестно"
            if game.SecondPlayerId:
                tournament_player = game.SecondPlayerId
                player = Profile.objects.filter(user=tournament_player.UserId).get()
                username = tournament_player.UserId.username
                if player.FirstName == "" and player.SecondName == "":
                    second_player = username
                else:
                    second_player = player.FirstName + " " + player.SecondName + " " + (username)

            toss_info += str(game_number + 1) + ") " + first_player + " ----- " + second_player + "\n<br /><br />"
        
        printable_toss = tournament_info + toss_info
        toss_html = markdown.markdown(printable_toss)
        HTML(string=toss_html).write_pdf('/tmp/generated_toss.pdf')

        return FileResponse(open('/tmp/generated_toss.pdf', 'rb'), status=status.HTTP_200_OK)

    def set_game_result(self, request, tournament_id):
        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()

        user = get_requester_info(request)

        if user is None:
            return utils.no_user_response()

        if not utils.is_judge(user, tournament):
            return utils.forbidden_response()

        game_id = request.data.get('GameId')
        result_type = request.data.get('ResultType')

        try:
            game = TournamentGame.objects.get(Id=game_id)
        except TournamentGame.DoesNotExist:
            return Response({'error': 'No such game'}, status=status.HTTP_400_BAD_REQUEST)

        if tournament.CurrentRoundNum > game.RoundNumber:
            return Response({'error': 'Round with this game was ended'}, status=status.HTTP_400_BAD_REQUEST)

        game.ResultType = result_type
        game.save()
        return utils.ok_response()
    
    def add_judge(self, request, tournament_id):
        judge_name = request.data.get('Judge')
        user = get_requester_info(request)
        
        if user is None:
            return utils.no_user_response()
        
        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()
        
        if not utils.is_organizer(user, tournament):
            return utils.forbidden_response()

        try:
            judge = User.objects.get(username=judge_name)
        except User.DoesNotExist:
            return Response({'error': 'No such user to add judge'}, status=status.HTTP_400_BAD_REQUEST)

        if utils.is_judge(judge, tournament):
            return Response({'error': 'Judge already exists'}, status=status.HTTP_409_CONFLICT)
        
        record = TournamentUser(UserId=judge, TournamentId=tournament, Status=TournamentUser.Role.JUDGE.value)
        record.save()

        return utils.ok_response()

    def delete_judge(self, request, tournament_id):
        judge_name = request.data.get('Judge')
        user = get_requester_info(request)

        if user is None:
            return utils.no_user_response()

        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()

        if not utils.is_organizer(user, tournament):
            return utils.forbidden_response()

        try:
            judge_user = User.objects.get(username=judge_name)
        except User.DoesNotExist:
            return Response({'error': 'No judge to delete'}, status=status.HTTP_400_BAD_REQUEST)

        if not utils.is_judge(judge_user, tournament):
            return Response({'error': 'No judge to delete'}, status=status.HTTP_400_BAD_REQUEST)
        
        record = TournamentUser.objects.get(
            UserId=judge_user,
            TournamentId=tournament,
            Status=TournamentUser.Role.JUDGE.value)
        record.delete()

        return utils.ok_response()


    def tournament_list(self, request):
        tournaments = Tournament.objects.all()
        serializer = TournamentSerializer(tournaments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update_rating_for_user(self, request):
        user_id = request.data.get('UserId')
        rating = request.data.get('Rating')

        user = get_requester_info(request)
        if user is None:
            return utils.no_user_response()

        if user.OfficialRole == 0:
            return utils.forbidden_response()

        players = TournamentPlayer.objects.filter(UserId=user_id)
        for player in players:
            tournament = player.TournamentId
            if (tournament is None) or (tournament.State > 2):
                continue
            player.Rating = rating
            player.save()
        return utils.ok_response()

    def start_tournament(self, request, tournament_id):
        REGISTRATION_CLOSED_CODE = 1
        REGISTRATION_CLOSED_STATE_NAME = 'Waiting for start'
        TOURNAMENT_GOING_CODE = 3
        TOURNAMENT_GOING_NAME = 'Tournament is going'
        REGISTRED_REGISTRATION_STATUS = 0
        UNARRIVED_REGISTRATION_STATUS = 2

        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()

        user = get_requester_info(request)

        if user is None:
            return utils.no_user_response()

        if not utils.is_judge(user, tournament):
            return utils.forbidden_response()

        if tournament.State == TOURNAMENT_GOING_CODE:
            return Response(status=status.HTTP_200_OK)

        if tournament.State != REGISTRATION_CLOSED_CODE:
            return Response({'error': 'Invalid tournament state'}, status=status.HTTP_400_BAD_REQUEST)
        
        players = TournamentPlayer.objects.filter(TournamentId=tournament_id).all()
        cnt = 0
        for player in players:
            if player.RegistrationStatus == REGISTRED_REGISTRATION_STATUS:
                cnt += 1
                player.RegistrationStatus = UNARRIVED_REGISTRATION_STATUS
                player.save()
        
        players = TournamentPlayer.objects.filter(TournamentId=tournament_id, ).all()
        if len(players) % 2 != cnt % 2:
            user = User.objects.get(username='empty')
            player = TournamentPlayer(
                TournamentId=tournament,
                UserId=user,
                Rating=0,
                RegistrationStatus=1)
            player.save()

        
        tournament.State = TOURNAMENT_GOING_CODE
        tournament.StateName = TOURNAMENT_GOING_NAME
        tournament.save()

        return utils.ok_response()

    def close_registration(self, request, tournament_id):
        REGISTATION_CODE = 0
        REGISTRATION_STATE_NAME = 'Registration'
        REGISTRATION_CLOSED_CODE = 1 
        REGISTRATION_CLOSED_STATE_NAME = 'Waiting for start'

        is_closed = request.data.get('is_closed')

        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()

        user = get_requester_info(request)

        if not utils.is_judge(user, tournament):
            return utils.forbidden_response()

        if is_closed:
            if (tournament.State == REGISTATION_CODE):
                tournament.State = REGISTRATION_CLOSED_CODE
                tournament.StateName = REGISTRATION_CLOSED_STATE_NAME
            elif (tournament.State == REGISTRATION_CLOSED_CODE):
                # All conditions are already satisfied
                pass
            else:
                return Response({'error': 'Tournament is going'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            if (tournament.State == REGISTRATION_CLOSED_CODE):
                tournament.State = REGISTATION_CODE
                tournament.StateName = REGISTRATION_STATE_NAME
            elif (tournament.State == REGISTATION_CODE):
                # All conditions are already satisfied
                pass
            else:
                return Response({'error': 'Tournament is going'}, status=status.HTTP_400_BAD_REQUEST)

        tournament.save()
        return Response(status=status.HTTP_200_OK)
    
    def get_roles(self, request, tournament_id):
        tournament = Tournament.objects.get(Id=tournament_id)
        serializer = TournamentUserSerializer(
            TournamentUser.objects.filter(TournamentId=tournament).all(),
            many=True)
        return Response({'Status': 'OK', 'Data': serializer.data}, status=status.HTTP_200_OK)

    def end_tournament(self, request, tournament_id):
        GAME_NOT_PLAYED_CODE = 4
        TOURNAMENT_END_CODE = 4
        TOURNAMENT_END_STATE_NAME = 'Tournament is over'

        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()
        
        if tournament.CurrentRoundNum != tournament.RoundNum:
            return Response({'error': 'Not all rounds played'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_requester_info(request)
        if user is None:
            return utils.no_user_response()

        if not utils.is_judge(user, tournament):
            return utils.forbidden_response()

        games = TournamentGame.objects.filter(TournamentId=tournament_id, ResultType=GAME_NOT_PLAYED_CODE).all()
        if games:
            return Response({'error': 'There are games, that a not played yet'}, status=status.HTTP_400_BAD_REQUEST)

        tournament.State = TOURNAMENT_END_CODE
        tournament.StateName = TOURNAMENT_END_STATE_NAME
        tournament.save()

        return utils.ok_response()

    def get_results(self, request, tournament_id):
        games = TournamentGame.objects.filter(TournamentId=tournament_id).order_by('RoundNumber')

        points = Counter()
        buchgoltz = Counter()
        berger = Counter()

        game_map = defaultdict(list)
        user_map = {}
        
        try:
            tournament = Tournament.objects.get(Id=tournament_id)
        except Tournament.DoesNotExist:
            return utils.no_tournament_response()

        for game in games:
            first_id = game.FirstPlayerId.Id
            second_id = game.SecondPlayerId.Id
            user_map[first_id] = game.FirstPlayerId
            user_map[second_id] = game.SecondPlayerId

            if TournamentGame.Result(game.ResultType) is TournamentGame.Result.FIRST_WIN:
                game_map[first_id].append((second_id, '+'))
                game_map[second_id].append((first_id, '-'))
                points[first_id] += 1
                points[second_id] += 0
            elif TournamentGame.Result(game.ResultType) is TournamentGame.Result.SECOND_WIN:
                game_map[first_id].append((second_id, '-'))
                game_map[second_id].append((first_id, '+'))
                points[second_id] += 1
                points[first_id] += 0
            elif TournamentGame.Result(game.ResultType) is TournamentGame.Result.DRAW:
                game_map[first_id].append((second_id, '='))
                game_map[second_id].append((first_id, '='))
                points[first_id] += 0
                points[second_id] += 0
            else:
                game_map[first_id].append((second_id, '?'))
                game_map[second_id].append((first_id, '?'))
                points[first_id] += 0
                points[second_id] += 0

        starting_points = defaultdict(lambda: 0)
        if tournament.TossType == divisions.TournamentType.MCMAGON.value:
            groups = 3
            players = TournamentPlayer.objects.filter(TournamentId=tournament_id).all()
            block_size = len(players) // groups
            players = sorted(players, key=functools.cmp_to_key(divisions.cmp))
            for i in range(len(players)):
                position = len(players) - i - 1
                start_points = min(2, position//block_size)
                starting_points[players[i].Id] = start_points
                points[players[i].Id] += start_points

        for game in games:
            first_id = game.FirstPlayerId.Id
            second_id = game.SecondPlayerId.Id

            if TournamentGame.Result(game.ResultType) is TournamentGame.Result.FIRST_WIN:
                berger[first_id] += points[second_id]
                buchgoltz[second_id] += points[first_id]
                buchgoltz[first_id] += points[second_id]

            elif TournamentGame.Result(game.ResultType) is TournamentGame.Result.SECOND_WIN:
                berger[second_id] += points[first_id]
                buchgoltz[second_id] += points[first_id]
                buchgoltz[first_id] += points[second_id]



        results = [(pts, player_id) for player_id, pts in points.items()]
        ordered = [player_id for _, player_id in reversed(sorted(results))]
        positions = {player_id: position for position, player_id in enumerate(ordered)}

        return Response(
            {
                'data': [
                    {
                        'UserInfo': UserSerializer(user_map[user_id].UserId).data,
                        'Games': [
                            {
                                'OpponentPosition': positions[opponent_id],
                                'GameResult': result_type
                            } for opponent_id, result_type in game_map[user_id]
                        ],
                        'Points': points[user_id],
                        'Berger': berger[user_id],
                        'Buchgoltz': buchgoltz[user_id],
                        'StartingPoints': starting_points[user_id],
                    } for user_id in ordered
                ]
            }
        )
