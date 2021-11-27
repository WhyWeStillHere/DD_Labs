import {
    ADD_ERROR_ACTION,
    ADD_RUNNING_ACTION,
    GET_PARTICIPANTS_ACTION,
    GET_PROFILE_ACTION,
    GET_RFG_INFO_ACTION,
    GET_ROLES_ACTION,
    GET_SORTITION_ACTION,
    GET_TOKEN_ACTION,
    GET_TOURNAMENT_OBJECT_FROM_DB_ACTION,
    GET_TOURNAMENT_RESULT_ACTION,
    GET_TOURNAMENTS_LIST_ACTION,
    GET_USER_ACTION,
    LOGOUT_ACTION,
    REMOVE_ERROR_ACTION,
    REMOVE_RUNNING_ACTION,
    SIGN_IN_ACTION,
    UPDATE_STATUS_ACTION,
} from './types'
import axios from 'axios'
import {
    createAddPlayerURL,
    createCloseRegistrationURL,
    createConfirmParticipantURL,
    createCreateTournamentURL,
    createEndTournamentURL,
    createGetParticipantsURL,
    createGetSortitionURL,
    createGetTokenURL,
    createGetTournamentObjectFromDBURL,
    createGetUserURL,
    createRefreshTokenURL,
    createSetGameResultURL,
    createStartNextRoundURL,
    createStartTournamentURL,
    createUpdateUserURL,
    createVerifyTokenURL,
    createGetTournamentResultURL,
    SIGN_IN_URL,
    SIGN_UP_URL,
    createGetTournamentsListURL,
    createGetUserIdURL,
    createSetRoleURL,
    createGetRolesURL,
    createAddJudgeURL,
    createDeleteJudgeURL,
    createUpdateTournamentURL,
    createGenerateTossURL,
    createGetRfgInfoURL,
    createDownloadTossURL,
    createRemovePlayerURL,
    createSetRatingURL,
    createUpdateRfgInfoURL,
} from '../sources/Sources'
import { loadState, saveState, updateState } from '../local_storage/load_save'
import { store } from '../index'

async function addTokenHeader(dispatch, url, axiosConfig) {
    const accessToken = await dispatch(createGetAccessToken())

    return axios(url, {
        ...axiosConfig,
        headers: { Authorization: 'Bearer ' + accessToken },
    })
}

function addRunning(dispatch) {
    const runnings = store.getState().status.runnings
    const id = runnings.length
    dispatch({ type: ADD_RUNNING_ACTION, payload: { id: id } })
    return id
}

function removeRunning(dispatch, runningId) {
    dispatch({ type: REMOVE_RUNNING_ACTION, payload: { id: runningId } })
}

export function removeError(dispatch, errorId) {
    dispatch({ type: REMOVE_ERROR_ACTION, payload: { id: errorId } })
}

export function addError(dispatch, message) {
    const errors = store.getState().status.errors
    const id = errors.length
    dispatch({ type: ADD_ERROR_ACTION, payload: { id: id, message: message } })
    setTimeout(() => {
        removeError(dispatch, id)
    }, 3000)
}

function wrapper(func, message, defaultResult = null) {
    return async (dispatch) => {
        let result = defaultResult

        const runningId = addRunning(dispatch)

        try {
            result = await func(dispatch)
        } catch (e) {
            addError(dispatch, message)
        }

        removeRunning(dispatch, runningId)
        return result
    }
}

function createGetAccessToken() {
    return async (dispatch) => {
        const authorized = store.getState().login.authorized
        if (!authorized) {
            dispatch(createLogout())
            return null
        }

        let accessToken = store.getState().login.accessToken
        let verified = await dispatch(createVerifyToken({ token: accessToken }))
        if (!verified) {
            accessToken = await dispatch(createRefreshToken())
        }

        return accessToken
    }
}

function createGetToken({ username, password }) {
    return wrapper(async (dispatch) => {
        let tokens = (
            await axios.post(createGetTokenURL(), {
                username: username,
                password: password,
            })
        )['data']
        dispatch({
            type: GET_TOKEN_ACTION,
            payload: {
                refreshToken: tokens['refresh'],
                accessToken: tokens['access'],
            },
        })
        updateState('login', {
            refreshToken: tokens['refresh'],
            accessToken: tokens['access'],
        })
    }, 'Не удалось получить токены для авторизации!')
}

function createRefreshToken() {
    return wrapper(
        async (dispatch) => {
            const refreshToken = store.getState().login.refreshToken
            let verified = await dispatch(
                createVerifyToken({ token: refreshToken })
            )
            if (!verified) {
                dispatch(createLogout())
                addError('Сессия устарела, необходима авторизация!')
            } else {
                let accessToken = (
                    await axios.post(createRefreshTokenURL(), {
                        refresh: refreshToken,
                    })
                )['data']['access']
                dispatch({
                    type: GET_TOKEN_ACTION,
                    payload: {
                        refreshToken: refreshToken,
                        accessToken: accessToken,
                    },
                })
                updateState('login', { accessToken: accessToken })
                return accessToken
            }
        },
        'Что-то пошло не так, попробуйте снова авторизоваться на сайте!',
        ''
    )
}

function createVerifyToken({ token }) {
    return wrapper(
        async (dispatch) => {
            if (typeof token !== 'string') {
                return false
            }
            await axios.post(createVerifyTokenURL(), { token: token })
            return true
        },
        null,
        false
    )
}

export function createGetUser({ userId }) {
    return wrapper(async (dispatch) => {
        let userObjectFromDB = (
            await addTokenHeader(dispatch, createGetUserURL(userId), {
                method: 'get',
            })
        )['data']
        dispatch({ type: GET_USER_ACTION, payload: { userObjectFromDB } })
        const oldUserObjectFromDB = loadState('login')['userObjectFromDB'] || {}
        updateState('login', {
            userObjectFromDB: {
                ...oldUserObjectFromDB,
                Username: userObjectFromDB['Username'],
            },
        })
    }, 'Не удалось получить информацию о пользователе!')
}

export function createUpdateUser({ userId, data }) {
    return wrapper(
        async (dispatch) => {
            await addTokenHeader(dispatch, createUpdateUserURL(userId), {
                method: 'post',
                data: data,
            })
            dispatch(createGetUser({ userId }))
        },
        'Не удалось обновить информацию!',
        Error()
    )
}

export function createSignIn({ username, password }) {
    return wrapper(async (dispatch) => {
        let result = await axios.post(SIGN_IN_URL, {
            username: username,
            password: password,
        })

        let id = result['data']['Id']

        await dispatch(
            createGetToken({ username: username, password: password })
        )

        dispatch({
            type: SIGN_IN_ACTION,
            payload: {
                authorized: true,
                id: id,
            },
        })

        await dispatch(createGetUser({ userId: id }))

        updateState('login', { authorized: true, id: id })
    }, 'Не удалось войти!')
}

export function createSignUp({ username, password }) {
    return wrapper(async (dispatch) => {
        await axios.post(SIGN_UP_URL, {
            username: username,
            password: password,
        })
        dispatch(createSignIn({ username: username, password: password }))
    }, 'Не удалось зарегистрироваться!')
}

export function createLogout() {
    return wrapper(async (dispatch) => {
        //todo: сделать на сервере метод для logout'а
        dispatch({ type: LOGOUT_ACTION })
        saveState('login', {
            authorized: false,
            accessToken: '',
            refreshToken: '',
        })
    }, 'Не удалось выйти!')
}

export function createParticipate({ tournamentId }) {
    return wrapper(async (dispatch) => {
        await addTokenHeader(dispatch, createAddPlayerURL(tournamentId), {
            method: 'post',
        })
        dispatch(createGetParticipants({ tournamentId: tournamentId }))
    }, 'Не удалось принять участие!')
}

export function createRemoveParticipate({ tournamentId }) {
    return wrapper(async (dispatch) => {
        await addTokenHeader(dispatch, createRemovePlayerURL(tournamentId), {
            method: 'post',
        })
        dispatch(createGetParticipants({ tournamentId: tournamentId }))
    }, 'Не удалось принять участие!')
}

export function createGetParticipants({ tournamentId }) {
    return wrapper(async (dispatch) => {
        let participants = await axios.get(
            createGetParticipantsURL(tournamentId)
        )
        dispatch({
            type: GET_PARTICIPANTS_ACTION,
            payload: {
                tournamentId: tournamentId,
                participants: participants['data'],
            },
        })
    }, 'Не удалось получить сведения об участниках!')
}

export function createConfirmParticipant({
    isConfirmed,
    tournamentPlayerIds,
    tournamentId,
}) {
    return wrapper(async (dispatch) => {
        const promises = tournamentPlayerIds.map(
            async (tournamentPlayerId) =>
                await addTokenHeader(
                    dispatch,
                    createConfirmParticipantURL(tournamentId),
                    {
                        method: 'post',
                        data: {
                            TournamentPlayerId: tournamentPlayerId,
                            is_confirmed: isConfirmed,
                        },
                    }
                )
        )
        await Promise.all(promises)
        dispatch(createGetParticipants({ tournamentId }))
    }, 'Не удалось подтвердить участника(ов)!')
}

export function createCreateTournament({ data }) {
    return wrapper(async (dispatch) => {
        return (
            await addTokenHeader(dispatch, createCreateTournamentURL(), {
                method: 'post',
                data: data,
            })
        )['data']['Id']
    }, 'Не удалось создать турнир!')
}

export function createUpdateTournament({ tournamentId, data }) {
    return wrapper(async (dispatch) => {
        await addTokenHeader(
            dispatch,
            createUpdateTournamentURL(tournamentId),
            {
                method: 'post',
                data: data,
            }
        )
    }, 'Не удалось обновить информацию о турнире!')
}

export function createGetTournamentObjectFromDB({ tournamentId }) {
    return wrapper(async (dispatch) => {
        const tournamentObjectFromDB = await axios.get(
            createGetTournamentObjectFromDBURL(tournamentId)
        )
        dispatch({
            type: GET_TOURNAMENT_OBJECT_FROM_DB_ACTION,
            payload: {
                tournamentId: tournamentId,
                tournamentObjectFromDB: tournamentObjectFromDB['data'],
            },
        })
    }, 'Не удалось загрузить информацию о турнире!')
}

export function createCloseRegistration({ tournamentId, isClosed }) {
    return wrapper(async (dispatch) => {
        await addTokenHeader(
            dispatch,
            createCloseRegistrationURL(tournamentId),
            {
                method: 'post',
                data: { is_closed: isClosed },
            }
        )
        dispatch(
            createGetTournamentObjectFromDB({ tournamentId: tournamentId })
        )
    }, 'Не удалось закрыть регистрацию!')
}

export function createStartTournament({ tournamentId }) {
    return wrapper(async (dispatch) => {
        await addTokenHeader(dispatch, createStartTournamentURL(tournamentId), {
            method: 'post',
        })
        dispatch(createStartNextRound({ tournamentId }))
    }, 'Не удалось начать турнир!')
}

export function createEndTournament({ tournamentId }) {
    return wrapper(async (dispatch) => {
        await addTokenHeader(dispatch, createEndTournamentURL(tournamentId), {
            method: 'post',
        })
        dispatch(
            createGetTournamentObjectFromDB({ tournamentId: tournamentId })
        )
    }, 'Не удалось завершить турнир!')
}

export function createSetGameResult({
    tournamentId,
    sortitionId,
    gameId,
    resultType,
}) {
    return wrapper(async (dispatch) => {
        await addTokenHeader(dispatch, createSetGameResultURL(tournamentId), {
            method: 'post',
            data: { GameId: gameId, ResultType: resultType },
        })
        dispatch(createGetSortition({ tournamentId, sortitionId }))
    }, 'Не удалось обновить результат партии!')
}

export function createGetSortition({ tournamentId, sortitionId }) {
    return wrapper(async (dispatch) => {
        let sortition = await addTokenHeader(
            dispatch,
            createGetSortitionURL(tournamentId, sortitionId + 1),
            { method: 'get' }
        )
        dispatch({
            type: GET_SORTITION_ACTION,
            payload: { sortitionId: sortitionId, sortition: sortition['data'] },
        })
    }, 'Не удалось получить жеребьёвку! Показаны старые результаты!')
}

export function createStartNextRound({ tournamentId }) {
    return wrapper(async (dispatch) => {
        await addTokenHeader(dispatch, createStartNextRoundURL(tournamentId), {
            method: 'post',
        })
        dispatch(createGetTournamentObjectFromDB({ tournamentId }))
    }, 'Не удалось стартовать новый раунд!')
}

export function createGetTournamentResult({ tournamentId }) {
    return wrapper(async (dispatch) => {
        let result = await addTokenHeader(
            dispatch,
            createGetTournamentResultURL(tournamentId),
            { method: 'get' }
        )
        dispatch({
            type: GET_TOURNAMENT_RESULT_ACTION,
            payload: { result: result['data']['data'] },
        })
    }, 'Не удалось получить результат турнира!')
}

export function createGetTournamentsList() {
    return wrapper(async (dispatch) => {
        let result = (
            await addTokenHeader(dispatch, createGetTournamentsListURL(), {
                method: 'get',
            })
        )['data']
        dispatch({
            type: GET_TOURNAMENTS_LIST_ACTION,
            payload: { tournamentsList: result },
        })
    }, 'Не удалось загрузить список турниров!')
}

export function createGetUserId({ username }) {
    return wrapper(
        async (dispatch) => {
            const userId = (
                await addTokenHeader(dispatch, createGetUserIdURL(), {
                    method: 'post',
                    data: { username: username },
                })
            )['data']['id']
            return userId
        },
        'Не удалось получить id пользователя!',
        null
    )
}

export function createGetProfile({ userId }) {
    return wrapper(async (dispatch) => {
        let userObjectFromDB = (
            await addTokenHeader(dispatch, createGetUserURL(userId), {
                method: 'get',
            })
        )['data']
        dispatch({
            type: GET_PROFILE_ACTION,
            payload: { userObjectFromDB, id: userId },
        })
    }, 'Не удалось получить информацию о пользователе!')
}

export function createSetRole({ userId, role }) {
    return wrapper(async (dispatch) => {
        await addTokenHeader(dispatch, createSetRoleURL(userId), {
            method: 'post',
            data: { Id: userId, Role: role },
        })
        dispatch(createGetProfile({ userId }))
    }, 'Не удалось обновить статус пользователя! Возможно, у пользователя отсутствуют имя, фамилия или город')
}

export function createGetRoles({ tournamentId }) {
    return wrapper(async (dispatch) => {
        let roles = await addTokenHeader(
            dispatch,
            createGetRolesURL(tournamentId),
            { method: 'get' }
        )
        dispatch({
            type: GET_ROLES_ACTION,
            payload: { roles: roles['data']['Data'] },
        })
    }, 'Не удалось получить список ролей!')
}

export function createAddJudge({ tournamentId, JudgeName }) {
    return wrapper(async (dispatch) => {
        await addTokenHeader(dispatch, createAddJudgeURL(tournamentId), {
            method: 'post',
            data: { Judge: JudgeName },
        })
        dispatch(createGetRoles({ tournamentId }))
    }, 'Не удалось добавить судью в турнир!')
}

export function createDeleteJudge({ tournamentId, JudgeName }) {
    return wrapper(async (dispatch) => {
        await addTokenHeader(dispatch, createDeleteJudgeURL(tournamentId), {
            method: 'post',
            data: { Judge: JudgeName },
        })
        dispatch(createGetRoles({ tournamentId }))
    }, 'Не удалось убрать судью из турнира!')
}

export function createGenerateToss({ tournamentId, pairs }) {
    console.log(pairs)
    return wrapper(async (dispatch) => {
        await addTokenHeader(dispatch, createGenerateTossURL(tournamentId), {
            method: 'post',
            data: pairs,
        })
        dispatch(createGetTournamentObjectFromDB({ tournamentId }))
    }, 'Не удалось сгенерировать жеребьевку!')
}

export function createGetRfgInfo({ fullName, userId }) {
    return wrapper(async (dispatch) => {
        let rfgInfo = (
            await addTokenHeader(dispatch, createGetRfgInfoURL(), {
                method: 'post',
                data: { FullName: fullName },
            })
        )['data']
        dispatch({
            type: GET_RFG_INFO_ACTION,
            payload: { rfgInfo },
        })
        await addTokenHeader(dispatch, createUpdateRfgInfoURL(), {
            method: 'post',
            data: { Rating: rfgInfo.Rating, UserId: userId },
        })
    }, 'Не удалось получить информацию о рейтинге!')
}

export function createSetRating({ tournamentId, playerId, rating }) {
    return wrapper(async (dispatch) => {
        let updated = await addTokenHeader(
            dispatch,
            createSetRatingURL(tournamentId),
            {
                method: 'post',
                data: { Rating: rating, PlayerId: playerId },
            }
        )
        dispatch(createGetParticipants({ tournamentId }))
        return updated
    }, 'Не удалось обновить рейтинг!')
}
