import { Button, Col, Container, Row } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'

import paginationFactory from 'react-bootstrap-table2-paginator'
import ResultField from './ResultField'
import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { createGetSortition } from '../redux/actions'
import { Link } from 'react-router-dom'
import { createDownloadTossURL } from '../sources/Sources'

export default function Sortition({ tournamentId, sortitionId }) {
    const dispatch = useDispatch()
    const sortition = useSelector(
        (state) => state.tournament.sortitions[sortitionId]
    )
    const participants = useSelector((state) => state.tournament.participants)

    const mapPlayerIdWithUser = (playerId) => {
        const arrayId = participants
            .map((participant) => participant['Id'])
            .indexOf(playerId)
        if (arrayId === -1) return '---'
        return (
            participants[arrayId]['UserInfo']['Username'] +
            ` (${participants[arrayId]['UserInfo']['SecondName']} ${participants[arrayId]['UserInfo']['FirstName']})`
        )
    }

    useEffect(() => {
        dispatch(createGetSortition({ tournamentId, sortitionId }))
    }, [tournamentId, sortitionId, dispatch])

    const [data, setData] = useState([])

    useEffect(() => {
        setData(
            (sortition === undefined ? [] : sortition).map((game) => ({
                participant_1: mapPlayerIdWithUser(game['FirstPlayerId']),
                participant_2: mapPlayerIdWithUser(game['SecondPlayerId']),
                id: game['Id'],
                result: (
                    <ResultField
                        tournamentId={tournamentId}
                        sortitionId={sortitionId}
                        gameId={game['Id']}
                        resultType={game['ResultType']}
                    />
                ),
            }))
        )
    }, [sortition, tournamentId, sortitionId])

    const columns = [
        {
            dataField: 'participant_1',
            text: 'First participant',
            sort: true,
            headerStyle: { width: '30%' },
            style: {
                whiteSpace: 'nowrap',
                overflow: 'auto',
                maxWidth: '0px',
            },
        },
        {
            dataField: 'participant_2',
            text: 'Second participant',
            sort: true,
            headerStyle: { width: '30%' },
            style: {
                whiteSpace: 'nowrap',
                overflow: 'auto',
                maxWidth: '0px',
            },
        },
        {
            dataField: 'result',
            text: 'Результат игры',
        },
    ]

    const defaultSorted = [
        {
            dataField: 'participant_1',
            order: 'asc',
        },
    ]

    const noParticipantsIndication = () => {
        return <Container className='text-center'>Игр нет :(</Container>
    }

    const pageListRenderer = ({ pages, onPageChange }) => {
        const pageWithoutIndication = pages.filter(
            (p) => typeof p.page !== 'string'
        )
        return pages.length > 1 ? (
            <Col className='d-flex justify-content-end'>
                {pages.map((p, i) => {
                    if (pageWithoutIndication.includes(p)) {
                        return (
                            <Button
                                key={i}
                                className='shadow-none mr-1 border'
                                style={{ borderRadius: '2px' }}
                                variant={p.active ? 'dark' : ''}
                                onClick={() => onPageChange(p.page)}
                            >
                                {p.page}
                            </Button>
                        )
                    }

                    return (
                        <Button
                            key={i}
                            className='shadow-none mr-1'
                            variant='outline-dark'
                            onClick={() => onPageChange(p.page)}
                        >
                            {p.page}
                        </Button>
                    )
                })}
            </Col>
        ) : (
            <></>
        )
    }

    const options = {
        pageListRenderer: pageListRenderer,
        hideSizePerPage: true,
    }

    return (
        <>
            <Button
                as='a'
                variant={'outline-secondary'}
                href={createDownloadTossURL(tournamentId, sortitionId + 1)}
            >
                Скачать жеребьёвку
            </Button>
            <BootstrapTable
                striped
                keyField='id'
                data={data}
                columns={columns}
                noDataIndication={noParticipantsIndication}
                defaultSorted={defaultSorted}
                pagination={paginationFactory(options)}
            />
        </>
    )
}
