import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useRef, useState } from 'react'
import {
    addError,
    createGetProfile,
    createGetRfgInfo,
    createGetUser,
    createGetUserId,
    createSetRole,
    createUpdateUser,
} from '../redux/actions'
import * as yup from 'yup'
import {
    Badge,
    Button,
    Col,
    Container,
    Dropdown,
    Form,
    Row,
} from 'react-bootstrap'
import { Formik, useField } from 'formik'
import Caption from '../caption/Caption'

import moment from 'moment'
import { SHOW_SIGN_IN_FORM_ACTION } from '../redux/types'
import {
    DateInput,
    DropdownInput,
    TextField,
    TextInput,
} from '../forms/FormElements'
import { useHistory, useParams } from 'react-router-dom'
import { useDialog } from '../dialog/dialog'
import { createGetRfgInfoURL } from '../sources/Sources'

const getUserRoles = (userObjectFromDB) => {
    let roles = []
    if (userObjectFromDB['Confirmed'] === true) {
        roles.push(1)
    }
    if (userObjectFromDB['OfficialRole'] === 1) {
        roles.push(3)
    }

    return roles
}

function OwnerProfile({ profile }) {
    let history = useHistory()
    const dispatch = useDispatch()
    const userObjectFromDB = profile['userObjectFromDB']
    const rfgInfo = useSelector((state) => state.profile.rfgInfo)
    const userId = profile['id']
    const userRoles = getUserRoles(userObjectFromDB)

    const formikRef = useRef(null)
    useEffect(() => {
        if (formikRef.current !== null) {
            formikRef.current.validateForm()
        }
    }, [formikRef])

    const required_message = 'Это поле не может быть пустым'

    const schema = yup.object().shape({
        FirstName: yup.string(),
        SecondName: yup.string(),
        Email: yup.string().email('Введите корректный email'),
        MiddleName: yup.string(),
        Username: yup.string().required(required_message),
        City: yup.string(),
        NewPassword: yup.string(),
        CurrentPassword: yup.string(),
        BirthDate: yup.string(),
        Rating: yup.string(),
    })

    const [getDialogResultPromise, dialog] = useDialog(
        'Вы уверены?',
        'В случае изменения имени или фамилии Вы потеряете Ваш статус'
    )

    const agreeAndUpdate = async (updateFunction) => {
        const answer = await getDialogResultPromise()
        if (answer === true) {
            updateFunction()
        }
    }

    return (
        <>
            <Row noGutters className='mb-3' style={{ fontSize: '1.3em' }}>
                {userRoles.indexOf(1) !== -1 ? (
                    <Badge pill variant='success' className='mr-2'>
                        Подтвержденный игрок
                    </Badge>
                ) : (
                    <Badge pill variant='danger' className='mr-2'>
                        Не подтвержденный игрок
                    </Badge>
                )}
                {userRoles.indexOf(3) !== -1 && (
                    <Badge pill variant='success'>
                        Официальный организатор
                    </Badge>
                )}
            </Row>
            {dialog}
            <Formik
                validationSchema={schema}
                innerRef={formikRef}
                onSubmit={(data, { resetForm }) =>
                    agreeAndUpdate(async () => {
                        let result = await dispatch(
                            createUpdateUser({
                                userId: userId,
                                data: {
                                    ...data,
                                    BirthDate: moment
                                        .utc(data['BirthDate'], 'YYYY-MM-DD')
                                        .toDate(),
                                },
                            })
                        )
                        if (!(result instanceof Error)) {
                            if (
                                userObjectFromDB.Username !== data['Username']
                            ) {
                                history.push(`/profile/${data['Username']}`)
                            }
                        }
                        await dispatch(createGetProfile({ userId }))
                        resetForm()
                    })
                }
                initialValues={{
                    ...Object.fromEntries(
                        Object.entries(userObjectFromDB).map(([key, value]) => [
                            key,
                            value ? value : '',
                        ])
                    ),
                    NewPassword: '',
                    CurrentPassword: '',
                }}
                enableReinitialize={true}
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
                    resetForm,
                }) => (
                    <>
                        <Form noValidate onSubmit={handleSubmit}>
                            {userRoles.includes(1) && (
                                <TextField
                                    label='Рейтинг'
                                    value={rfgInfo['Rating']}
                                />
                            )}
                            <TextInput label='Имя' name='FirstName' />
                            <TextInput label='Фамилия' name='SecondName' />
                            <TextInput label='Отчество' name='MiddleName' />
                            <DateInput label='Дата рождения' name='BirthDate' />
                            <TextInput label='Логин *' name='Username' />
                            <TextInput label='Город' name='City' />
                            <TextInput
                                label='Email'
                                name='Email'
                                type='email'
                            />
                            <TextInput
                                label='Новый пароль'
                                name='NewPassword'
                                type='password'
                            />
                            <TextInput
                                label='Текущий пароль'
                                name='CurrentPassword'
                                type='password'
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
        </>
    )
}

function UserProfile({ profile }) {
    const dispatch = useDispatch()
    const userObjectFromDB = Object.fromEntries(
        Object.entries(profile['userObjectFromDB']).map(([key, value]) => [
            key,
            value ? value : '',
        ])
    )
    const ownerUserObjectFromDB = useSelector(
        (state) => state.login.userObjectFromDB
    )
    const rfgInfo = useSelector((state) => state.profile.rfgInfo)
    const userId = profile['id']
    const userRoles = getUserRoles(userObjectFromDB)

    const ownerRoles = getUserRoles(ownerUserObjectFromDB)

    const setRole = (role) => {
        dispatch(createSetRole({ userId, role }))
    }

    const checkAndSetRole = (role) => {
        if (
            userObjectFromDB['FirstName'] === null ||
            userObjectFromDB['SecondName'] === null
        ) {
            addError(
                dispatch,
                'У пользователя отсутствует имя или фамилия. Они необходимы для идентификации'
            )
        } else {
            setRole(role)
        }
    }

    return (
        <>
            <Row noGutters className='mb-3 d-flex justify-content-between'>
                <Dropdown>
                    <Dropdown.Toggle
                        variant={
                            userRoles.indexOf(1) !== -1
                                ? 'outline-success'
                                : 'outline-danger'
                        }
                        style={{ boxShadow: 'none' }}
                        disabled={!ownerRoles.includes(3)}
                    >
                        {userRoles.indexOf(1) !== -1
                            ? 'Подтверждённый игрок'
                            : 'Не подтверждённый игрок'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => checkAndSetRole(1)}>
                            Подтверждённый игрок
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setRole(2)}>
                            Не подтверждённый игрок
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <Dropdown>
                    <Dropdown.Toggle
                        variant={
                            userRoles.indexOf(3) !== -1
                                ? 'outline-success'
                                : 'outline-danger'
                        }
                        style={{ boxShadow: 'none' }}
                        disabled={!ownerRoles.includes(3)}
                    >
                        {userRoles.indexOf(3) !== -1
                            ? 'Официальный организатор'
                            : 'Не официальный организатор'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => checkAndSetRole(3)}>
                            Официальный организатор
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setRole(4)}>
                            Не официальный организатор
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Row>

            <Form noValidate>
                {userRoles.includes(1) && (
                    <TextField label='Рейтинг' value={rfgInfo['Rating']} />
                )}
                <TextField label='Имя' value={userObjectFromDB['FirstName']} />
                <TextField
                    label='Фамилия'
                    value={userObjectFromDB['SecondName']}
                />
                <TextField
                    label='Отчество'
                    value={userObjectFromDB['MiddleName']}
                />
                <TextField
                    label='Дата рождения'
                    value={userObjectFromDB['BirthDate']}
                />
                <TextField label='City' value={userObjectFromDB['City']} />
                <TextField label='Логин' value={userObjectFromDB['Username']} />
                <TextField label='Email' value={userObjectFromDB['Email']} />
            </Form>
        </>
    )
}

export default function PersonalArea() {
    const { username } = useParams()
    const authorized = useSelector((state) => state.login.authorized)
    const ownerUsername = useSelector(
        (state) => state.login.userObjectFromDB.Username
    )
    const ownerId = useSelector((state) => state.login.id)
    const dispatch = useDispatch()
    const profile = useSelector((state) => state.profile)
    const userRoles = getUserRoles(profile.userObjectFromDB)

    const isOwner = username === ownerUsername

    const [useEffectFlag, setUseEffectFlag] = useState(false)
    useEffect(() => {
        if (authorized) {
            ;(async () => {
                let userId = await dispatch(createGetUserId({ username }))
                await dispatch(createGetProfile({ userId }))
                await dispatch(createGetUser({ userId: ownerId }))
                setUseEffectFlag(true)
            })()
        } else {
            dispatch({ type: SHOW_SIGN_IN_FORM_ACTION })
        }
    }, [authorized, dispatch, username])

    useEffect(() => {
        if (useEffectFlag) {
            if (userRoles.includes(1)) {
                ;(async () => {
                    let userId = await dispatch(createGetUserId({ username }))
                    dispatch(
                        createGetRfgInfo({
                            fullName:
                                profile.userObjectFromDB.SecondName +
                                ' ' +
                                profile.userObjectFromDB.FirstName,
                            userId,
                        })
                    )
                })()
            }
        }
    }, [profile.userObjectFromDB, useEffectFlag])

    if (authorized === false) {
        return <Caption text='Необходима авторизация!' />
    }

    if (useEffectFlag === false) {
        return <></>
    }

    return (
        <Container className='vh-100'>
            <Row className='d-flex justify-content-center'>
                <Col xs={12} md={6}>
                    <Caption text='Информация о пользователе' />
                    {isOwner ? (
                        <OwnerProfile profile={profile} />
                    ) : (
                        <UserProfile profile={profile} />
                    )}
                </Col>
            </Row>
        </Container>
    )
}
