import io
import typing as tp

import numpy as np
import requests
import pandas as pd


def download_external_csv() -> pd.DataFrame:
    """
    Downloads dataframe with data.
    Index: №
    Columns:
    (Имя, Рейтинг, Откл., ФО, Регион, Город, Дата)
    """
    params = {'export': 'csv'}
    headers = {
        'authority': 'gofederation.ru',
        'referer': 'https://gofederation.ru/players/?mode=all',
    }

    response = requests.get(
        'https://gofederation.ru/players/', headers=headers, params=params
    )
    response.encoding = 'utf-8'
    df = pd.read_csv(io.StringIO(response.text), sep=',', index_col='№')
    return df


def get_user_info(fullname: str) -> tp.Optional[tp.Tuple[int, str]]:
    """
    Принимает на вход имя пользователя
    и возвращает (Рейтинг, Город)
    """
    df = download_external_csv()
    filtered = df[df['Имя'] == fullname]
    if len(filtered) != 1:
        return None
    rating = filtered.iloc[0]['Рейтинг']
    city = filtered.iloc[0]['Город']
    if type(city) != str:
        city = ''
    return rating, city
