import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { Container, Spinner } from 'react-bootstrap'

export function Loader() {
    const [show, setShow] = useState(false)
    const status = useSelector((state) => state.status)

    const isRunning = () => {
        return (
            status.runnings.filter((running) => running === true).length !== 0
        )
    }

    useEffect(() => {
        if (isRunning()) {
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
                    className="d-flex h-100 justify-content-center align-items-center fixed-top"
                    style={{ visibility: 'hidden' }}
                >
                    <Spinner
                        animation="grow"
                        variant="secondary"
                        style={{ visibility: 'visible' }}
                    />
                </Container>
            )}
        </>
    )
}
