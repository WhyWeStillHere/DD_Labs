export const ADMIN_ACCESS = "ADMIN_ACCESS"
export const MODERATOR_ACCESS = "MODERATOR_ACCESS"
export const NO_ACCESS = "NO_ACCESS"

const SITE_MODERATOR_CODE = 2 // ???
const SITE_ADMIN_CODE = 3 // ???

export const getAccessRights = ({user}) => {
    if (user['userObjectFromDB']['OfficialRole'] === SITE_MODERATOR_CODE) {
        return MODERATOR_ACCESS
    }
    if (user['userObjectFromDB']['OfficialRole'] === SITE_ADMIN_CODE) {
        return ADMIN_ACCESS
    }
    return NO_ACCESS
}