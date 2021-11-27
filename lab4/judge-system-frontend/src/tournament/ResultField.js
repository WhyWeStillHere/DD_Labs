import { Button, DropdownButton, Dropdown, ButtonGroup } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { createSetGameResult } from '../redux/actions'
import DropdownToggle from 'react-bootstrap/DropdownToggle'
import DropdownMenu from 'react-bootstrap/DropdownMenu'

export default function ResultField({
    tournamentId,
    sortitionId,
    gameId,
    resultType,
}) {
    const dispatch = useDispatch()
    const authorized = useSelector((state) => state.login.authorized)

    const buttonClick = (resultType) => {
        dispatch(
            createSetGameResult({
                tournamentId,
                sortitionId,
                gameId,
                resultType,
            })
        )
    }

    const resultTypeMatchTitle = {
        0: 'Другое',
        1: 'Другое',
        5: 'Ничья',
        4: 'Игра не началась',
    }

    return (
        <ButtonGroup>
            <Button
                disabled={!authorized}
                onClick={() => buttonClick(0)}
                variant={resultType === 0 ? 'dark' : 'outline-dark'}
                className="shadow-none mr-2"
                style={{ borderRadius: '4px' }}
                value={1}
            >
                1
            </Button>
            <Button
                disabled={!authorized}
                onClick={() => buttonClick(1)}
                variant={resultType === 1 ? 'dark' : 'outline-dark'}
                className="shadow-none mr-2"
                style={{ borderRadius: '4px' }}
                value={2}
            >
                2
            </Button>
            <Dropdown>
                <Dropdown.Toggle
                    disabled={!authorized}
                    variant={resultType > 1 ? 'dark' : 'outline-dark'}
                    id="dropdown-basic-button"
                    style={{ boxShadow: 'none' }}
                >
                    {resultTypeMatchTitle[resultType]}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={() => buttonClick(5)}>
                        {resultTypeMatchTitle[5]}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => buttonClick(4)}>
                        {resultTypeMatchTitle[4]}
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </ButtonGroup>
    )
}
