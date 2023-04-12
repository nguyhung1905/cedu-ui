export default {
    setUserId({commit}, userId){
        commit('setUserId', userId)
    },
    setEmail({commit}, email){
        commit('setEmail', email)
    },
    setRole({commit}, role){
        commit('setRole', role)
    },
    setName({commit}, name){
        commit('setName', name)
    }
}