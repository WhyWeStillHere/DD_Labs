import {
    HIDE_SIGN_IN_FORM_ACTION,
    HIDE_SIGN_UP_FORM_ACTION,
    SHOW_SIGN_IN_FORM_ACTION,
    SHOW_SIGN_UP_FORM_ACTION,
} from './types'

const initialView = {
    showSignInForm: false,
    showSignUpForm: false,
}

export const ViewReducer = (view = initialView, action) => {
    if (action.type === SHOW_SIGN_IN_FORM_ACTION) {
        return { ...view, showSignInForm: true }
    }
    if (action.type === SHOW_SIGN_UP_FORM_ACTION) {
        return { ...view, showSignUpForm: true }
    }
    if (action.type === HIDE_SIGN_IN_FORM_ACTION) {
        return { ...view, showSignInForm: false }
    }
    if (action.type === HIDE_SIGN_UP_FORM_ACTION) {
        return { ...view, showSignUpForm: false }
    }
    return view
}
