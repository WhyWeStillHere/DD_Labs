import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import { Col, Row, Button } from 'react-bootstrap'
import Sortition from './Sortition'
import { useDispatch, useSelector } from 'react-redux'
import {
    addError,
    createGenerateToss,
    createGetSortition,
    createStartNextRound,
} from '../redux/actions'
import Caption from '../caption/Caption'
import { JUDGE_ACCESS, ORGANISER_ACCESS } from './TournamentAccessRights'
import { SearchInput } from '../forms/FormElements'
import { useDialog } from '../dialog/dialog'

export default function Sortitions({
    sortitionsNumber,
    tournamentId,
    accessRights,
}) {
    const lastSortition = useSelector(
        (state) => state.tournament.sortitions[sortitionsNumber - 1]
    )
    const participants = useSelector((state) => state.tournament.participants)
    const mapPlayerIdWithUser = (playerId) => {
        const arrayId = participants
            .map((participant) => participant['Id'])
            .indexOf(playerId)
        if (arrayId === -1) return 'empty'
        return participants[arrayId]['UserInfo']['Username']
    }

    const liveParticipants = participants.filter(
        (participant) => participant['RegistrationStatus'] === 1
    )
    const usernames = liveParticipants.map((x) => x['UserInfo']['Username'])

    const [sortition, setSortition] = useState(<></>)
    const dispatch = useDispatch()

    let [pairs, setPairs] = useState([])

    useEffect(
        () =>
            setPairs(
                (lastSortition === undefined
                    ? []
                    : lastSortition
                ).map((game) => [
                    mapPlayerIdWithUser(game['FirstPlayerId']),
                    mapPlayerIdWithUser(game['SecondPlayerId']),
                ])
            ),
        [lastSortition]
    )
    const [pairToAdd, setPairToAdd] = useState(['', ''])
    const [pairToRemove, setPairToRemove] = useState(['', ''])
    useEffect(() => {
        if (sortitionsNumber > 0) {
            dispatch(
                createGetSortition({
                    tournamentId,
                    sortitionId: sortitionsNumber - 1,
                })
            )
        }
    }, [sortitionsNumber, tournamentId])

    const addPair = (pair) => {
        console.log(pair, pairs)
        if (usernames.includes(pair[0]) && usernames.includes(pair[1])) {
            if (
                !pairs.find(
                    (p) =>
                        p[0] === pair[0] ||
                        p[1] === pair[1] ||
                        p[0] === pair[1] ||
                        p[1] === pair[0]
                )
            ) {
                setPairs([...pairs, pair])
                setPairToAdd(['', ''])
            } else {
                addError(
                    dispatch,
                    'Не удалось добавить пару. Один из пользователей уже состоит в паре. Сначала удалите его пару, затем создайте новую'
                )
            }
        } else {
            addError(
                dispatch,
                'Не удалось добавить пару. Данные пользователи не участвуют в турнире'
            )
        }
    }

    const removePair = (pair) => {
        console.log(pair, pairs)
        if (usernames.includes(pair[0]) && usernames.includes(pair[1])) {
            const pairIndex = pairs.findIndex(
                (p) =>
                    (p[0] === pair[0] && p[1] === pair[1]) ||
                    (p[0] === pair[1] && p[1] === pair[0])
            )
            if (pairIndex !== -1) {
                let oldPairs = [...pairs]
                oldPairs.splice(pairIndex, 1)
                setPairs(oldPairs)
                setPairToRemove(['', ''])
            } else {
                addError(
                    dispatch,
                    'Не удалось удалить пару. Такой пары не существует'
                )
            }
        } else {
            addError(
                dispatch,
                'Не удалось удалить пару. Данные пользователи не участвуют в турнире'
            )
        }
    }

    const [showPairList, setShowPairList] = useState(false)

    const generateToss = () => {
        ;(async () => {
            await dispatch(createGenerateToss({ tournamentId, pairs }))
            dispatch(
                createGetSortition({
                    tournamentId,
                    sortitionId: sortitionsNumber - 1,
                })
            )
        })()
    }

    const sortitionSelect = (sortitionId) => {
        ;(async () => {
            await dispatch(createGetSortition({ tournamentId, sortitionId }))
            setSortition(
                <Sortition
                    tournamentId={tournamentId}
                    sortitionId={sortitionId}
                />
            )
        })()
    }

    const [getDialogResultPromise, dialog] = useDialog(
        'Вы уверены?',
        'После этого действия Вы не сможете менять результаты прошлого раунда'
    )

    const startNextRound = () => {
        ;(async () => {
            const dialogResult = await getDialogResultPromise()
            if (dialogResult === true) {
                await dispatch(createStartNextRound({ tournamentId }))
            }
        })()
    }

    return (
        <>
            <Row className='d-flex justify-content-center mt-4 border-top border-dark'>
                <Caption text='Жеребьёвки' />
            </Row>
            <Row>
                <Col className='d-flex'>
                    {sortitionsNumber > 0 && (
                        <ReactPaginate
                            previousLabel={'previous'}
                            nextLabel={'next'}
                            breakLabel={'...'}
                            breakLinkClassName={'btn shadow-none mx-1 mt-2'}
                            pageCount={sortitionsNumber}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            pageLinkClassName={'btn border mx-1 mt-2'}
                            activeLinkClassName={
                                'btn btn-dark shadow-none mx-1 mt-2'
                            }
                            containerClassName={'row no-gutters list-inline'}
                            previousLinkClassName={
                                'btn btn-outline-dark shadow-none mx-1 mt-2'
                            }
                            nextLinkClassName={
                                'btn btn-outline-dark shadow-none mx-1 mt-2'
                            }
                            onPageChange={(page) =>
                                sortitionSelect(page['selected'])
                            }
                            initialPage={sortitionsNumber - 1}
                            // subContainerClassName={'btn btn-success'}
                        />
                    )}
                    {(accessRights === JUDGE_ACCESS ||
                        accessRights === ORGANISER_ACCESS) && (
                        <>
                            {dialog}
                            <Button
                                variant='outline-success'
                                className='shadow-none mt-2 ml-2'
                                style={{ marginBottom: '1rem' }}
                                onClick={startNextRound}
                            >
                                Новый раунд!
                            </Button>
                        </>
                    )}
                </Col>
            </Row>
            <Row noGutters>
                {(accessRights === JUDGE_ACCESS ||
                    accessRights === ORGANISER_ACCESS) && (
                    <>
                        <Col className='col-auto'>
                            <Button
                                variant='outline-success'
                                className='shadow-none'
                                onClick={() => addPair(pairToAdd)}
                            >
                                Добавить пару
                            </Button>
                        </Col>
                        <Col className='col-auto ml-2'>
                            <SearchInput
                                description='Первый участник'
                                onChange={(username) =>
                                    setPairToAdd((oldPair) => [
                                        username,
                                        oldPair[1],
                                    ])
                                }
                                value={pairToAdd[0]}
                            />
                        </Col>
                        <Col className='col-auto ml-2'>
                            <SearchInput
                                description='Второй участник'
                                onChange={(username) =>
                                    setPairToAdd((oldPair) => [
                                        oldPair[0],
                                        username,
                                    ])
                                }
                                value={pairToAdd[1]}
                            />
                        </Col>
                    </>
                )}
            </Row>
            <Row noGutters className='mt-2 mb-2'>
                {(accessRights === JUDGE_ACCESS ||
                    accessRights === ORGANISER_ACCESS) && (
                    <>
                        <Col className='col-auto'>
                            <Button
                                variant='outline-danger'
                                className='shadow-none'
                                onClick={() => removePair(pairToRemove)}
                            >
                                Удалить пару
                            </Button>
                        </Col>
                        <Col className='col-auto ml-2'>
                            <SearchInput
                                description='Первый участник'
                                onChange={(username) =>
                                    setPairToRemove((oldPair) => [
                                        username,
                                        oldPair[1],
                                    ])
                                }
                                value={pairToRemove[0]}
                            />
                        </Col>
                        <Col className='col-auto ml-2'>
                            <SearchInput
                                description='Второй участник'
                                onChange={(username) =>
                                    setPairToRemove((oldPair) => [
                                        oldPair[0],
                                        username,
                                    ])
                                }
                                value={pairToRemove[1]}
                            />
                        </Col>
                    </>
                )}
            </Row>
            <Row className='mb-2'>
                {(accessRights === JUDGE_ACCESS ||
                    accessRights === ORGANISER_ACCESS) && (
                    <>
                        <Col className='col-auto'>
                            <Button
                                variant={'outline-secondary'}
                                onClick={() => setShowPairList(!showPairList)}
                            >
                                Текущий список пар
                            </Button>
                        </Col>
                        <Col className='col-auto'>
                            <Button
                                variant={'outline-primary'}
                                onClick={generateToss}
                            >
                                Сгенерировать новую жеребьевку
                            </Button>
                        </Col>
                    </>
                )}
            </Row>

            {showPairList && (
                <Row className='mb-2'>
                    {(accessRights === JUDGE_ACCESS ||
                        accessRights === ORGANISER_ACCESS) && (
                        <Col className='ml-4'>
                            {pairs.map((pair, pairId) => (
                                <p key={pairId} className='mb-1'>
                                    {pairId}. {pair[0]} - {pair[1]}
                                </p>
                            ))}
                        </Col>
                    )}
                </Row>
            )}
            <Row>
                <Col>{sortition}</Col>
            </Row>
        </>
    )
}
