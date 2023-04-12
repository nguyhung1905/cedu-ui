import router from "./router/router";
import {getToken, removeToken} from "@/utils/cookie";
import jwt from "jsonwebtoken";
import store from "@/store";
import {USER_ROLE} from "@/constants/constants";
import axiosCallApi from "./config/axiosCallApi";
import {API_MANAGEMENT} from "./constants/constants-api";

router.beforeEach((to, from, next) => {
    const token = getToken()
    const VUE_APP_JWT_SECRET = process.env.VUE_APP_JWT_SECRET
    if (token) {
        const decoded = jwt.verify(token, VUE_APP_JWT_SECRET)
        const currentTime = Math.floor(new Date().getTime() / 1000.0)
        if (decoded === undefined || decoded.exp < currentTime) {
            removeToken()
            if (to.name === 'login') {
                next()
            } else {
                next({path: '/login'})
            }
        } else if (store.getters.role === USER_ROLE.ADMIN) {
            if (to.name === 'users-management' || to.name === 'user-profile') {
                next()
            } else {
                next({path: '/users-management'})
            }
        } else if (store.getters.role === USER_ROLE.TRAINING_MANAGER) {
            if (to.name === 'course-management' || to.name === 'class-management' || to.name === 'user-profile') {
                next()
            } else if (to.name === 'cq-management') {
                axiosCallApi.callApi(API_MANAGEMENT.COURSE_MANAGEMENT.GET_COURSEIDS, {},
                    {})
                    .then(res => {
                            if (res.data.includes(+to.query.courseId)) {
                                next()
                            } else {
                                next({path: '/'})
                            }
                        }
                    )
            } else {
                next({path: '/course-management'})
            }
        } else if (store.getters.role === USER_ROLE.LECTURER || store.getters.role === USER_ROLE.STUDENT) {
            if (to.name === 'login' || to.name === 'homepage' || to.name === 'users-management') {
                next({path: '/home'})
            } else if (to.name === 'course-detail') {
                axiosCallApi.callApi(API_MANAGEMENT.CLASS_MANAGEMENT.PERMISSION_COURSE_DETAIL, {},
                    {
                        userId: store.getters.userId,
                        roleId: store.getters.role,
                        courseId: +to.query.id,
                        classId: +to.query.classId ? +to.query.classId : ''
                    })
                    .then(res => {
                            if (res.data > 0) {
                                next()
                            } else {
                                next({path: '/'})
                            }
                        }
                    )
            } else if (to.name === 'session-detail') {
                axiosCallApi.callApi(API_MANAGEMENT.CLASS_MANAGEMENT.PERMISSION_SESSION_DETAIL, {},
                    {
                        userId: store.getters.userId,
                        roleId: store.getters.role,
                        sessionId: +to.query.sessionId,
                        classId: +to.query.classId
                    })
                    .then(res => {
                            if (res.data > 0) {
                                next()
                            } else {
                                next({path: '/'})
                            }
                        }
                    )
            } else if (to.name === 'session-active') {
                axiosCallApi.callApi(API_MANAGEMENT.CLASS_MANAGEMENT.PERMISSION_SESSION_ACTIVE, {},
                    {
                        userId: store.getters.userId,
                        roleId: store.getters.role,
                        cqId: +to.query.cqId,
                        classId: +to.query.classId
                    })
                    .then(res => {
                            if (res.data > 0) {
                                next()
                            } else {
                                next({path: '/'})
                            }
                        }
                    )
            } else if (store.getters.role === USER_ROLE.STUDENT) {
                if (to.name === 'course-management' || to.name === 'class-management') {
                    next({path: '/home'})
                } else next()
            } else if (to.name === 'cq-management' && store.getters.role === USER_ROLE.LECTURER) {
                axiosCallApi.callApi(API_MANAGEMENT.COURSE_MANAGEMENT.GET_COURSEIDS, {},
                    {lecturerId: store.getters.userId})
                    .then(res => {
                            if (res.data.includes(+to.query.courseId)) {
                                next()
                            } else {
                                next({path: '/'})
                            }
                        }
                    )
            } else next()
        }
    } else if (!token) {
        if (to.name === 'homepage' || to.name === 'login') {
            next()
        } else {
            next({path: '/'})
        }
    } else next();
})