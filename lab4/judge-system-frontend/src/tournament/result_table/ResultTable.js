import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import {
    createGetTournamentObjectFromDB,
    createGetTournamentResult,
} from '../../redux/actions'
import { Container, Row } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import Caption from '../../caption/Caption.js'
import { ExportCSV } from './ExportCSV'
//import paginationFactory from 'react-bootstrap-table2-paginator';

export function ResultTable({ tournamentId }) {
    const dispatch = useDispatch()
    const result = useSelector((state) => state.tournament.result)
    const tournament = useSelector(
        (state) => state.tournament.tournamentObjectFromDB
    )

    useEffect(() => {
        dispatch(createGetTournamentResult({ tournamentId }))
        dispatch(createGetTournamentObjectFromDB({ tournamentId }))
    }, [tournamentId, dispatch])

    const isTournamentStarted = () => {
        return tournament['State'] === 3 || tournament['State'] === 4
    }

    const isTournamentClosed = () => {
        return tournament['State'] === 4
    }

    const [data, setData] = useState([])

    useEffect(() => {
        let isStarted = isTournamentStarted()
        let isClosed = isTournamentClosed()
        setData(
            (result === undefined ? [] : result).map((playerResult, index) => {
                let rounds = {}
                if (isStarted) {
                    for (let i = 1; i <= tournament.RoundNum; ++i) {
                        if (playerResult['Games'][i - 1] === undefined) {
                            break
                        } else {
                            rounds[`round${i}`] =
                                '' +
                                playerResult['Games'][i - 1][
                                    'OpponentPosition'
                                ] +
                                playerResult['Games'][i - 1]['GameResult']
                        }
                    }
                }

                return {
                    id: index,
                    username: playerResult['UserInfo']['username'],
                    mm0: playerResult['StartingPoints'],
                    ...rounds,
                    points: playerResult['Points'],
                    buchholz: playerResult['Buchgoltz'],
                    berger: playerResult['Berger'],
                    place: index,
                }
            })
        )
    }, [result, tournament, tournamentId])

    const columnStyle = {
        whiteSpace: 'nowrap',
        overflow: 'auto',
        maxWidth: '0px',
    }

    let roundColumns = []

    function colourFormatter(cell) {
        if (cell === undefined) {
            return <span>{cell}</span>
        }
        if (cell.includes('-')) {
            return <span style={{ color: 'red' }}>{cell}</span>
        }
        if (cell.includes('+')) {
            return <span style={{ color: 'green' }}>{cell}</span>
        }
        if (cell === '?') {
            return <span style={{ color: 'gray' }}>{cell}</span>
        }
        return <span>{cell}</span>
    }

    for (let i = 1; i <= tournament.RoundNum; ++i) {
        roundColumns.push({
            dataField: `round${i}`,
            text: `${i}`,
            style: {...columnStyle, overflow: 'hidden',},
            formatter: colourFormatter,
        })
    }

    const columns = [
        {
            dataField: 'id',
            text: 'N',
            sort: true,
            style: columnStyle,
        },
        {
            dataField: 'username',
            text: 'Игрок',
            style: columnStyle,
        },
        {
            dataField: 'town',
            text: 'Город',
            style: columnStyle,
        },
        {
            dataField: 'elo',
            text: 'Рейтинг',
            style: columnStyle,
        },
        {
            dataField: 'mm0',
            text: 'MM0',
            style: columnStyle,
        },
    ]
        .concat(roundColumns)
        .concat(
            {
                dataField: 'points',
                text: 'Очки',
                style: columnStyle,
            },
            {
                dataField: 'buchholz',
                text: 'Коэф. Бухгольца',
                style: columnStyle,
            },
            {
                dataField: 'berger',
                text: 'Коэф. Бергера',
                style: columnStyle,
            },
            {
                dataField: 'place',
                text: 'Место',
                style: columnStyle,
            }
        )

    const defaultSorted = [
        {
            dataField: 'id',
            order: 'asc',
        },
    ]

    const noParticipantsIndication = () => {
        if (!isTournamentStarted()) {
            return (
                <Container className='text-center'>
                    Ожидаем начала турнира
                </Container>
            )
        } else {
            return <Container className='text-center'>Нет участников</Container>
        }
    }

    return (
        <Container className='float-center overflow-auto d-flex flex-column'>
            <Caption text={'Результаты турнира'} />
            <BootstrapTable
                keyField='id'
                data={data}
                columns={columns}
                noDataIndication={noParticipantsIndication}
                defaultSorted={defaultSorted}
            />
            <ExportCSV csvData={data} fileName={`${tournamentId}-results`} />
        </Container>
    )
}
