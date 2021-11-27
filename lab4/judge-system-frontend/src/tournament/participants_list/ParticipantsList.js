import { Button, Col, Container } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import checkBoxImage from './check.svg'
import emptyCheckBoxImage from './empty_check.svg'
import cellEditFactory from 'react-bootstrap-table2-editor'

import paginationFactory from 'react-bootstrap-table2-paginator'
import { NO_ACCESS } from '../TournamentAccessRights'
import { useDispatch, useSelector } from 'react-redux'
import { addError, createSetRating } from '../../redux/actions'
import React from 'react'
import { Link } from 'react-router-dom'

// participants - array of {id, username, ...} - представляет список участников (игроки)
// selected - список подтвержденных участников для рендера
// onSelect(row: {id, username, ...}, isSelected: bool) - функция, которая срабатывает на нажатие чекбокса
export default function ParticipantsList({
    participants,
    onSelect,
    accessRights,
    tournamentId,
}) {
    const dispatch = useDispatch()
    const tournamentStatus = useSelector(
        (state) => state.tournament.tournamentObjectFromDB.State
    )
    const participants_data = participants.map((participant) => ({
        username: (
            <Link to={`/profile/${participant['UserInfo']['Username']}`}>
                {participant['UserInfo']['Username']}
            </Link>
        ),
        id: participant['Id'],
        lastName: participant['UserInfo']['SecondName'],
        firstName: participant['UserInfo']['FirstName'],
        status:
            participant['UserInfo']['Confirmed'] === true
                ? 'Подтверждён'
                : 'Не подтверждён',
        rating: participant['Rating'] ?? '',
        registrationStatus: participant['RegistrationStatus'],
    }))

    const statusColourFormatter = (cell) => {
        if (cell.includes('Не')) {
            return <span style={{ color: 'red' }}>{cell}</span>
        }
        return <span style={{ color: 'green' }}>{cell}</span>
    }

    // const linkUsernameFormatter = (cell) => {}

    const columns = [
        {
            dataField: 'id',
            hidden: true,
        },
        {
            dataField: 'username',
            text: 'Username',
            sort: true,
            headerStyle: { width: '25%' },
            style: {
                whiteSpace: 'nowrap',
                overflow: 'auto',
                maxWidth: '0px',
            },
            class: '',
            editable: false,
        },
        {
            dataField: 'firstName',
            text: 'Имя',
            sort: true,
            headerStyle: { width: '20%' },
            style: {
                whiteSpace: 'nowrap',
                overflow: 'auto',
                maxWidth: '0px',
            },
            editable: false,
        },
        {
            dataField: 'lastName',
            text: 'Фамилия',
            sort: true,
            headerStyle: { width: '20%' },
            style: {
                whiteSpace: 'nowrap',
                overflow: 'auto',
                maxWidth: '0px',
            },
            editable: false,
        },
        {
            dataField: 'status',
            text: 'Статус',
            sort: true,
            headerStyle: { width: '20%' },
            style: {
                whiteSpace: 'nowrap',
                overflow: 'auto',
                maxWidth: '0px',
            },
            class: '',
            editable: false,
            formatter: statusColourFormatter,
        },
        {
            dataField: 'rating',
            text: 'Рейтинг',
            sort: true,
            headerStyle: { width: '20%' },
            style: {
                whiteSpace: 'nowrap',
                overflow: 'auto',
                maxWidth: '0px',
            },
            editable: !(
                accessRights === NO_ACCESS ||
                tournamentStatus === 3 ||
                tournamentStatus === 4
            ),
            validator: (newValue, row, column, done) => {
                if (!Number.isInteger(Number(newValue))) {
                    addError(dispatch, 'Рейтинг должен быть числом!')
                    done({ valid: false })
                } else {
                    ;(async () => {
                        let updated = await dispatch(
                            createSetRating({
                                playerId: row['id'],
                                rating: Number(newValue),
                                tournamentId: tournamentId,
                            })
                        )
                        if (updated) {
                            return done()
                        } else {
                            return done({ valid: false })
                        }
                    })()
                }
                return { async: false }
            },
        },
    ]

    const defaultSorted = [
        {
            dataField: 'username',
            order: 'asc',
        },
    ]

    const onSelectAll = (isSelect, rows) => {
        onSelect(
            rows.map((row) => row['id']),
            isSelect
        )
    }

    const selected = () => {
        return participants
            .filter((participant) => participant['RegistrationStatus'] === 1)
            .map((participant) => participant['Id'])
    }

    const selectRow = {
        mode: 'checkbox',
        // clickToSelect: true,
        selectionRenderer: (args) =>
            args['checked'] ? (
                <Container className='d-flex justify-content-center'>
                    <img
                        src={checkBoxImage}
                        alt='checkbox'
                        width='20'
                        height='20'
                    />{' '}
                </Container>
            ) : (
                <Container className='d-flex justify-content-center'>
                    <img
                        src={emptyCheckBoxImage}
                        alt='empty checkbox'
                        width='20'
                        height='20'
                    />{' '}
                </Container>
            ),
        selectionHeaderRenderer: (args) => selectRow.selectionRenderer(args),
        onSelect: (row, isSelected) => {
            return onSelect([row['id']], isSelected)
        },
        onSelectAll: onSelectAll,
        hideSelectAll:
            accessRights === NO_ACCESS ||
            tournamentStatus === 3 ||
            tournamentStatus === 4,
        selected: selected(),
    }

    const noParticipantsIndication = () => {
        return <Container className='text-center'>Участников нет :(</Container>
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
            <BootstrapTable
                striped
                keyField='id'
                data={participants_data}
                columns={columns}
                selectRow={selectRow}
                noDataIndication={noParticipantsIndication}
                defaultSorted={defaultSorted}
                pagination={paginationFactory(options)}
                cellEdit={cellEditFactory({
                    mode: 'click',
                })}
            />
        </>
    )
}
