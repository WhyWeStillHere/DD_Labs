import { combineReducers } from 'redux'
import { LoginReducer } from './LoginReducer'
import { TournamentReducer } from './TournamentReducer'
import { StatusReducer } from './StatusReducer'
import { ViewReducer } from './ViewReducer'
import { ProfileReducer } from './ProfileReducer'

export const RootReducer = combineReducers({
    login: LoginReducer,
    tournament: TournamentReducer,
    status: StatusReducer,
    view: ViewReducer,
    profile: ProfileReducer,
})
