import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createGetTournamentsList } from '../redux/actions'
import { Link } from 'react-router-dom'
import { Button, Col, Container } from 'react-bootstrap'
import Caption from '../caption/Caption'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'

export default function TournamentsList() {
    const dispatch = useDispatch()
    const tournamentsList = useSelector(
        (state) => state.tournament.tournamentsList
    )

    useEffect(() => {
        dispatch(createGetTournamentsList())
    }, [dispatch])

    const [data, setData] = useState([])
    useEffect(() => {
        setData(
            (tournamentsList === undefined ? [] : tournamentsList).map(
                (tournament) => {
                    return {
                        id: tournament['Id'],
                        StartDate: tournament['StartDate'],
                        EndDate: tournament['EndDate'],
                        Name: tournament['Name'],
                        LocationName: tournament['LocationName'],
                        IsRated: tournament['IsRated'],
                        StateName: tournament['StateName'],
                    }
                }
            )
        )
    }, [tournamentsList])

    const columnStyle = {
        whiteSpace: 'nowrap',
        overflow: 'auto',
        maxWidth: '0px',
        maxHeight: '0px',
    }

    function linkFormatter(cell, row) {
        return (
            <Link
                to={`/tournaments/${row.id}`}
                style={{
                    textDecoration: 'underline',
                }}
            >
                {cell}
            </Link>
        )
    }

    function emptyCellFormatter(cell) {
        if (cell === null) {
            return <span>-</span>
        }
        return <span>{cell}</span>
    }

    function boolTranslate(cell) {
        if (cell === undefined) {
            return <span>{cell}</span>
        }
        if (cell === false) {
            return <span>нет</span>
        }
        if (cell === true) {
            return <span>да</span>
        }
        return <span>{cell}</span>
    }

    function StateTranslate(cell) {
        if (cell === undefined) {
            return <span>{cell}</span>
        }
        if (cell === 'Tournament is over') {
            return <span>Завершен</span>
        }
        if (cell === 'Registration') {
            return <span>Регистрация</span>
        }
        if (cell === 'Waiting for start') {
            return <span>Ожидание начала</span>
        }
        if (cell === 'Tournament is going') {
            return <span>Турнир идет</span>
        }
        return <span>{cell}</span>
    }

    const columns = [
        {
            dataField: 'id',
            sort: true,
            style: columnStyle,
            hidden: true,
        },
        {
            dataField: 'StartDate',
            text: 'Начало',
            style: { ...columnStyle, width: '15%' },
            formatter: emptyCellFormatter,
            sort: true,
        },
        {
            dataField: 'EndDate',
            text: 'Конец',
            style: { ...columnStyle, width: '15%' },
            formatter: emptyCellFormatter,
            sort: true,
        },
        {
            dataField: 'Name',
            text: 'Название',
            style: { ...columnStyle, width: '30%' },
            formatter: linkFormatter,
            sort: true,
        },
        {
            dataField: 'IsRated',
            text: 'Рейтинговый',
            style: { ...columnStyle, width: '10%' },
            formatter: boolTranslate,
            sort: true,
        },
        {
            dataField: 'StateName',
            text: 'Статус',
            style: { ...columnStyle, width: '15%' },
            formatter: StateTranslate,
            sort: true,
        },
        {
            dataField: 'LocationName',
            text: 'Город',
            style: columnStyle,
            sort: true,
        },
    ]

    const defaultSorted = [
        {
            dataField: 'id',
            order: 'desc',
        },
    ]

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
        <Container className='float-center overflow-auto d-flex flex-column'>
            <Caption text={'Список Турниров'} />
            <BootstrapTable
                keyField='id'
                data={data}
                columns={columns}
                defaultSorted={defaultSorted}
                bordered={false}
                pagination={paginationFactory(options)}
            />
        </Container>
    )
}
