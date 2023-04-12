export const HttpMethod = Object.freeze({
    GET: 'GET',
    PUT: 'PUT',
    DELETE: 'DELETE',
    POST: 'POST'
})

export const TOKEN = 'ACCESS_TOKEN'

export const USER_ROLE = Object.freeze({
    ADMIN: 1,
    TRAINING_MANAGER: 2,
    LECTURER: 3,
    STUDENT: 4
})

export const USER_STATUS = Object.freeze({
    UNVERIFIED: 'unverified',
    ACTIVE: 'active',
    INACTIVE: 'inactive'
})

export const MODAL_MODE = Object.freeze({
    NEW: 1,
    EDIT: 2,
    VIEW: 3
})

export const STATUS = Object.freeze({
    CREATED: 1,
    OPENING: 2,
    CLOSED: 3,
    CANCELED: 4,
    HIDDEN: 5,
})

export const QUESTION_STATUS =  [
    {
        id: 1,
        text: 'Not-start'
    },
    {
        id: 2,
        text: 'On-going'
    },
    {
        id: 3,
        text: 'Finished'
    },
    {
        id: 4,
        text: 'Canceled'
    },
    {
        id: 5,
        text: 'Hidden'
    }
]
export const CLASS_STATUS =  [
    {
        id: 1,
        text: 'Created'
    },
    {
        id: 2,
        text: 'Opening'
    },
    {
        id: 3,
        text: 'Closed'
    },
    {
        id: 4,
        text: 'Canceled'
    },
]

export const NOT_START = 1
export const ON_GOING = 2
export const FINISHED = 3