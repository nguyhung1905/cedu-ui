import Vue from "vue";
import Vuex from "vuex";
import state from "@/store/state";
import mutations from "@/store/mutations";
import actions from "@/store/actions";
import getters from "@/store/getters";
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

const store = new Vuex.Store({
    state,
    mutations,
    actions,
    getters,
    plugins: [
    createPersistedState({
      storage: window.localStorage
    }),
  ],
})

export default store;