export const ORGANISER_ACCESS = "ORGANISER_ACCESS"
export const JUDGE_ACCESS = "JUDGE_ACCESS"
export const NO_ACCESS = "NO_ACCESS"

//const TOURNAMENT_ORGANISER_CODE = 0
export const TOURNAMENT_JUDGE_CODE = 1
//const TOURNAMENT_CONFIRMED_PLAYER_CODE = 2
//const TOURNAMENT_NON_CONFIRMED_PLAYER_CODE = 3

export const getAccessRights = ({user, roles}) => {
    if (roles === undefined) {
        return NO_ACCESS
    }

    const matches = roles.filter((role) => {return role["UserId"] === user['id']})
    if (matches.length > 0) {
        const highestRight = Math.min.apply(Math, matches.map((role) => {return role['Status']}));
        if (highestRight < TOURNAMENT_JUDGE_CODE) {
            return ORGANISER_ACCESS
        } else if (highestRight === TOURNAMENT_JUDGE_CODE) {
            return JUDGE_ACCESS
        } else {
            return NO_ACCESS
        }
    } else {
        return NO_ACCESS
    }
}
