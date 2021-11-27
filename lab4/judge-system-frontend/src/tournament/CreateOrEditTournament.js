import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import React, { useEffect, useRef, useState } from 'react'
import {
    createCreateTournament,
    createGetTournamentObjectFromDB,
    createUpdateTournament,
} from '../redux/actions'
import * as yup from 'yup'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import { Formik } from 'formik'
import Caption from '../caption/Caption'

import { DateTimeInput, DropdownInput, TextInput } from '../forms/FormElements'
import {
    SET_EMPTY_TOURNAMENT_ACTION,
    SHOW_SIGN_IN_FORM_ACTION,
} from '../redux/types'

// tournamentId === -1, если создается новый турнир
export default function CreateOrEditTournament({ tournamentId }) {
    const authorized = useSelector((state) => state.login.authorized)
    const dispatch = useDispatch()
    const history = useHistory()
    const [useEffectFlag, setUseEffectFlag] = useState(false)
    const tournamentObjectFromDB = useSelector(
        (state) => state.tournament.tournamentObjectFromDB
    )

    const formikRef = useRef(null)
    useEffect(() => {
        if (formikRef.current !== null) {
            formikRef.current.validateForm()
        }
    }, [formikRef, useEffectFlag])

    useEffect(() => {
        if (authorized === false) {
            dispatch({ type: SHOW_SIGN_IN_FORM_ACTION })
        } else {
            if (!isThisNewTournament()) {
                ;(async () => {
                    await dispatch(
                        createGetTournamentObjectFromDB({ tournamentId })
                    )
                    setUseEffectFlag(true)
                })()
            } else {
                dispatch({ type: SET_EMPTY_TOURNAMENT_ACTION })
                setUseEffectFlag(true)
            }
        }
    }, [authorized, dispatch, tournamentId])

    const isThisNewTournament = () => tournamentId === -1

    const onFormSubmit = (data) => {
        if (isThisNewTournament()) {
            ;(async () => {
                await dispatch(createCreateTournament({ data }))
                history.push('/')
            })()
        } else {
            dispatch(createUpdateTournament({ tournamentId, data }))
        }
    }

    const caption = () => {
        if (isThisNewTournament()) {
            return <Caption text='Создание турнира' />
        }
        return <Caption text='Редактирование турнира' />
    }

    if (authorized === false) {
        return <Caption text='Необходима авторизация!' />
    }

    if (useEffectFlag === false) {
        return <></>
    }

    const required_message = 'Это поле не может быть пустым'

    const schema = yup.object().shape({
        Name: yup.string().required(required_message),
        LocationName: yup.string().required(required_message),
        RulesInfo: yup.string(),
        StartDate: yup.string().required(required_message),
        EndDate: yup.string().required(required_message),
        TournamentType: yup.string().required(required_message),
        ParticipationType: yup.string().required(required_message),
        IsHeadStart: yup.string().required(required_message),
        TimeControlInfo: yup.string().nullable(),
        IsRated: yup.string().required(required_message),
        RoundNum: yup.string().required(required_message),
        TossType: yup.string().required(required_message),
    })

    return (
        <Container>
            <Row className='justify-content-center'>
                <Col md={6} xs={12}>
                    {caption()}
                    <Formik
                        validationSchema={schema}
                        onSubmit={onFormSubmit}
                        enableReinitialize={true}
                        innerRef={formikRef}
                        initialValues={Object.fromEntries(
                            Object.entries(
                                tournamentObjectFromDB
                            ).map(([key, value]) => [key, value ?? ''])
                        )}
                    >
                        {({
                            handleSubmit,
                            handleChange,
                            handleBlur,
                            values,
                            touched,
                            isValid,
                            errors,
                            setFieldValue,
                        }) => (
                            <>
                                <Form noValidate onSubmit={handleSubmit}>
                                    <TextInput label='Название *' name='Name' />
                                    <TextInput
                                        label='Место проведения *'
                                        name='LocationName'
                                    />
                                    <DateTimeInput
                                        label='Начало'
                                        name='StartDate'
                                    />
                                    <DateTimeInput
                                        label='Конец'
                                        name='EndDate'
                                    />
                                    <DropdownInput
                                        label='Правила'
                                        name='RulesInfo'
                                        items={{
                                            Японские: {
                                                realValue: 'Японские',
                                                visibleValue: 'Японские',
                                            },
                                            Китайские: {
                                                realValue: 'Китайские',
                                                visibleValue: 'Китайские',
                                            },
                                        }}
                                        textItems={{
                                            Произвольные: {
                                                realValue: {
                                                    isSimpleText: true,
                                                    state: '',
                                                },
                                                visibleValue: 'Произвольные',
                                            },
                                        }}
                                    />
                                    <DropdownInput
                                        label='Контроль времени'
                                        name='TimeControlInfo'
                                        items={{}}
                                        textItems={{
                                            Абсолют: {
                                                realValue: {
                                                    isSimpleText: true,
                                                    state: 'основное: ???',
                                                },
                                                visibleValue: 'Абсолют',
                                            },
                                            Фишер: {
                                                realValue: {
                                                    isSimpleText: true,
                                                    state:
                                                        'основное: ??? + ??? секунд на каждый ход',
                                                },
                                                visibleValue: 'Фишер',
                                            },
                                        }}
                                    />
                                    <DropdownInput
                                        label='Тип турнира *'
                                        name='ParticipationType'
                                        items={{
                                            Личный: {
                                                realValue: 0,
                                                visibleValue: 'Личный',
                                            },
                                            Командный: {
                                                realValue: 1,
                                                visibleValue: 'Командный',
                                            },
                                        }}
                                    />
                                    <DropdownInput
                                        label='Вид турнира *'
                                        name='TournamentType'
                                        items={{
                                            Спортивный: {
                                                realValue: 0,
                                                visibleValue: 'Спортивный',
                                            },
                                            Фестивальный: {
                                                realValue: 1,
                                                visibleValue: 'Фестивальный',
                                            },
                                        }}
                                    />
                                    <DropdownInput
                                        label='Вид жеребьёвки *'
                                        name='TossType'
                                        items={{
                                            'Мак Магон': {
                                                realValue: 0,
                                                visibleValue: 'Мак Магон',
                                            },
                                            'Олимпийская система': {
                                                realValue: 1,
                                                visibleValue:
                                                    'Олимпийская система',
                                            },
                                            Круговая: {
                                                realValue: 2,
                                                visibleValue:
                                                    'Круговая жеребьевка',
                                            },
                                        }}
                                    />
                                    <TextInput
                                        label='Количество раундов *'
                                        name='RoundNum'
                                    />
                                    <DropdownInput
                                        label='Фора *'
                                        name='IsHeadStart'
                                        items={{
                                            Да: {
                                                realValue: true,
                                                visibleValue: 'да',
                                            },
                                            Нет: {
                                                realValue: false,
                                                visibleValue: 'нет',
                                            },
                                        }}
                                    />
                                    <DropdownInput
                                        label='Рейтинговый *'
                                        name='IsRated'
                                        items={{
                                            Да: {
                                                realValue: true,
                                                visibleValue: 'да',
                                            },
                                            Нет: {
                                                realValue: false,
                                                visibleValue: 'нет',
                                            },
                                        }}
                                    />

                                    <Button
                                        type='submit'
                                        variant='outline-success'
                                        className='shadow-none float-right'
                                    >
                                        Отправить!
                                    </Button>
                                </Form>
                            </>
                        )}
                    </Formik>
                </Col>
            </Row>
        </Container>
    )
}
