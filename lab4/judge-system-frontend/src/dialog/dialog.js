import { Button, Modal } from 'react-bootstrap'
import { useEffect, useMemo, useRef, useState } from 'react'

export function useDialog(title, body) {
    const [show, setShow] = useState(false)
    const [setResult, setResultFunction] = useState(null)
    const getResultPromise = () => {
        const resultPromise = new Promise(
            (resolve) => setResultFunction(() => resolve) // () => resolve вместо resolve здесь потому, что react вычисляет значение функции для оптимизаций
        )
        setShow(true)
        return resultPromise
    }
    const dialog = useMemo(
        () => (
            <Dialog
                {...{
                    show,
                    setResult,
                    title,
                    body,
                    onClose: () => setShow(false),
                }}
            />
        ),
        [show, setResult, body, title]
    )
    return [getResultPromise, dialog]
}

function Dialog({ show, setResult, title, body, onClose }) {
    return (
        <Modal
            show={show}
            onHide={() => {
                setResult(false)
                onClose()
            }}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{body}</Modal.Body>
            <Modal.Footer>
                <Button
                    variant="outline-success"
                    onClick={() => {
                        setResult(true)
                        onClose()
                    }}
                >
                    Да!
                </Button>
                <Button
                    variant="outline-danger"
                    onClick={() => {
                        setResult(false)
                        onClose()
                    }}
                >
                    Нет!
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
