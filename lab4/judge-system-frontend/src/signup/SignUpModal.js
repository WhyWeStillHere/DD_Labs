import { Button, Container, Form, Modal, Row } from 'react-bootstrap'
import logo from './logo.png'
import './sign_up_modal.css'

import { useDispatch } from 'react-redux'
import { createSignUp } from '../redux/actions'
import React, { useState } from 'react'
import {SHOW_SIGN_IN_FORM_ACTION} from "../redux/types";

export default function SignUpModal({ show, externalClose }) {
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

    function send() {
        dispatch(
            createSignUp({
                username: fields['username'],
                password: fields['password'],
            })
        )
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
            type: SHOW_SIGN_IN_FORM_ACTION,
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
                        <Modal.Title>Sign Up</Modal.Title>
                    </Row>
                </Container>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {Object.entries(valids).map(([key, value]) => (
                        <Form.Control
                            key={key}
                            onChange={(event) => updateField(key, event)}
                            type={key}
                            placeholder={key}
                            className={`${value} mb-2`}
                        />
                    ))}
                </Form>
                <text onClick={swap} style={{
                    color: 'inherit',
                    textDecoration: 'underline',
                }}>
                    Уже есть аккаунт
                </text>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={close}>
                    Close
                </Button>
                <Button variant="outline-success" onClick={send}>
                    Sign Up
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
