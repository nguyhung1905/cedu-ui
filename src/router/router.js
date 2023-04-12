import Vue from "vue"
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routers = [
    {
        path:'/login',
        name:'login',
        component: () => import('@/pages/login')
    },
    {
        path:'/',
        name:'homepage',
        component: () => import('@/pages/welcome-page'),
    },
    {
        path:'/home',
        name:'home',
        component: () => import('@/pages/home')
    },
    {
        path:'/class-management',
        name:'class-management',
        component: () => import('@/pages/class-management')
    },
    {
        path:'/course-management',
        name:'course-management',
        component: () => import('@/pages/course-management')
    },
    {
        path:'/users-management',
        name:'users-management',
        component: () => import('@/pages/users-management')
    },
    {
        path:'/course-detail',
        name:'course-detail',
        component: () => import('@/pages/course-detail')
    },
    {
        path:'/session-detail',
        name:'session-detail',
        component: () => import('@/pages/session-detail')
    },
    {
        path:'/session-active',
        name:'session-active',
        component: () => import('@/pages/session-active')
    },
    {
        path:'/cq-management',
        name:'cq-management',
        component: () => import('@/pages/cq-management')
    },
    {
        path:'/user-profile',
        name:'user-profile',
        component: () => import('@/pages/user-profile')
    }
]

export const constantRoutes = [...routers]

const createRouter = () => new VueRouter({
    mode: 'history', // require service support
    allowHashBang: true,
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher // reset router
}

export default router