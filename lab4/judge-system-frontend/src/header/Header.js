import {
    Container,
    Nav,
    Navbar,
    Button,
    Col,
} from 'react-bootstrap'
import logo from './logo.svg'
import './header.css'

import SignInModal from '../signin/SignInModal'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createLogout } from '../redux/actions'
import SignUpModal from '../signup/SignUpModal'
import { ErrorAlert } from '../alert/Alert'
import { Loader } from '../loader/Loader'
import {
    HIDE_SIGN_IN_FORM_ACTION,
    HIDE_SIGN_UP_FORM_ACTION,
    SHOW_SIGN_IN_FORM_ACTION,
    SHOW_SIGN_UP_FORM_ACTION,
} from '../redux/types'
import { Link, useHistory } from 'react-router-dom'
import { SearchInput } from '../forms/FormElements'

export default function Header() {
    const authorized = useSelector((state) => state.login.authorized)
    const username = useSelector(
        (state) => state.login.userObjectFromDB.Username
    )
    const dispatch = useDispatch()
    const showSignInModal = useSelector((state) => state.view.showSignInForm)
    const showSignUpModal = useSelector((state) => state.view.showSignUpForm)
    const history = useHistory()

    const [searchInputValue, setSearchInputValue] = useState('')

    return (
        <>
            <Navbar collapseOnSelect expand='lg' bg='dark' variant='dark'>
                <Container>
                    <Navbar.Brand as={Link} to='/main'>
                        <img
                            alt=''
                            src={logo}
                            width='30'
                            height='30'
                            className='d-inline-block align-top mr-sm-2'
                        />{' '}
                        IT-проекты в ГО
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls='responsive-navbar-nav' />
                    <Navbar.Collapse
                        id='responsive-navbar-nav'
                        className='justify-content-between'
                    >
                        <Container>
                            <Col className='d-flex justify-content-left'>
                                <Nav className='mr-auto' size='lg'>
                                    <Nav.Link as={Link} to='/main'>Турниры</Nav.Link>
                                    <Nav.Link as={Link} to='/tournaments/create'>Создать турнир</Nav.Link>
                                </Nav>
                            </Col>

                            <Col className='d-flex justify-content-center'>
                                {authorized ? (
                                    <Navbar.Text className='mr-3'>
                                        Signed in as:{' '}
                                        <Link to={`/profile/${username}`}>
                                            {username}
                                        </Link>
                                    </Navbar.Text>
                                ) : (
                                    <Button
                                        onClick={() => {
                                            dispatch({
                                                type: SHOW_SIGN_UP_FORM_ACTION,
                                            })
                                        }}
                                        variant='outline-light'
                                        className='mr-2 shadow-none'
                                        size='md'
                                    >
                                        Sign Up
                                    </Button>
                                )}
                                {authorized ? (
                                    <Button
                                        onClick={() => dispatch(createLogout())}
                                        variant='outline-danger'
                                        className='shadow-none'
                                        size='md'
                                    >
                                        Log Out
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => {
                                            dispatch({
                                                type: SHOW_SIGN_IN_FORM_ACTION,
                                            })
                                        }}
                                        variant='outline-light'
                                        className='shadow-none'
                                        size='md'
                                    >
                                        Sign In
                                    </Button>
                                )}
                            </Col>
                            <Col>
                                <SearchInput
                                    description='search'
                                    onSearch={(username) => {
                                        history.push(`/profile/${username}`)
                                        setSearchInputValue('')
                                    }}
                                    value={searchInputValue}
                                    onChange={setSearchInputValue}
                                />
                            </Col>
                        </Container>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <SignInModal
                show={showSignInModal}
                externalClose={() =>
                    dispatch({ type: HIDE_SIGN_IN_FORM_ACTION })
                }
            />
            <SignUpModal
                show={showSignUpModal}
                externalClose={() =>
                    dispatch({ type: HIDE_SIGN_UP_FORM_ACTION })
                }
            />
            <ErrorAlert />
            <Loader />
        </>
    )
}
