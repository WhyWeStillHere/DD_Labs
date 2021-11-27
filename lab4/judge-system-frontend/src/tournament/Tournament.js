import React from 'react'
import {
    useHistory,
    useParams,
    Switch,
    Route,
    useRouteMatch,
    NavLink,
    Redirect,
    Link,
} from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    createCloseRegistration,
    createConfirmParticipant,
    createEndTournament,
    createGetParticipants,
    createGetRoles,
    createGetTournamentObjectFromDB,
    createParticipate,
    createRemoveParticipate,
    createStartTournament,
} from '../redux/actions'
import { Badge, Button, Col, Container, Row } from 'react-bootstrap'
import ParticipantsList from './participants_list/ParticipantsList'
import Sortitions from './Sortitions'
import './scroll.css'
import LongText from './LongText'
import Caption from '../caption/Caption'
import { ResultTable } from './result_table/ResultTable'
import {
    SHOW_SIGN_IN_FORM_ACTION,
    SHOW_SIGN_UP_FORM_ACTION,
} from '../redux/types'
import { TournamentReducer } from '../redux/TournamentReducer'
import CreateOrEditTournament from './CreateOrEditTournament'
import { TournamentDescription } from './TournamentDescription'
import JudgingPage from './JudgingPage'
import {
    getAccessRights,
    JUDGE_ACCESS,
    NO_ACCESS,
    ORGANISER_ACCESS,
} from './TournamentAccessRights'

export function Tournament() {
    let match = useRouteMatch()
    const { i } = useParams()

    const dispatch = useDispatch()

    const roles = useSelector((state) => state.tournament.roles)
    const user = useSelector((state) => state.login)

    useEffect(() => {
        dispatch(createGetRoles({ tournamentId: i }))
    }, [i, dispatch])

    const accessRights = getAccessRights({ user, roles })

    return (
        <>
            <InnerLinksList tournamentId={i} />
            <Switch>
                <Route exact path={`${match.path}/result`}>
                    <ResultTable tournamentId={i} />
                </Route>
                {accessRights === ORGANISER_ACCESS && (
                    <Route exact path={`${match.path}/edit`}>
                        <CreateOrEditTournament tournamentId={i} />
                    </Route>
                )}
                <Route exact path={`${match.path}/judging`}>
                    <JudgingPage accessRights={accessRights} />
                </Route>
                }
                <Route exact path={`${match.path}`}>
                    <DefaultTournamentPage accessRights={accessRights} />
                </Route>
            </Switch>
        </>
    )
}

function InnerLinksList({ tournamentId }) {
    return (
        <Container
            fluid
            className='float-left  d-flex'
            style={{
                color: '#1c2f40',
                fontSize: '1.2em',
                fontFamily: 'Open Sans Condensed,sans-serif',
                fontWeight: 400,
                lineHeight: 'normal',
            }}
        >
            <Row noGutters>
                <Col md={4}>
                    <NavLink
                        to={`/tournaments/${tournamentId}`}
                        style={{
                            color: 'inherit',
                            textDecoration: 'underline',
                        }}
                        activeStyle={{
                            color: 'inherit',
                            textDecoration: 'underline',
                        }}
                    >
                        описание турнира
                    </NavLink>
                </Col>
                <Col md={1}>|</Col>
                <Col md={4}>
                    <NavLink
                        to={`/tournaments/${tournamentId}/result`}
                        style={{
                            color: 'inherit',
                            textDecoration: 'underline',
                        }}
                        activeStyle={{
                            color: 'inherit',
                            textDecoration: 'underline',
                        }}
                    >
                        результаты
                    </NavLink>
                </Col>

                <Col md={1}>|</Col>
                <Col md={2}>
                    <NavLink
                        to={`/tournaments/${tournamentId}/judging`}
                        style={{
                            color: 'inherit',
                            textDecoration: 'underline',
                        }}
                        activeStyle={{
                            color: 'inherit',
                            textDecoration: 'underline',
                        }}
                    >
                        судейство
                    </NavLink>
                </Col>
            </Row>
        </Container>
    )
}

function DefaultTournamentPage({ accessRights }) {
    const { i } = useParams()

    const dispatch = useDispatch()
    const participants = useSelector((state) => state.tournament.participants)

    const tournamentObjectFromDB = useSelector(
        (state) => state.tournament.tournamentObjectFromDB
    )
    const login = useSelector((state) => state.login)
    const username = useSelector(
        (state) => state.login.userObjectFromDB.Username
    )

    // const confirmed_participants = useSelector(state => state.tournament.participants);

    useEffect(() => {
        dispatch(createGetParticipants({ tournamentId: i }))
        dispatch(createGetTournamentObjectFromDB({ tournamentId: i }))
    }, [i, dispatch])

    const usernames = () => participants.map((x) => x['UserInfo']['Username'])
    const participateButtonText = () =>
        usernames().includes(username)
            ? 'Отказаться от участия'
            : 'Принять участие'
    const closeRegistrationButtonText = () => {
        if (!isRegistrationClosed()) {
            return 'Закрыть регистрацию'
        }
        if (isRegistrationClosed() && !isRegistrationClosedForever()) {
            return 'Открыть регистрацию'
        }
    }

    const startTournamentButtonText = () => {
        return 'Начать турнир!'
    }

    const endTournamentButtonText = () => {
        return 'Завершить турнир!'
    }

    const afterEndTournamentButtonText = () => {
        return 'Турнир завершён!'
    }

    const participate = () => {
        if (login.authorized) {
            if (!usernames().includes(username)) {
                dispatch(createParticipate({ tournamentId: i }))
            } else {
                dispatch(createRemoveParticipate({ tournamentId: i }))
            }
        } else {
            dispatch({ type: SHOW_SIGN_IN_FORM_ACTION })
        }
    }

    const closeRegistration = () => {
        if (!isRegistrationClosed()) {
            dispatch(
                createCloseRegistration({ tournamentId: i, isClosed: true })
            )
        }
        if (isRegistrationClosed() && !isRegistrationClosedForever()) {
            dispatch(
                createCloseRegistration({ tournamentId: i, isClosed: false })
            )
        }
    }

    const startTournament = () => {
        ;(async () => {
            if (!isRegistrationClosed()) {
                await dispatch(
                    createCloseRegistration({ tournamentId: i, isClosed: true })
                )
            }
            await dispatch(createStartTournament({ tournamentId: i }))
            await dispatch(createGetParticipants({ tournamentId: i }))
        })()
    }

    const endTournament = () => {
        dispatch(createEndTournament({ tournamentId: i }))
    }

    const isTournamentStarted = () => {
        return tournamentObjectFromDB['State'] === 3
    }

    const isTournamentClosed = () => {
        return tournamentObjectFromDB['State'] === 4
    }

    const isRegistrationClosed = () => {
        return tournamentObjectFromDB['State'] !== 0
    }

    const isRegistrationClosedForever = () => {
        return (
            isRegistrationClosed() &&
            tournamentObjectFromDB['State'] !== 1 &&
            tournamentObjectFromDB['State'] !== 2
        )
    }

    function onSelect(ids, isSelected) {
        if (accessRights !== NO_ACCESS && !isTournamentStarted()) {
            dispatch(
                createConfirmParticipant({
                    isConfirmed: isSelected,
                    tournamentPlayerIds: ids,
                    tournamentId: i,
                })
            )
            return true
        }

        dispatch(createGetParticipants({ tournamentId: i }))
        return false
    }

    if (participants === []) {
        return <div>Загрузка...</div>
    } else {
        return (
            <>
                <Container
                    fluid
                    className='float-left overflow-auto d-flex flex-column'
                >
                    <Row>
                        <Col xs={12} md={6}>
                            <Row noGutters>
                                <Col>
                                    <Caption text='Список участников турнира' />
                                    <ParticipantsList
                                        participants={participants}
                                        onSelect={onSelect}
                                        accessRights={accessRights}
                                        tournamentId={i}
                                    />
                                </Col>
                            </Row>

                            <Row className='mt-3 d-flex' noGutters>
                                <Col className='d-flex justify-content-center justify-content-lg-start align-items-center col-12 col-lg-4 mb-3 mb-lg-0'>
                                    {!isRegistrationClosed() && (
                                        <Button
                                            variant='dark'
                                            className='shadow-none'
                                            onClick={participate}
                                        >
                                            {participateButtonText()}
                                        </Button>
                                    )}
                                </Col>
                                {(accessRights === ORGANISER_ACCESS ||
                                    accessRights === JUDGE_ACCESS) && (
                                    <>
                                        <Col className='d-flex justify-content-center justify-content-lg-center align-items-center col-12 col-lg-4 mb-3 mb-lg-0'>
                                            {!isTournamentStarted() &&
                                                !isTournamentClosed() &&
                                                login.authorized && (
                                                    <Button
                                                        variant='outline-success'
                                                        size='lg'
                                                        className='shadow-none'
                                                        onClick={
                                                            startTournament
                                                        }
                                                    >
                                                        {startTournamentButtonText()}
                                                    </Button>
                                                )}
                                            {isTournamentStarted() &&
                                                login.authorized && (
                                                    <Button
                                                        variant='outline-danger'
                                                        size='lg'
                                                        className='shadow-none'
                                                        onClick={endTournament}
                                                    >
                                                        {endTournamentButtonText()}
                                                    </Button>
                                                )}
                                            {isTournamentClosed() && (
                                                <Button
                                                    variant='outline-danger'
                                                    size='lg'
                                                    className='shadow-none'
                                                    disabled
                                                >
                                                    {afterEndTournamentButtonText()}
                                                </Button>
                                            )}
                                        </Col>
                                        <Col className='d-flex justify-content-center justify-content-lg-end align-items-center col-12 col-lg-4'>
                                            {!isRegistrationClosedForever() &&
                                                login.authorized && (
                                                    <Button
                                                        variant='dark'
                                                        className='shadow-none'
                                                        onClick={
                                                            closeRegistration
                                                        }
                                                    >
                                                        {closeRegistrationButtonText()}
                                                    </Button>
                                                )}
                                        </Col>
                                    </>
                                )}
                            </Row>
                        </Col>

                        <Col
                            xs={12}
                            md={6}
                            className='scrollbox scrollbox_delayed mt-5 mt-md-0'
                        >
                            <div className='scrollbox-content'>
                                <Row noGutters className='w-75'>
                                    <Col>
                                        <Caption
                                            text={
                                                <div>
                                                    <span className='mr-3'>
                                                        Описание турнира
                                                    </span>
                                                    {accessRights ===
                                                        ORGANISER_ACCESS && (
                                                        <Badge
                                                            as={Link}
                                                            to={`/tournaments/${i}/edit/`}
                                                            variant='secondary'
                                                        >
                                                            редактировать
                                                        </Badge>
                                                    )}
                                                </div>
                                            }
                                        />
                                    </Col>
                                </Row>
                                <Row
                                    noGutters
                                    className='border border-secondary p-3'
                                    style={{
                                        borderRadius: '0.25em',
                                        overflow: 'auto',
                                    }}
                                >
                                    <TournamentDescription
                                        tournamentObjectFromDB={
                                            tournamentObjectFromDB
                                        }
                                    />
                                </Row>
                            </div>
                        </Col>
                    </Row>
                    {(isTournamentStarted() || isTournamentClosed()) && (
                        <Sortitions
                            sortitionsNumber={
                                tournamentObjectFromDB['CurrentRoundNum']
                            }
                            tournamentId={i}
                            accessRights={accessRights}
                        />
                    )}
                </Container>
            </>
        )
    }
}
