from django.test import TestCase

from tournament.toss import divisions
import typing as tp
from tournament.models import TournamentGame, TournamentPlayer
from users.models import User
import random
import functools
from munkres import Munkres

# Create your tests here.

class CircleTests(TestCase):

    def generate_users(self, count: int) -> tp.List[TournamentPlayer]:
        return [TournamentPlayer(Id=int(i), Rating = int(i)) for i in range(count)]

    def test_circle_small_all(self):

        N = 4

        users = self.generate_users(N)
        fin_res = [[(users[0], users[3]), (users[1], users[2])], [(users[3], users[2]), (users[0], users[1])], [(users[1], users[3]), (users[2], users[0])]]

        for i in range(N - 1):
            res = divisions.get_circle_division(users, i + 1)
            if i == 0:
                self.assertEqual(res, fin_res[i])

    def test_circle_even_fact(self):

        N = 228

        users = self.generate_users(N)

        for i in range(N - 1):
            res = divisions.get_circle_division(users, i + 1)
            self.assertEqual(len(res), N//2)

    def test_circle_odd_fact(self):

        N = 69

        users = self.generate_users(N)

        for i in range(N):
            res = divisions.get_circle_division(users, i + 1)
            self.assertEqual(len(res), N//2)

class SwissTests(TestCase):

    def generate_users(self, count: int) -> tp.List[TournamentPlayer]:
        return [TournamentPlayer(Id=int(i), Rating = int(i), UserId = User(id = int(i))) for i in range(count)]

    def test_required_games(self):

        N = 6
        users = self.generate_users(N)

        wg = [(users[0], users[3]), (users[2], users[5])]
        res = divisions.get_swiss_division(users, [], wg, False)
        self.assertEqual(len(res), 1)

    def test_get_swiss_division(self):

        user_count = 10
        t = 2

        users = self.generate_users(user_count)

        games = []
        for tour in range(t):

        #    print("TABLE BEFORE THE TOUR", tour+1)

#            self.print(users, games)

            division = divisions.get_swiss_division(users, games, [], False)
            for p in division:
                game = TournamentGame(FirstPlayerId=p[0],
                                  SecondPlayerId=p[1],
                                  RoundNumber=tour+1)
                if random.randint(0, 1) == 1:
                    game.ResultType = game.Result.FIRST_WIN
 #                   print(p[0], p[1], "1-0")
                else:
                    game.ResultType = game.Result.SECOND_WIN
  #                  print(p[0], p[1], "0-1")

                games.append(game)

            self.assertEqual(len(division), user_count // 2)


