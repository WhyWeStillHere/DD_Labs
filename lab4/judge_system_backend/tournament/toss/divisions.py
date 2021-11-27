from django.contrib.auth.models import User
from tournament.models import Tournament, TournamentGame, TournamentPlayer
import typing as tp
import functools
import random
import math
from munkres import Munkres
from enum import Enum

class TournamentType(Enum):
    CIRCLE = 2
    SWISS = 1
    MCMAGON = 0

class OddUsersCount(Exception):
    pass

def get_rating(user: TournamentPlayer) -> int:
    if user.Rating is None:
        return 0   
    return user.Rating

def cmp(a: TournamentPlayer, b: TournamentPlayer) -> bool:
    a_rating = get_rating(a)
    b_rating = get_rating(b)
    if a_rating != b_rating:
        return a_rating > b_rating
    return a.UserId.id < b.UserId.id


#I used N = 3 parameter for Mc-Magon system

def get_user(users: tp.List[TournamentPlayer], uid: int) -> TournamentPlayer:
    for user in users:
        if user.UserId.id == uid:
            return user

def get_swiss_division(
    users: tp.List[TournamentPlayer],
    games: tp.List[TournamentGame],
    required_games: tp.List[tp.Tuple[TournamentPlayer, TournamentPlayer]],
    is_mc_magon: bool
) -> tp.List[tp.Tuple[TournamentPlayer, TournamentPlayer]]:

    groups = 3
    N = 1000000

    block_size = len(users) // groups

    division: tp.List[tp.Tuple[TournamentPlayer, TournamentPlayer]] = []
    users = sorted(users, key=functools.cmp_to_key(cmp))

# Assign initial points
    
    # game_state calculates points + coefficients of the players
    game_state: tp.Dict[int, tp.List[int]] = dict()
    for i in range(len(users)):
        position = len(users) - i - 1
        start_points = min(2, position//block_size)
        if not is_mc_magon:
            start_points = 0
        game_state[users[i].UserId.id] = [start_points, 0]

# Calculate real points by the list of games

    for game in games:
        first_id = game.FirstPlayerId.UserId.id
        second_id = game.SecondPlayerId.UserId.id

        if TournamentGame.Result(game.ResultType) is TournamentGame.Result.FIRST_WIN:
            game_state[first_id][0] += 1
        if TournamentGame.Result(game.ResultType) is TournamentGame.Result.SECOND_WIN:
            game_state[second_id][0] += 1
#Calculate Buchgoltz coeff. 

    for game in games:
        first_id = game.FirstPlayerId.UserId.id
        second_id = game.SecondPlayerId.UserId.id
        game_state[first_id][1] += game_state[second_id][0]
        game_state[second_id][1] += game_state[first_id][0]

#List of players based on their current points

    copy_game_state = game_state.copy()

    players: tp.List[int] = []
    while len(game_state) > 0:
        optimum = [-1, -1]
        candidate = -1

        for player in game_state:
            if game_state[player] > optimum:
                optimum = game_state[player]
                candidate = player

        game_state.pop(candidate)
        players.append(candidate)

    game_state = copy_game_state.copy()
#Create a set of played games

    already_played_games: tp.Set[tp.Tuple[int, int]] = set()
    high_priority_games: tp.Set[tp.Tuple[int, int]] = set()

    for game in required_games:
        first_id = game[0].UserId.id
        second_id = game[1].UserId.id

        high_priority_games.add((first_id, second_id))
        high_priority_games.add((second_id, first_id))

    for game in games:
        first_id = game.FirstPlayerId.UserId.id
        second_id = game.SecondPlayerId.UserId.id

        already_played_games.add((first_id, second_id))
        already_played_games.add((second_id, first_id))
    
#Create the toss
    
    white: tp.List[int] = []
    black: tp.List[int] = []
    bound = len(players) // 2

    determined_color: tp.Set[int] = set()
    last_game: tp.Dict[int, int] = dict()
    prelast_game: tp.Dict[int, int] = dict()
    balance: tp.Dict[int, int] = dict()

    for p in players:
        balance[p] = 0
 
    for game in reversed(games):
        first_id = game.FirstPlayerId.UserId.id
        second_id = game.SecondPlayerId.UserId.id
        balance[first_id] += 1
        balance[second_id] -= 1

        if first_id not in last_game:
            last_game[first_id] = 1
        elif first_id not in prelast_game:
            prelast_game[first_id] = 1

        if second_id not in last_game:
            last_game[second_id] = -1
        elif second_id not in prelast_game:
            prelast_game[second_id] = -1

    for game in required_games:
        first_id = game[0].UserId.id
        second_id = game[1].UserId.id

        white.append(first_id)
        black.append(second_id)
        determined_color.add(first_id)
        determined_color.add(second_id)

    for i in range(len(users)):
        player = users[i].UserId.id
        if (player in determined_color):
            continue

        if (player in balance and balance[player] >= 2) or ((player in last_game and last_game[player] == 1) and (player in prelast_game and prelast_game[player] == 1)):
            if len(black) != bound:
                determined_color.add(player)
                black.append(player)

        if (player in balance and balance[player] <= -2) or ((player in last_game and last_game[player] == -1) and (player in prelast_game and prelast_game[player] == -1)):
            if len(white) != bound:
                determined_color.add(player)
                white.append(player)


    for i in range(len(players)):
        player = users[i].UserId.id
        if (player in determined_color):
            continue    
        
        if len(white) < len(black) and len(white) < bound:
            white.append(player)
        elif len(black) < len(white) and len(black) < bound:
            black.append(player)
        elif random.randint(0, 1) == 1:
            white.append(player)
        else:
            black.append(player)

    m = Munkres()
    matrix: tp.List[tp.List[int]] = []

    for w in white:
        connected: tp.List[int] = []
        for b in black:
            if (w, b) in already_played_games:
                delta = abs(game_state[w][0] - game_state[b][0])
                connected.append(delta)
                continue  
            delta = abs(game_state[w][0] - game_state[b][0])
            if (w, b) in high_priority_games:
                delta = -N
            connected.append(delta-N)
        matrix.append(connected)

    res = m.compute(matrix)
    for x in res:
        if (white[x[0]], black[x[1]]) not in high_priority_games:
            division.append((get_user(users, white[x[0]]), get_user(users, black[x[1]])))

    return division

def get_all_games(n: int) -> tp.List[tp.List[tp.List[int]]]:

    ans: tp.List[tp.List[tp.List[int]]] = []
    for i in range(n - 1):

        cur_list: tp.List[tp.List[int]] = []
        for j in range(n//2):
            cur_list.append([-1, -1])
        ans.append(cur_list)

    for i in range(n - 1):
        if i % 2 == 0:
            ans[i][0][1] = n - 1
        else:
            ans[i][0][0] = n - 1

    current = 0

    for i in range(n - 1):
        for j in range(n//2):
            if ans[i][j][0] == -1:
                ans[i][j][0] = current
            else:
                ans[i][j][1] = current
            current = (current + 1) % (n - 1)

    current = n - 2
    for i in range(n - 1):
        for j in range(n//2):
            if ans[i][j][1] == -1:
                ans[i][j][1] = current
                current = (current - 1) % (n - 1)
    
    return ans

# int is user_id here
# 1-indexated tour
def get_circle_division(
    users: tp.List[TournamentPlayer],
    tour: int
) -> tp.List[tp.Tuple[TournamentPlayer, TournamentPlayer]]:
    users = sorted(users, key=functools.cmp_to_key(cmp))
    complete_list: tp.List[tp.List[tp.List[int, int]]] = get_all_games(((len(users) + 1) // 2) * 2)

    division: tp.List[tp.Tuple[User, User]] = []

    for i in range(len(complete_list[tour - 1])):

        first_id = complete_list[tour - 1][i][0]
        second_id = complete_list[tour - 1][i][1]
        if first_id >= len(users) or second_id >= len(users):
            continue
        division.append((users[first_id], users[second_id]))

    return division       

# to_do - add other tosses here (now toss_type is not used)
def get_typed_division(
    users: tp.List[TournamentPlayer],
    required_games: tp.List[tp.Tuple[TournamentPlayer, TournamentPlayer]],
    games: tp.List[TournamentGame],
    tour: int,
    toss_type: int) -> tp.List[tp.Tuple[TournamentPlayer, TournamentPlayer]]:
    if TournamentType(toss_type) is TournamentType.CIRCLE:
        return get_circle_division(users, tour)
    if TournamentType(toss_type) is TournamentType.SWISS:
        return get_swiss_division(users, games, required_games, False)
    if TournamentType(toss_type) is TournamentType.MCMAGON:
        return get_swiss_division(users, games, required_games, True)
