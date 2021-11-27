import {
    ADD_ERROR_ACTION,
    ADD_RUNNING_ACTION,
    REMOVE_ERROR_ACTION,
    REMOVE_RUNNING_ACTION,
} from './types'

const initialStatus = { runnings: [], errors: [] }

export const StatusReducer = (status = initialStatus, action) => {
    let newStatus = { ...status }

    if (action.type === ADD_ERROR_ACTION) {
        newStatus['errors'][action.payload['id']] = action.payload['message']
        return newStatus
    }

    if (action.type === REMOVE_ERROR_ACTION) {
        newStatus['errors'][action.payload['id']] = null
        return newStatus
    }

    if (action.type === ADD_RUNNING_ACTION) {
        newStatus['runnings'][action.payload['id']] = true
        return newStatus
    }

    if (action.type === REMOVE_RUNNING_ACTION) {
        newStatus['runnings'][action.payload['id']] = false
        return newStatus
    }

    return status
}
