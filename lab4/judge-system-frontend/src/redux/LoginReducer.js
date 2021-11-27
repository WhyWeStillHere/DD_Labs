import {
    GET_TOKEN_ACTION,
    GET_USER_ACTION,
    LOGOUT_ACTION,
    SIGN_IN_ACTION,
} from './types'
import { loadState } from '../local_storage/load_save'

const emptyLogin = {
    authorized: false,
    refreshToken: '',
    accessToken: '',
    id: null,
    userObjectFromDB: {
        Username: '',
        FirstName: '',
        SecondName: '',
        MiddleName: '',
        Password: '',
        Email: '',
        BirthDate: '',
        OfficialRole: '',
    },
}

const initialLogin =
    loadState('login') === undefined
        ? emptyLogin
        : { ...emptyLogin, ...loadState('login') }

export const LoginReducer = (login = initialLogin, action) => {
    if (action.type === SIGN_IN_ACTION) {
        return { ...login, ...action.payload }
    }
    if (action.type === LOGOUT_ACTION) {
        return emptyLogin
    }
    if (action.type === GET_USER_ACTION) {
        return {
            ...login,
            userObjectFromDB: action['payload']['userObjectFromDB'],
        }
    }
    if (action.type === GET_TOKEN_ACTION) {
        return { ...login, ...action.payload }
    }
    return login
}
