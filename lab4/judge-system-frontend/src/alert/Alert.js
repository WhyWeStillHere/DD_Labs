import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { Alert, Container } from 'react-bootstrap'
import { removeError } from '../redux/actions'

export function ErrorAlert() {
    const [show, setShow] = useState(false)
    const dispatch = useDispatch()
    const status = useSelector((state) => state.status)

    const errors = () => {
        return status.errors
            .map((message, id) => {
                return { message, id }
            })
            .filter((error) => error.message !== null)
    }

    const closeAlert = (id) => {
        removeError(dispatch, id)
    }

    useEffect(() => {
        if (errors().length !== 0) {
            setShow(true)
        } else {
            setShow(false)
        }
    }, [status])

    return (
        <>
            {show && (
                <Container
                    fluid
                    className="d-flex h-100 fixed-top flex-column justify-content-center align-items-center"
                    style={{ visibility: 'hidden' }}
                >
                    {errors().map((error, id) => (
                        <Alert
                            key={id}
                            className="text-center"
                            style={{ visibility: 'visible' }}
                            show={show}
                            variant="danger"
                            onClose={() => {
                                closeAlert(error.id)
                            }}
                            dismissible
                        >
                            <p>{error.message}</p>
                        </Alert>
                    ))}
                </Container>
            )}
        </>
    )
}
