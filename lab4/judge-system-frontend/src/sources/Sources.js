export const SERVER_URL = 'http://localhost:2222'
//export const SERVER_URL = 'https://vast-plateau-29473.herokuapp.com'
export const SIGN_IN_URL = SERVER_URL + '/users/sign_in/'
export const SIGN_UP_URL = SERVER_URL + '/users/sign_up/'

export const createAddPlayerURL = (tournamentId) => {
    return SERVER_URL.concat(
        `/tournaments/${tournamentId}`,
        '/add_participant/'
    )
}

export const createRemovePlayerURL = (tournamentId) => {
    return SERVER_URL.concat(
        `/tournaments/${tournamentId}`,
        '/remove_participant/'
    )
}

export const createGetParticipantsURL = (tournamentId) => {
    return SERVER_URL.concat(`/tournaments/${tournamentId}`, '/participants/')
}

export const createGetTournamentObjectFromDBURL = (tournamentId) => {
    return SERVER_URL.concat(`/tournaments/${tournamentId}/`)
}

export const createCloseRegistrationURL = (tournamentId) => {
    return SERVER_URL.concat(
        `/tournaments/${tournamentId}`,
        '/close_registration/'
    )
}

export const createStartTournamentURL = (tournamentId) => {
    return SERVER_URL.concat(`/tournaments/${tournamentId}`, '/start/')
}

export const createGetSortitionURL = (tournamentId, sortitionId) => {
    return SERVER_URL.concat(
        `/tournaments/${tournamentId}`,
        `/toss/${sortitionId}/`
    )
}

export const createSetGameResultURL = (tournamentId) => {
    return SERVER_URL.concat(
        `/tournaments/${tournamentId}`,
        '/set_game_result/'
    )
}

export const createStartNextRoundURL = (tournamentId) => {
    return SERVER_URL.concat(
        `/tournaments/${tournamentId}`,
        '/start_next_round/'
    )
}

export const createEndTournamentURL = (tournamentId) => {
    return SERVER_URL.concat(`/tournaments/${tournamentId}`, '/end/')
}

export const createConfirmParticipantURL = (tournamentId) => {
    return SERVER_URL.concat(
        `/tournaments/${tournamentId}`,
        '/confirm_participant/'
    )
}

export const createGetUserURL = (userId) => {
    return SERVER_URL.concat(`/users/${userId}/`)
}

export const createUpdateUserURL = (userId) => {
    return SERVER_URL.concat(`/users/${userId}/update/`)
}

export const createGetTokenURL = () => {
    return SERVER_URL.concat(`/users/token/`)
}

export const createRefreshTokenURL = () => {
    return SERVER_URL.concat(`/users/token/refresh/`)
}

export const createVerifyTokenURL = () => {
    return SERVER_URL.concat(`/users/token/verify/`)
}

export const createCreateTournamentURL = () => {
    return SERVER_URL.concat(`/tournaments/create/`)
}

export const createGetTournamentResultURL = (tournamentId) => {
    return SERVER_URL.concat(`/tournaments/${tournamentId}`, '/result/')
}

export const createGetTournamentsListURL = () => {
    return SERVER_URL.concat('/tournaments/list/')
}

export const createGetUserIdURL = () => {
    return SERVER_URL.concat('/users/get_id/')
}

export const createSetRoleURL = () => {
    return SERVER_URL.concat(`/users/set_role/`)
}

export const createUpdateTournamentURL = (tournamentId) => {
    return SERVER_URL.concat(`/tournaments/${tournamentId}/update/`)
}

export const createGetRolesURL = (tournamentId) => {
    return SERVER_URL.concat(`/tournaments/${tournamentId}`, '/roles/')
}

export const createAddJudgeURL = (tournamentId) => {
    return SERVER_URL.concat(`/tournaments/${tournamentId}`, '/add_judge/')
}

export const createDeleteJudgeURL = (tournamentId) => {
    return SERVER_URL.concat(`/tournaments/${tournamentId}`, '/delete_judge/')
}

export const createGenerateTossURL = (tournamentId) => {
    return SERVER_URL.concat(`/tournaments/${tournamentId}`, '/create_toss/')
}

export const createGetRfgInfoURL = () => {
    return SERVER_URL.concat('/users/rfg_info/')
}

export const createDownloadTossURL = (tournamentId, sortitionId) => {
    return SERVER_URL.concat(
        `/tournaments/${tournamentId}`,
        `/download_toss/${sortitionId}/`
    )
}

export const createSetRatingURL = (tournamentId) => {
    return SERVER_URL.concat(`/tournaments/${tournamentId}`, `/set_rating/`)
}

export const createUpdateRfgInfoURL = () => {
    return SERVER_URL.concat('/tournaments/update_rating_for_user/')
}
