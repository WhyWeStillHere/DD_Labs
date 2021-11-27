import { GET_PROFILE_ACTION, GET_RFG_INFO_ACTION } from './types'
import { loadState } from '../local_storage/load_save'

const emptyProfile = {
    id: null,
    userObjectFromDB: {
        Username: '',
        FirstName: '',
        SecondName: '',
        MiddleName: '',
        Password: '',
        Email: '',
        City: '',
        BirthDate: '',
        Roles: [],
    },
    rfgInfo: {
        Rating: null,
        City: '',
    },
}

export const ProfileReducer = (profile = emptyProfile, action) => {
    if (action.type === GET_PROFILE_ACTION) {
        if (profile.id !== action.payload.id) {
            return {
                ...profile,
                ...action['payload'],
                rfgInfo: {
                    Rating: null,
                    City: '',
                },
            }
        }
        return {
            ...profile,
            ...action['payload'],
        }
    }

    if (action.type === GET_RFG_INFO_ACTION) {
        return {
            ...profile,
            ...action['payload'],
        }
    }

    return profile
}
