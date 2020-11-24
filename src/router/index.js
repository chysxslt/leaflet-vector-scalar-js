import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'


Vue.use(VueRouter);

// 路由表
const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        // component: () => import(/* webpackChunkName: "about" */ '../components/map/LeafletMap.vue')
    },
    {
        path: '/leaflet',
        name: 'LeafletMap',
        component: () => import(/* webpackChunkName: "about" */ '../components/map/LeafletMap.vue')
    },
    //  ==========不能在 path: '*'  此路由下添加路由表！！！ ==================
    {
        path: '*',
        name: '404',
        component: () => import(/* webpackChunkName: "404" */ '../views/404.vue')
    }
]

const router = new VueRouter({
    routes
})
// 重写 router push
const routerPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error=> error)
}


export default router
