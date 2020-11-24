import Vue from 'vue'
import Vuex from 'vuex'

import moduleMap from "./modules/moduleMap"
import moduleHome from "./modules/moduleHome"


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    moduleMap:moduleMap,
    moduleHome:moduleHome,
    // moduleToolbar:moduleToolbar,
  }
})
