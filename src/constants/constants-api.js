import {HttpMethod} from "@/constants/constants";

const LOGIN_API_DOMAIN = process.env.VUE_APP_LOGIN_API
const API_DOMAIN = process.env.VUE_APP_MANAGEMENT_API
const API_REALTIME = process.env.VUE_APP_COMMENT_CHAT

export const API = Object.freeze({
    LOGIN: {
        url: `${LOGIN_API_DOMAIN}/api/login`,
        method: HttpMethod.POST
    },
    HOME: {
        GET_DATA_FOR_LECTURER: {
            url: `${API_DOMAIN}/api/v1/class/home/lecturer`,
            method: HttpMethod.GET
        },
        GET_DATA_FOR_STUDENT: {
            url: `${API_DOMAIN}/api/v1/class/home/student`,
            method: HttpMethod.GET
        },
    },
    COURSE_DETAIL: {
        GET_COURSE_DETAIL: {
            url: `${API_DOMAIN}/api/v1/course/course-detail`,
            method: HttpMethod.GET
        },
        GET_SESSION_DETAIL: {
            url: `${API_DOMAIN}/api/v1/course/course-detail/session-detail`,
            method: HttpMethod.GET
        },
    }
})

export const API_MANAGEMENT = Object.freeze({
    CLASS_MANAGEMENT: {
        LIST: {
            url: `${API_DOMAIN}/api/v1/class/list`,
                method: HttpMethod.GET
        },
        GET_CLASS_INFO: {
            url: `${API_DOMAIN}/api/v1/class/class-info`,
                method: HttpMethod.GET
        },
        GET_LIST_CLASS: {
            url: `${API_DOMAIN}/api/v1/class/listClass`,
                method: HttpMethod.GET
        },
        SEARCH: {
            url: `${API_DOMAIN}/api/v1/class/search`,
                method: HttpMethod.GET
        },
        CREATE: {
            url: `${API_DOMAIN}/api/v1/class/create`,
                method: HttpMethod.POST
        },
        ADD_STUDENT: {
            url: `${API_DOMAIN}/api/v1/class/addStudentToClass`,
                method: HttpMethod.POST
        },
        UPDATE: {
            url: `${API_DOMAIN}/api/v1/class/update`,
                method: HttpMethod.PUT
        },
        DELETE: {
            url: `${API_DOMAIN}/api/v1/class/delete`,
                method: HttpMethod.DELETE
        },
        DELETE_STUDENT: {
            url: `${API_DOMAIN}/api/v1/class/delete-student`,
                method: HttpMethod.DELETE
        },
        PERMISSION_COURSE_DETAIL: {
            url: `${API_DOMAIN}/api/v1/class/permission-course-detail`,
            method: HttpMethod.GET
        },
        PERMISSION_SESSION_DETAIL: {
            url: `${API_DOMAIN}/api/v1/class/permission-session-detail`,
            method: HttpMethod.GET
        },
        PERMISSION_SESSION_ACTIVE: {
            url: `${API_DOMAIN}/api/v1/class/permission-session-active`,
            method: HttpMethod.GET
        }
    },
    STUDENT: {
        EXPORT_STUDENTS: {
            url: `${API_DOMAIN}/api/v1/student/exportExcelStudent`,
                method: HttpMethod.GET
        },
        LIST_STUDENTS: {
            url: `${API_DOMAIN}/api/v1/student/listStudent`,
                method: HttpMethod.GET
        },
        UPDATE_STUDENT: {
            url: `${API_DOMAIN}/api/v1/student/update-student`,
                method: HttpMethod.POST
        },
        ACTIVE: {
            url: `${API_DOMAIN}/api/v1/student/active-student`,
                method: HttpMethod.PUT
        },
    },
    COURSE_MANAGEMENT: {
        LIST: {
            url: `${API_DOMAIN}/api/v1/course/list`,
                method: HttpMethod.GET
        },
        GET_BY_ID: {
            url: `${API_DOMAIN}/api/v1/course/`,
                method: HttpMethod.GET
        },
        SEARCH: {
            url: `${API_DOMAIN}/api/v1/course/search`,
                method: HttpMethod.GET
        },
        GET_SESSIONS_BY_COURSE: {
            url: `${API_DOMAIN}/api/v1/course/sessionByCourseid`,
                method: HttpMethod.GET
        },
        CREATE: {
            url: `${API_DOMAIN}/api/v1/course/create`,
                method: HttpMethod.POST
        },
        UPDATE: {
            url: `${API_DOMAIN}/api/v1/course/update`,
                method: HttpMethod.PUT
        },
        DELETE: {
            url: `${API_DOMAIN}/api/v1/course/delete`,
                method: HttpMethod.DELETE
        },
        GET_COURSEIDS: {
            url: `${API_DOMAIN}/api/v1/course/courseIds`,
            method: HttpMethod.GET
        }
    },
    SESSION_MANAGEMENT: {
        INSERT_LIST_SESSION: {
            url: `${API_DOMAIN}/api/v1/session/insertListSession`,
                method: HttpMethod.POST
        },
        UPDATE: {
            url: `${API_DOMAIN}/api/v1/session/update`,
                method: HttpMethod.PUT
        }
    },
    CQ_MANAGEMENT: {
        LIST: {
            url: `${API_DOMAIN}/api/v1/cq/list`,
                method: HttpMethod.GET
        },
        LIST_BY_COURSE: {
            url: `${API_DOMAIN}/api/v1/cq/listCqByCourse`,
                method: HttpMethod.GET
        },
        INSERT_LIST_CQ: {
            url: `${API_DOMAIN}/api/v1/cq/importCq`,
                method: HttpMethod.POST
        },
        GET_CQ_BY_ID: {
            url: `${API_DOMAIN}/api/v1/cq/getCqById`,
                method: HttpMethod.GET
        },
        EXPORT_TEMPLATE: {
            url: `${API_DOMAIN}/api/v1/cq/exportExcelCq`,
                method: HttpMethod.GET
        },
        UPDATE: {
            url: `${API_DOMAIN}/api/v1/cq/update`,
                method: HttpMethod.PUT
        },
        DELETE: {
            url: `${API_DOMAIN}/api/v1/cq/delete`,
                method: HttpMethod.DELETE
        },
    },
    PRIVATE_CQ_MANAGEMENT: {
        LIST: {
            url: `${API_DOMAIN}/api/v1/privatecq/list`,
                method: HttpMethod.GET
        },
        GET_BY_ID: {
            url: `${API_DOMAIN}/api/v1/privatecq/getPriavteCqById`,
                method: HttpMethod.GET
        },
        CREATE: {
            url: `${API_DOMAIN}/api/v1/privatecq/create`,
                method: HttpMethod.POST
        },
        UPDATE: {
            url: `${API_DOMAIN}/api/v1/privatecq/update`,
                method: HttpMethod.PUT
        },
        DELETE: {
            url: `${API_DOMAIN}/api/v1/privatecq/delete`,
                method: HttpMethod.DELETE
        }
    },
    USER_MANAGEMENT: {
        SEARCH: {
            url: `${LOGIN_API_DOMAIN}/api/user/findUser`,
            method: HttpMethod.GET
        },
        SEARCH_BY_USERID: {
            url: `${LOGIN_API_DOMAIN}/api/user/findManyUser`,
            method: HttpMethod.GET
        },
        CREATE_MONGODB: {
            url: `${LOGIN_API_DOMAIN}/api/user/findOneAndUpdateAccount`,
            method: HttpMethod.POST
        },
        UPDATE_USER: {
            url: `${LOGIN_API_DOMAIN}/api/user/findOneAndUpdateAccount`,
            method: HttpMethod.POST
        },
        CREATE_MYSQL: {
            url: `${API_DOMAIN}/api/v1/user/create`,
            method: HttpMethod.POST
        },
        UPDATE_MYSQL: {
            url: `${API_DOMAIN}/api/v1/user/update`,
            method: HttpMethod.PUT
        },
        CHANGE_PASSWORD: {
            url: `${LOGIN_API_DOMAIN}/api/user/changePassword`,
            method: HttpMethod.POST
        },
        RESET_PASSWORD: {
            url: `${LOGIN_API_DOMAIN}/api/user/requestResetPassword`,
            method: HttpMethod.POST
        },
        DELETE:{
            url: `${LOGIN_API_DOMAIN}/api/user/deleteAccount`,
            method: HttpMethod.POST
        }
    },
    SEND_MAIL: {
        SEND_MAIL: {
            url: `${API_DOMAIN}/api/v1/sendMail`,
            method: HttpMethod.POST
        },
    },
    GROUPS: {
        RANDOM: {
            url: `${API_DOMAIN}/api/v1/group/create`,
            method: HttpMethod.POST
        },
        IMPORT_GROUPS: {
            url: `${API_DOMAIN}/api/v1/group/importExcelGroup`,
            method: HttpMethod.POST
        },
        GET_GROUPS: {
            url: `${API_DOMAIN}/api/v1/group/listGroup`,
            method: HttpMethod.GET
        },
        WAITING_LIST: {
            url: `${API_DOMAIN}/api/v1/group/waitingList`,
            method: HttpMethod.GET
        },
        ADD_STUDENT_TO_GROUP: {
            url: `${API_DOMAIN}/api/v1/group/addStudentToGroup`,
            method: HttpMethod.POST
        },
        DELETE_STUDENT_GROUP: {
            url: `${API_DOMAIN}/api/v1/group/deleteStudentGroup`,
            method: HttpMethod.DELETE
        },
        UPDATE_STUDENT_GROUP: {
            url: `${API_DOMAIN}/api/v1/group/updateStudentGroup`,
            method: HttpMethod.PUT
        },
        CHECK_GROUPED: {
            url: `${API_DOMAIN}/api/v1/group/checkGroupExist`,
            method: HttpMethod.GET
        },
        GET_OLD_GROUPS: {
            url: `${API_DOMAIN}/api/v1/group/insertOldGroup`,
            method: HttpMethod.POST
        },
    },
})

export const REALTIME_API = Object.freeze({
    GET_STATUS: {
        url: `${API_REALTIME}/api/cq/getStatus`,
        method: HttpMethod.GET
    },
    CHANGE_STATUS: {
        url: `${API_REALTIME}/api/cq/changeStatus`,
        method: HttpMethod.POST
    },
    EXPORT_SUMMARY: {
        url: `${API_REALTIME}/api/cq/exportCqStatistical`,
        method: HttpMethod.GET
    }
})



