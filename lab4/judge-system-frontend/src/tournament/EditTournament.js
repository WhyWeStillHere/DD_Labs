import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { createGetUser, createUpdateUser } from '../redux/actions'
import * as yup from 'yup'
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap'
import { Formik, useField } from 'formik'
import Caption from '../caption/Caption'

import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import moment from 'moment'

const TextInput = ({ label, ...props }) => {
    const [field, meta] = useField(props)
    return (
        <Form.Group controlId={label}>
            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text id={label}>{label}</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                    {...field}
                    aria-describedby={label}
                    type="text"
                    {...props}
                    isValid={meta.touched && !meta.error}
                    isInvalid={meta.touched && !!meta.error}
                />
                <Form.Control.Feedback type="invalid">
                    {meta.error}
                </Form.Control.Feedback>
            </InputGroup>
        </Form.Group>
    )
}

const DateInput = ({ label, ...props }) => {
    const [field, meta, helpers] = useField(props)

    const { setValue } = helpers

    const [show, setShow] = useState(false)

    return (
        <Form.Group controlId={label}>
            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text id={label}>{label}</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                    {...field}
                    aria-describedby={label}
                    type="text"
                    {...props}
                    isValid={meta.touched && !meta.error}
                    isInvalid={meta.touched && !!meta.error && !show}
                    readOnly
                    onClick={() => setShow(!show)}
                />
                <Form.Control.Feedback type="invalid">
                    {meta.error}
                </Form.Control.Feedback>
            </InputGroup>
            {show && (
                <Calendar
                    onClickDay={(date) => {
                        setValue(moment(date).format('YYYY-MM-DD'))
                        setShow(false)
                    }}
                    value={new Date()}
                    calendarType="ISO 8601"
                    defaultView="year"
                    minDetail="decade"
                />
            )}
        </Form.Group>
    )
}

export default function EditTournament() {
    const authorized = useSelector((state) => state.login.authorized)
    const userId = useSelector((state) => state.login.id)
    const userObjectFromDB = useSelector(
        (state) => state.login.userObjectFromDB
    )
    const dispatch = useDispatch()

    let history = useHistory()

    useEffect(() => {
        dispatch(createGetUser({ userId }))
    }, [userId, dispatch])

    if (authorized === false) {
        history.push('#sign_in')
        return <> </>
    }

    const required_message = 'Это поле не может быть пустым'

    const schema = yup.object().shape({
        FirstName: yup.string().required(required_message).nullable(),
        SecondName: yup.string().required(required_message).nullable(),
        Email: yup.string().email().required(required_message).nullable(),
        MiddleName: yup.string().nullable(),
        Username: yup.string().required(required_message),
        Password: yup.string().nullable(),
        BirthDate: yup.string().required(required_message).nullable(),
    })

    return (
        <Container className="vh-100">
            <Row>
                <Col xs={12} md={6}>
                    <Caption text="Участие в турнирах" />
                </Col>
                <Col xs={12} md={6}>
                    <Caption text="Информация о пользователе" />
                    <Formik
                        validationSchema={schema}
                        onSubmit={(data) =>
                            dispatch(
                                createUpdateUser({
                                    userId: userId,
                                    data: {
                                        ...data,
                                        BirthDate: moment
                                            .utc(
                                                data['BirthDate'],
                                                'YYYY-MM-DD'
                                            )
                                            .toDate(),
                                    },
                                })
                            )
                        }
                        initialValues={userObjectFromDB}
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
                        }) => (
                            <>
                                <Form noValidate onSubmit={handleSubmit}>
                                    <TextInput label="Имя" name="FirstName" />
                                    <TextInput
                                        label="Фамилия"
                                        name="SecondName"
                                    />
                                    <TextInput
                                        label="Отчество"
                                        name="MiddleName"
                                    />
                                    <DateInput
                                        label="Дата рождения"
                                        name="BirthDate"
                                    />
                                    <TextInput label="Логин" name="Username" />
                                    <TextInput
                                        label="Email"
                                        name="Email"
                                        type="email"
                                    />
                                    <TextInput
                                        label="Пароль"
                                        name="Password"
                                        type="password"
                                    />

                                    <Button
                                        type="submit"
                                        variant="outline-success"
                                        className="shadow-none float-right"
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
