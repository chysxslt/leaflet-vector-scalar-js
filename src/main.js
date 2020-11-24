import Vue from 'vue'
import App from './App.vue'
// 引入elementui
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 引入iview
import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
// 引入主题
import router from './router'
import store from './store'
import http from './http'
// import * as L from 'leaflet'
import global from './config/index'
// import 'leaflet/dist/leaflet.css';
import './assets/common.css';
import './registerServiceWorker'
// 引入echarts
import echarts from 'echarts'
// 引入vue-echarts
import ECharts from 'vue-echarts'
import 'echarts/lib/component/tooltip'
// 引入zTree
import "./plugins/zTree/js/jquery-1.4.4.min.js";
import "./plugins/zTree/js/jquery.ztree.core.min.js";
import "./plugins/zTree/js/jquery.ztree.excheck.min.js";
import "./plugins/zTree/js/jquery.ztree.exhide.min.js";
// 引入leaflet.draw
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
// el-dialog 拖拽
import './utils/dialogDrag'
import vant from './plugins/vant'


Vue.component('v-chart', ECharts)

Vue.use(ElementUI);
Vue.use(ViewUI);
Vue.use(vant);

Vue.config.productionTip = false;
Vue.prototype.Global = global;
// Vue.L = Vue.prototype.$L = L; // 全局注册leaflet
Vue.prototype.$http = http; // 全局注册$http --> this.$http
Vue.prototype.$echarts = echarts; // 全局注册echarts


/*leaflet draw  tooltips*/
L.drawLocal = {
  draw: {
    toolbar: {actions: { title: '取消绘制', text: '取消' }, finish: { title: '完成绘制', text: '完成' }, undo: { title: '删除最后绘制的点', text: '删除最后一点' }, buttons: { polyline: '画线', polygon: '画多边形', rectangle: '画矩形', circle: '画圆', marker: '画标记', circlemarker: '画圆形标记' } },
    handlers: {circle: {tooltip: {start: '单击并拖动可绘制圆'}, radius: '半径'}, circlemarker: {tooltip: {start: '点击地图放置圆形标记'}}, marker: {tooltip: {start: '点击地图放置标记'}}, polygon: {tooltip: {start: '单击开始绘制多边形', cont: '单击以继续绘制多边形', end: '双击可完成多形形绘制'}}, polyline: {error: '<strong>异常:</strong> 形状边缘不能交叉!', tooltip: {start: '点击开始画线', cont: '单击以继续绘制线条', end: '双击完成线条绘制'}}, rectangle: {tooltip: {start: '单击并拖动以绘制矩形'}}, simpleshape: {tooltip: {end: '释放鼠标完成绘图'}}}
  },
  edit: {
    toolbar: {actions: {save: {title: '保存改动', text: '保存'}, cancel: {title: '取消编辑，丢弃所有更改', text: '取消'}, clearAll: {title: '清除所有标记', text: '清除所有'}}, buttons: {edit: '编辑图层', editDisabled: '不需要编辑图层', remove: '删除图层', removeDisabled: '没有要删除的图层'}},
    handlers: {edit: {tooltip: {text: '拖动节点或标记来编辑图形', subtext: '单击“取消”撤消更改'}}, remove: {tooltip: {text: '单击某个标记进行删除'}}}}
};




/* leaflet icon */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

console.log(process.env)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
