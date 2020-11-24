import Store from 'store2';

/**
 *  常量配置项
 */

// 天地图 底图
const TDT = [
  ['vec_w','vec','w'],
  ['cva_w','cva','w'],
  ['img_w','img','w'],
  ['cia_w','cia','w'],
  ['cta_w','cta','w'],
  ['ibo_w','ibo','w'],
  ['eia_w','eia','w'],
  ['eva_w','eva','w'],
  ['cva_w','cva','w'],
]
// 天地图 底图 随机数
// const Num = Math.floor(Math.random() * 8)
const Num = 2;

export default {
  /**
   *
   * 项目 请求及跳转时 所用地址 开始
   * 开发环境对应文件 .env.development
   * 测试环境对应文件 .env.test
   * 生产环境对应文件 .env.production
   * ==== 测试环境及生产环境文件在开发过程中 请勿改动 !!!   ===
   */

  // server url
  serverUrl:process.env.VUE_APP_SERVER_URL,
  // url
  baseURL: process.env.VUE_APP_BASE_URL ,
  // Ops Service类接口地址
  authURL: process.env.VUE_APP_AUTH_URL ,

  /**
   * 项目 请求及跳转时 所用地址 结束
   */

  // 请求的失效时间
  httpTimeout: 60000,
  // 用户信息
  setUserInfo: function(userInfo) {
    Store.session('userInfo', userInfo)
  },
  getUserInfo: function() {
    return Store.session('userInfo')
    // return {username: 'admin'}
  },
  getLn: function() {
    return this.getCookie('ln')
  },
  getCookie: function(cookieName) {
    if (document.cookie.length > 0) {
      let start = document.cookie.indexOf(cookieName + '=')
      if (start !== -1) {
        start = start + cookieName.length + 1
        let end = document.cookie.indexOf(';', start)
        if (end === -1) end = document.cookie.length
        return document.cookie.substring(start, end)
      }
    }
    return null
  },

  // ==== leaflet map=====
  map:{

      // 地图底图
    mapSource:{
      A:"http://{s}.tile.osm.org/{z}/{x}/{y}.png",
      B:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      C:'http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      blue:'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
      almap:"http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}", // 高德底图
      esri:'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', // 高德底图
      TianDiTu:`http://t0.tianditu.gov.cn/${TDT[Num][0]}/wmts?layer=${TDT[Num][1]}&style=default&tilematrixset=${TDT[Num][2]}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk=099824dfa2a57512929e6b9d3c6b0eaa`,
    },
    zoom:5, //默认缩放
    minZoom: 4, //最小绽放层级
    maxZoom: 20,//最大绽放层级z
    center:[ 30.56226095049944, 108.14941406250001],  // 默认地图中心
    heatmapConfg:{ // 热力图配置
      'radius': 0.4,
      'maxOpacity': 0.75,
      "minOpacity":0,
      'scaleRadius': true,
      'useLocalExtrema': false,
      'blur':1,
      latField: 'a',
      lngField: 'o',
      valueField: 'v',
      gradient: {
        "0": "rgba(90,86,143,1)",
        "0.1": "rgba(72,104,181,1)",
        "0.2": "rgba(69,151,168,1)",
        "0.3": "rgba(81,180,98,1)",
        "0.4": "rgba(106,192,82,1)", // 颜色过渡
        "0.5": "rgba(177,209,67,1)", // 颜色过渡
        "0.6": "rgba(215,206,60,1)", // 颜色过渡
        "0.7": "rgba(214,172,64,1)", // 颜色过渡
        "0.8": "rgba(213,137,72,1)", // 颜色过渡
        "0.85": "rgba(205,94,93,1)", // 颜色过渡
        "0.9": "rgba(144,28,79,1)", // 颜色过渡
        "0.99": "rgba(43,0,1,1)" // 颜色过渡
      }
    },
    customIcon:{
      iconSize:[20,20],
      iconAnchor:[10,10]
    }
  },
  typhoon: {
    legendList: [{color: '#00fedf', name: '热带低压(TD)', type: 'fill'}, {color: '#fff45c', name: '热带风暴(TS)', type: 'fill'}, {color: '#fe902c', name: '强热带风暴(STS)', type: 'fill'}, {color: '#fe0404', name: '台风(TY)', type: 'fill'}, {color: '#fe3aa3', name: '强台风(STY)', type: 'fill'}, {color: '#ae00d9', name: '超强台风(Super TY)', type: 'fill'}, {color: '174, 0, 217', name: '12级风圈', type: 'noFill'}, {color: '254, 144, 44', name: '10级风圈', type: 'noFill'}, {color: '255, 244, 92', name: '7级风圈', type: 'noFill'}]
  }
}
