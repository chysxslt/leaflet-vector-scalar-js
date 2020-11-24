
// home state


const TOGGLE_LEFT_SHOW = 'TOGGLE_LEFT_SHOW';
const TOGGLE_RIGHT_SHOW = 'TOGGLE_RIGHT_SHOW';




export default {
  namespaced:true,
  state: {
    leftShow: true, // 边框左
    rightShow: false // 边框右
  },
  mutations: {
    TOGGLE_LEFT_SHOW(state, payload) {
      state.leftShow = !state.leftShow
     // console.log(state)
    },
    TOGGLE_RIGHT_SHOW(state, payload) {
      state.rightShow = !state.rightShow
     // console.log(state)
    },
    'TOGGLE_RIGHT_SHOW_FALSE'(state, payload) {
      state.rightShow = false
    }
  },
  actions: {
  },
  modules: {
  }
}
