import { Button, Container, Form, Modal, Row } from 'react-bootstrap'
import logo from './logo.png'
import './sign_in_modal.css'

import { useDispatch } from 'react-redux'
import { createSignIn } from '../redux/actions'
import React, { useState } from 'react'
import {SHOW_SIGN_UP_FORM_ACTION} from "../redux/types";

export default function SignInModal({ show, externalClose }) {
    const dispatch = useDispatch()

    let initial_fields = { username: '', password: '' }
    let [fields, setFields] = useState(initial_fields)

    let initial_valids = {}
    for (let key in fields) {
        initial_valids[key] = 'is-invalid'
    }

    let [valids, setValids] = useState(initial_valids)

    async function updateField(key, event) {
        let new_fields = fields
        new_fields[key] = event.target.value

        let new_valid = 'is-valid'

        if (new_fields[key].length === 0) {
            new_valid = 'is-invalid'
        }

        setFields(new_fields)
        setValids((prevState) => ({ ...prevState, [key]: new_valid }))
    }

    async function send() {
        await dispatch(
            createSignIn({
                username: fields['username'],
                password: fields['password'],
            })
        )
        console.log('close')
        close()
    }

    const close = () => {
        externalClose()
        setFields(initial_fields)
        setValids(initial_valids)
    }

    const swap = () => {
        externalClose()
        dispatch({
            type: SHOW_SIGN_UP_FORM_ACTION,
        })
    }

    return (
        <Modal
            show={show}
            onHide={close}
            backdrop="static"
            keyboard={false}
            className="dark"
        >
            <Modal.Header closeButton>
                <Container>
                    <Row className="justify-content-center mb-3">
                        <img
                            alt=""
                            src={logo}
                            width="40"
                            height="40"
                            className="align-top"
                        />
                    </Row>
                    <Row className="justify-content-center">
                        <Modal.Title>Sign In</Modal.Title>
                    </Row>
                </Container>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {Object.entries(valids).map(([key, value], id) => (
                        <Form.Control
                            key={key}
                            onChange={(event) => updateField(key, event)}
                            type={key}
                            placeholder={key}
                            className={`${value} mb-2`}
                            value={fields[key]}
                        />
                    ))}
                </Form>

                <text onClick={swap} style={{
                    color: 'inherit',
                    textDecoration: 'underline',
                }}>
                    Создать аккаунт
                </text>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={close}>
                    Close
                </Button>
                <Button variant="outline-success" onClick={send}>
                    Sign In
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
