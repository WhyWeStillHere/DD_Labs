import {
    GET_PARTICIPANTS_ACTION,
    GET_SORTITION_ACTION,
    GET_TOURNAMENT_OBJECT_FROM_DB_ACTION,
    GET_TOURNAMENT_RESULT_ACTION,
    GET_TOURNAMENTS_LIST_ACTION,
    SET_EMPTY_TOURNAMENT_ACTION,
    GET_ROLES_ACTION,
} from './types'

export const TournamentTools = {
    types: {
        text: 'text',
        dropdown: 'dropdown',
        unknown: 'unknown',
        simpleDropdown: 'simpleDropdown',
    },
    mapKeyWithType: function (key) {
        switch (key) {
            case 'Name':
            case 'LocationName':
            case 'StartDate':
            case 'EndDate':
            case 'RoundNum':
                return this.types['text']
            case 'RulesInfo':
            case 'TimeControlInfo':
                return this.types['dropdown']
            case 'ParticipationType':
            case 'TournamentType':
            case 'TossType':
            case 'IsHeadStart':
            case 'IsRated':
                return this.types['simpleDropdown']
            default:
                return this.types['unknown']
        }
    },
    mapDropdownRealValueWithVisibleValue: function (key, realValue) {
        switch (key) {
            case 'ParticipationType':
                switch (realValue) {
                    case 0:
                        return 'Личный'
                    case 1:
                        return 'Командный'
                    default:
                        return ''
                }
            case 'TournamentType':
                switch (realValue) {
                    case 0:
                        return 'Спортивный'
                    case 1:
                        return 'Фестивальный'
                    default:
                        return ''
                }
            case 'TossType':
                switch (realValue) {
                    case 0:
                        return 'Мак-Магон'
                    case 1:
                        return 'Олимпийская система'
                    default:
                        return ''
                }
            case 'IsHeadStart':
                switch (realValue) {
                    case true:
                        return 'да'
                    case false:
                        return 'нет'
                    default:
                        return ''
                }
            case 'IsRated':
                switch (realValue) {
                    case true:
                        return 'да'
                    case false:
                        return 'нет'
                    default:
                        return ''
                }
        }
    },
}

const initialTournament = {
    participants: [],
    tournamentObjectFromDB: {
        CurrentRoundNum: null,
        State: null,
        Name: '',
        LocationName: '',
        StartDate: '',
        EndDate: '',
        TournamentType: '',
        ParticipationType: '',
        IsRated: '',
        TossType: '',
        RoundNum: null,
        TimeControlInfo: '',
        IsHeadStart: '',
    },
    sortitions: [],
    tournamentsList: [],
    // sortitions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => [{
    //     FirstPlayerId: 1,
    //     SecondPlayerId: 1,
    //     gameId: 1,
    //     ResultType: 0
    // }, {FirstPlayerId: 3, SecondPlayerId: 3, gameId: 3, ResultType: 1}, {
    //     FirstPlayerId: 2,
    //     SecondPlayerId: 2,
    //     gameId: 2,
    //     ResultType: 2
    // }])
    result: [],
    roles: [],
}

export const TournamentReducer = (tournament = initialTournament, action) => {
    if (action.type === GET_PARTICIPANTS_ACTION) {
        return { ...tournament, participants: action.payload['participants'] }
    }

    if (action.type === GET_TOURNAMENT_OBJECT_FROM_DB_ACTION) {
        return {
            ...tournament,
            tournamentObjectFromDB: {
                ...tournament['tournamentObjectFromDB'],
                ...action.payload['tournamentObjectFromDB'],
            },
        }
    }

    // todo: уместно ли хранить здесь список турниров?
    if (action.type === GET_TOURNAMENTS_LIST_ACTION) {
        return {
            ...tournament,
            ...action.payload,
        }
    }

    if (action.type === SET_EMPTY_TOURNAMENT_ACTION) {
        return initialTournament
    }

    if (action.type === GET_SORTITION_ACTION) {
        let newSortitions = tournament['sortitions']
        newSortitions[action.payload['sortitionId']] =
            action.payload['sortition']
        return { ...tournament, sortitions: newSortitions }
    }

    if (action.type === GET_TOURNAMENT_RESULT_ACTION) {
        return { ...tournament, result: action.payload['result'] }
    }

    if (action.type === GET_ROLES_ACTION) {
        return { ...tournament, roles: action.payload['roles'] }
    }

    return tournament
}
