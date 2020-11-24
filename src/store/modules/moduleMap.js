import http from  '@/http/index'
import {getPlatCordonInfo, getEarthSeaTempInfo,getPipeLineList,getPortList,getDeviceList,
  getCurrentInfo,getSaltInfo,getSeaTemperature,getAirTemperature,
  getWaveInfo,getWaterDeptInfo,getEarthWaveInfo,getEarthWindInfo,getEarthPressureInfo,getEarthCurrentInfo} from "../../http/mapLayer";
  import { getShipList } from '@/http/ship'
import {formatPipeLine , latlngChangeToDMS,checkResponseData,fakeTime} from '../../utils/util'

import demo from "../../mock/data"


import windIcon from "@/assets/map/风场.png";
import temperatureIcon from "@/assets/map/温度.png";
import waveIcon from "@/assets/map/海浪.png";
import seaTemperatureIcon from "@/assets/map/进水温度.png";
import oceanCurrentIcon from "@/assets/map/洋流.png";
import airPressureIcon from "@/assets/map/气压.png";
import salinityIcon from "@/assets/map/盐度.png";
import shipIcon from "@/assets/map/船舶.png";
import pipelineIcon from "@/assets/map/管线.png";
import portIcon from "@/assets/map/港口.png";
import libraryIcon from "@/assets/map/仓库.png";
import latlonIcon from "@/assets/map/经纬网格.png";
import waringLineIcon from "@/assets/map/警戒线.png";


// mutations type

const SET_MAP_TITLE_LAYER_INDEX = "SET_MAP_TITLE_LAYER_INDEX"; // 设置底图 index

const SET_LAYER_FLAG = "SET_LAYER_FLAG"; // 设置数据请求flag
const SET_BASE_LAYER_INDEX = "SET_BASE_LAYER_INDEX"; // 设置气象图层index
const SET_WIND_DATA = "SET_WIND_DATA"; // 设置风场数据
const SET_WAVE_DATA = "SET_WAVE_DATA"; // 设置海浪数据
const SET_CURRENT_DATA = "SET_CURRENT_DATA"; // 设置洋流数据
const SET_SALT_DATA = "SET_SALT_DATA"; // 设置洋流数据
const SET_AIR_PRESSURE_DATA = "SET_AIR_PRESSURE_DATA"; // 设置气压数据
const SET_SEA_TEMPERATURE_DATA = "SET_SEA_TEMPERATURE_DATA"; // 设置海温数据
const SET_AIR_TEMPERATURE_DATA = "SET_AIR_TEMPERATURE_DATA"; // 设气温数据
const LATLON_FLAG = "LATLON_FLAG"; // 经纬度开关
const PORT_FLAG = "PORT_FLAG"; // 港口开关
const DEVICE_FLAG = "DEVICE_FLAG"; // 经纬度开关
const SHIP_FLAG = "SHIP_FLAG"; // 船舶开关
const WARNINGLINE_FLAG = "WARNINGLINE_FLAG"; //警界线开关
const SET_LATLNG = "SET_LATLNG"; //警界线开关
const PIPE_LINE_FLAG = "PIPE_LINE_FLAG"; //管线开关
const SET_WATER_DEEP_DATA = 'SET_WATER_DEEP_DATA'; //当前水深

const SET_MAP_EVENTS_DATA = 'SET_MAP_EVENTS_DATA'; //地图事件数据

const TOGGLE_WARNINGLINE_SWITCH = 'TOGGLE_WARNINGLINE_SWITCH'; //切换警戒圈 内部颜色 显示
const TOGGLE_VECTOR_SWITCH = 'TOGGLE_VECTOR_SWITCH'; // 切换 矢量动画 是否 显示


export default {
  namespaced:true,
  state: {
    /*地图 state*/
    map:{
      titleLayers:[
        {url:'https://www.google.cn/maps/vt?lyrs=s@804&gl=cn&x={x}&y={y}&z={z}'}, // 谷歌卫星
        {url:'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'}, // 智图深蓝色
        {url:'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}'}, // 智图暖色
        {url:'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}'}, // 智图灰色
        {url:'http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'}, // 高德矢量
      ],
      titleLayerIndex:1, // 默认底图
      baseLayer : [ // 基础图层列表
        {layerType:'setWindData',layerIcon:windIcon,layerName:'风场',active:false},
        // {layerType:'setAirTemperatureData',layerIcon:temperatureIcon,layerName:'气温',active:false},
        {layerType:'setWaveData',layerIcon:waveIcon,layerName:'海浪',active:false},
        {layerType:'setSeaTemperatureData',layerIcon: seaTemperatureIcon,layerName:'海温',active:false},
        {layerType:'setCurrentData',layerIcon: oceanCurrentIcon,layerName:'洋流',active:false},
        {layerType:'setAirPressureData',layerIcon: airPressureIcon,layerName:'气压',active:false},
        {layerType:'setSaltData',layerIcon: salinityIcon,layerName:'盐度',active:false},
      ],
      baseLayerV1 : [ // 基础图层列表
        {layerType:'setWindDataV1',layerIcon:windIcon,layerName:'风场',active:false},
        // {layerType:'setAirTemperatureDataV1',layerIcon:temperatureIcon,layerName:'气温',active:false},
        {layerType:'setWaveDataV1',layerIcon:waveIcon,layerName:'海浪',active:false},
        {layerType:'setSeaTemperatureDataV1',layerIcon: seaTemperatureIcon,layerName:'海温',active:false},
        {layerType:'setCurrentDataV1',layerIcon: oceanCurrentIcon,layerName:'洋流',active:false},
        {layerType:'setAirPressureDataV1',layerIcon: airPressureIcon,layerName:'气压',active:false},
        {layerType:'setSaltDataV1',layerIcon: salinityIcon,layerName:'盐度',active:false},
      ],
      deviceLayerV1 :[ // 设备图层列表
        {layerType:'PORT_FLAG',layerIcon:portIcon,layerName:'港口',active:false},
        {layerType:'LATLON_FLAG',layerIcon:latlonIcon,layerName:'经纬网',active:false},
      ],
      baseLayerIndex:null, // 气象图层 激活index
      layerFlag:true,  // 图层数据开关
      windFlag:false, // 风场开关
      waveFlag:false, // 海浪开关
      currentFlag:false, // 洋流开关
      saltFlag:false, // 盐度开关
      airPressureFlag:false, // 气压开关
      heatmapFlag:false, // 热力图开关
      seaTemperatureFlag:false, // 海温开关
      airTemperatureFlag:false, // 气温开关
      latlngFlag:false, //经纬度开关
      deviceFlag: false, // 设备库开关
      shipDeviceFlag: false, // 船舶开关
      portFlag: false, // 港口开关
      warningLineFlag:true, // 警戒线开关
      pipeLineFlag:false, // 管线开关
      windData:[],
      windHotData:[],
      waveData:null,
      waveHotData:null,
      currentData:null,
      currentHotData:null,
      saltData:null,
      heatmapData:null,
      airPressureData:null,
      seaTemperatureData:null,
      airTemperatureData:null,
      portData:null,
      deviceData:null,
      shipData:null,
      warningLineData:null,
      currentLat:0.0,
      currentLng:0.0,
      currentDeep:{
        data:'--',
        lat:'',
        lng:''
      },
      pipeLineData:null,
      legendShow: '', // 控制图例显示
      eventsData:null, // 地图事件data  json
      saveEventsFlag:false, // 地图事件 保存开关
      loadEventsFlag:false, // 地图事件 读取开关
    },
    style:{
      warningLineSwitch:true, // 全局 图层 警戒圈 颜色开关
      vectorAnimateSwitch:true, // 全局 图层 矢量动画 开关
    }
  },

  mutations: {
    [SET_MAP_TITLE_LAYER_INDEX](state,payload){
      state.map.titleLayerIndex = payload
      // state.map.saveEventsFlag = payload.flag
    },
    [SET_MAP_EVENTS_DATA](state,payload){
      console.log('拿到的payload：' , payload)
      state.map.eventsData = payload.data
      state.map.saveEventsFlag = payload.flag
    },
    [TOGGLE_WARNINGLINE_SWITCH](state,payload){
      state.style.warningLineSwitch = payload
    },
    [TOGGLE_VECTOR_SWITCH](state,payload){
      state.style.vectorAnimateSwitch = payload
    },
    [SET_BASE_LAYER_INDEX](state,payload){
      if (state.map.baseLayerIndex == payload.index && payload.flag){
        state.map.baseLayerIndex = null
      }else{
        state.map.baseLayerIndex = payload.index
      }
      state.map.baseLayer[payload.index].active = !payload.flag;
      state.map.baseLayerV1[payload.index].active = !payload.flag;
    },
    [SET_LAYER_FLAG](state,payload){
      state.map.layerFlag = payload;
    },
    [SET_WIND_DATA](state,payload){
      state.map.windFlag = !payload.flag;
      state.map.windData = payload.data;
      // state.map.windData = JSON.parse(demo.windData.data).dataJson;
      state.map.windHotData = payload.hotData;
    },
    [SET_WAVE_DATA](state,payload){
      state.map.waveFlag = !payload.flag;
      state.map.waveData = payload.data;
      state.map.waveHotData = payload.hotData;
    },
    [SET_CURRENT_DATA](state,payload){
      state.map.currentFlag = !payload.flag;
      state.map.currentData = payload.data;
      state.map.currentHotData = payload.hotData;
    },
    [SET_SALT_DATA](state,payload){
      state.map.saltFlag = !payload.flag;
      state.map.saltData = payload.data;
    },
    [SET_AIR_PRESSURE_DATA](state,payload){
      state.map.airPressureFlag = !payload.flag;
      state.map.airPressureData = payload.data;
    },
    [SET_SEA_TEMPERATURE_DATA](state,payload){
      state.map.seaTemperatureFlag = !payload.flag;
      state.map.seaTemperatureData= payload.data;
    },
    [SET_AIR_TEMPERATURE_DATA](state,payload){
      state.map.airTemperatureFlag = !payload.flag;
      state.map.airTemperatureData= payload.data;
    },
    [LATLON_FLAG](state){
      state.map.latlngFlag = !state.map.latlngFlag;
    },
    [PORT_FLAG](state,payload){
      state.map.portFlag = !payload.flag;
      state.map.portData = payload.data;
    },
    [DEVICE_FLAG](state,payload){
      state.map.deviceFlag = !payload.flag;
      state.map.deviceData = payload.data;
    },
    [SHIP_FLAG](state,payload){
      state.map.shipDeviceFlag = !payload.flag;
      state.map.shipData = payload.data;
    },
    [WARNINGLINE_FLAG](state,payload){
      state.map.warningLineFlag = !payload.flag;
      state.map.warningLineData = payload.data;
    },
    [SET_LATLNG](state,payload){
      state.map.currentLat = latlngChangeToDMS(payload.lat);
      state.map.currentLng = latlngChangeToDMS(payload.lng);
    },
    [PIPE_LINE_FLAG](state,payload){
      state.map.pipeLineFlag = !payload.flag;
      state.map.pipeLineData = payload.data;
    },
    [SET_WATER_DEEP_DATA](state,payload){
      state.map.currentDeep.data = payload.data;
      state.map.currentDeep.lat = latlngChangeToDMS(payload.lat);
      state.map.currentDeep.lng = latlngChangeToDMS(payload.lng);
    },
    'SET_LEGEND_CHANGE'(state, payload) {
      const { type } = payload
      state.map.legendShow = type
    },
    'SET_SAVE_EVENTS_FLAG_TRUE' (state, payload) {
      state.map.saveEventsFlag = true
    },
    'SET_LOADING_EVENTS_FLAG_TRUE' (state, payload) {
      state.map.loadEventsFlag = true
    },
    'SET_LOADING_EVENTS_FLAG_FALSE' (state, payload) {
      state.map.loadEventsFlag = false
    }
  },
  actions: {
    setWindData(context,payload){
      if (!payload.flag){
        context.commit('SET_LAYER_FLAG',false)
        let t = Number(payload.time)
        // let d1 = http.get(getWindInfo,{time:t || 1519884000000 })
        let d1 = http.get(getEarthWindInfo,{time:t || 1519884000000 })  // 全球数据
        // let d2 = http.get(getWindHotInfo,{time:t || 1519884000000 })
        Promise.all([d1]).then((value) =>{
          console.log('Promise==>',value)

          if (!checkResponseData(value)){
            context.commit('SET_LAYER_FLAG',true)
            return false
          }
          let data1 = JSON.parse(value[0].data);
          // let data2 = JSON.parse(value[1].data);
          payload.data = data1.dataJson;
          // payload.hotData = data2;

          context.commit('SET_BASE_LAYER_INDEX',payload)
          context.commit('SET_WIND_DATA',payload)
          context.commit('SET_LAYER_FLAG',true)
        })
      }else{
        payload.data = null
        payload.hotData = null
        context.commit('SET_WIND_DATA',payload)
        context.commit('SET_LAYER_FLAG',true)
        context.commit('SET_BASE_LAYER_INDEX',payload)
      }
      console.log(payload)
    },
    setWindDataV1(context,payload){
      console.log('===>',payload)
      if (!payload.flag){
        context.commit('SET_LAYER_FLAG',false)
        context.commit('SET_BASE_LAYER_INDEX',payload)
        console.log(demo.windData)
        const dat = JSON.parse(demo.windData.data)
        payload.data = dat.dataJson
        context.commit('SET_WIND_DATA',payload)
        context.commit('SET_LAYER_FLAG',true)
      }else{
        payload.data = null
        payload.hotData = null
        context.commit('SET_WIND_DATA',payload)
        context.commit('SET_LAYER_FLAG',true)
        context.commit('SET_BASE_LAYER_INDEX',payload)
      }
      console.log(payload)
    },
    setWaveData(context,payload){
      if (!payload.flag){
        context.commit('SET_LAYER_FLAG',false)
        let t = Number(payload.time)
        let d1 = http.get(getEarthWaveInfo,{time:t || 1519833600000 })
        // let d2 = http.get(getWaveHotInfo,{time:t || 1519833600000 })
        Promise.all([d1]).then((value) => {

          console.log('Promise==>', value)
          if (!checkResponseData(value)){
            context.commit('SET_LAYER_FLAG',true)
            return false
          }
          let data1 = JSON.parse(value[0].data);
          // let data2 = JSON.parse(value[1].data);
          payload.data = data1.dataJson;
          // payload.hotData = data2;
          context.commit('SET_BASE_LAYER_INDEX',payload)
          context.commit('SET_WAVE_DATA', payload)
          context.commit('SET_LAYER_FLAG', true)
        })
      }else{
        payload.data = []
        payload.hotData = []
        context.commit('SET_WAVE_DATA',payload)
        context.commit('SET_LAYER_FLAG',true)
        context.commit('SET_BASE_LAYER_INDEX',payload)
      }
      console.log(payload)
    },
    setWaveDataV1(context,payload){
      if (!payload.flag){
        context.commit('SET_LAYER_FLAG',false)
        console.log(demo.windData)
        const dat = JSON.parse(demo.seaWaveData.data)
          payload.data = dat.dataJson;
        context.commit('SET_LAYER_FLAG', true)
        context.commit('SET_BASE_LAYER_INDEX',payload)
        context.commit('SET_WAVE_DATA', payload)
      }else{
        payload.data = []
        payload.hotData = []
        context.commit('SET_LAYER_FLAG',true)
        context.commit('SET_WAVE_DATA',payload)
        context.commit('SET_BASE_LAYER_INDEX',payload)
      }
      console.log(payload)
    },
    setCurrentData(context,payload){
      if (!payload.flag){
        context.commit('SET_LAYER_FLAG',false)
        let t = Number(payload.time)
        let testTime = fakeTime(t)
        let d1 = http.get(getEarthCurrentInfo,{time:testTime || 1519747200000 })
        // let d2 = http.get(getCurrentHotInfo,{time:t || 1519747200000 })
        Promise.all([d1]).then((value) => {
          console.log('Promise==>', value)

          if (!checkResponseData(value)){
            context.commit('SET_LAYER_FLAG',true)
            return false
          }
          let data1 = JSON.parse(value[0].data);
          // let data2 = JSON.parse(value[1].data);
          payload.data = data1.dataJson;
          // payload.hotData = data2;
          context.commit('SET_BASE_LAYER_INDEX',payload)
          context.commit('SET_CURRENT_DATA', payload)
          context.commit('SET_LAYER_FLAG', true)
        })

      }else{
        payload.data = []
        payload.hotData = []
        context.commit('SET_CURRENT_DATA',payload)
        context.commit('SET_LAYER_FLAG',true)
        context.commit('SET_BASE_LAYER_INDEX',payload)
      }
      console.log(payload)
    },
    setCurrentDataV1(context,payload){
      if (!payload.flag){
        context.commit('SET_LAYER_FLAG',false)
        const dat = JSON.parse(demo.seaCurrentData.data)
        payload.data = dat.dataJson;
          context.commit('SET_BASE_LAYER_INDEX',payload)
          context.commit('SET_CURRENT_DATA', payload)
          context.commit('SET_LAYER_FLAG', true)

      }else{
        payload.data = []
        payload.hotData = []
        context.commit('SET_CURRENT_DATA',payload)
        context.commit('SET_LAYER_FLAG',true)
        context.commit('SET_BASE_LAYER_INDEX',payload)
      }
      console.log(payload)
    },
    setAirPressureData(context,payload){
      if (!payload.flag){
        context.commit('SET_LAYER_FLAG',false)
        let t = Number(payload.time)
        // http.get(getAirPressure,{time:t || 1519833600000}).then((data)=>{
        http.get(getEarthPressureInfo,{time:t || 1519833600000}).then((data)=>{
          console.log(data)
          if (!checkResponseData(data)){
            context.commit('SET_LAYER_FLAG',true)
            return false
          }
          let temp = JSON.parse(data.data)
          // temp.dataJson[0].data.map((v,i)=>{
          //   return v = v * 0.01
          // })
          payload.data = temp.dataJson
          context.commit('SET_BASE_LAYER_INDEX',payload)

          context.commit('SET_AIR_PRESSURE_DATA',payload)
          context.commit('SET_LAYER_FLAG',true)
        })
      }else{
        payload.data = []
        context.commit('SET_AIR_PRESSURE_DATA',payload)
        context.commit('SET_LAYER_FLAG',true)
        context.commit('SET_BASE_LAYER_INDEX',payload)

      }
      console.log(payload)
    },
    setAirPressureDataV1(context,payload){
      if (!payload.flag){
        context.commit('SET_LAYER_FLAG',false)
        const dat = JSON.parse(demo.pressureData.data)
        payload.data = dat.dataJson;
          context.commit('SET_BASE_LAYER_INDEX',payload)

          context.commit('SET_AIR_PRESSURE_DATA',payload)
          context.commit('SET_LAYER_FLAG',true)
      }else{
        payload.data = []
        context.commit('SET_AIR_PRESSURE_DATA',payload)
        context.commit('SET_LAYER_FLAG',true)
        context.commit('SET_BASE_LAYER_INDEX',payload)

      }
      console.log(payload)
    },
    setSeaTemperatureData(context,payload){
      if (!payload.flag){
        context.commit('SET_LAYER_FLAG',false)
        let t = Number(payload.time)
        http.get(getEarthSeaTempInfo,{time :t || 1519833600000}).then((data)=>{
          console.log(data)

          if (!checkResponseData(data)){
            context.commit('SET_LAYER_FLAG',true)
            return false
          }
          let temp = JSON.parse(data.data)
          payload.data = temp.dataJson
          context.commit('SET_BASE_LAYER_INDEX',payload)
          context.commit('SET_SEA_TEMPERATURE_DATA',payload)
          context.commit('SET_LAYER_FLAG',true)
        })
      }else{
        payload.data = []
        context.commit('SET_SEA_TEMPERATURE_DATA',payload)
        context.commit('SET_LAYER_FLAG',true)
        context.commit('SET_BASE_LAYER_INDEX',payload)

      }
      console.log(payload)
    },
    setSeaTemperatureDataV1(context,payload){
      if (!payload.flag){
        context.commit('SET_LAYER_FLAG',false)
        const dat = JSON.parse(demo.temperatureData.data)
        payload.data = dat.dataJson;
          context.commit('SET_BASE_LAYER_INDEX',payload)
          context.commit('SET_SEA_TEMPERATURE_DATA',payload)
          context.commit('SET_LAYER_FLAG',true)

      }else{
        payload.data = []
        context.commit('SET_SEA_TEMPERATURE_DATA',payload)
        context.commit('SET_LAYER_FLAG',true)
        context.commit('SET_BASE_LAYER_INDEX',payload)

      }
      console.log(payload)
    },
    setAirTemperatureData(context,payload){
      if (!payload.flag){
        context.commit('SET_LAYER_FLAG',false)
        let t = Number(payload.time)
        http.get(getAirTemperature,{month:t || 3}).then((data)=>{
          console.log(data)
          if (!checkResponseData(data)){
            context.commit('SET_LAYER_FLAG',true)
            return false
          }
          let temp = JSON.parse(data.data)
          payload.data = temp
          context.commit('SET_BASE_LAYER_INDEX',payload)
          context.commit('SET_AIR_TEMPERATURE_DATA',payload)
          context.commit('SET_LAYER_FLAG',true)
        })
      }else{
        payload.data = []
        context.commit('SET_AIR_TEMPERATURE_DATA',payload)
        context.commit('SET_LAYER_FLAG',true)
        context.commit('SET_BASE_LAYER_INDEX',payload)

      }
      console.log(payload)
    },
    // 查询水深数据
    setWaterDeepData(context,payload){
      let {lat,lng} = payload;
      let obj = {latitude : (+lat).toFixed(1),longitude: (+lng).toFixed(1) }
      http.get(getWaterDeptInfo,{...obj}).then((data)=>{
        console.log(data)
        // if (!checkResponseData(data)){
        //   return false
        // }
        let res = {}
        if (!data.data){
          res.data = '--'
        }else{
          let temp = JSON.parse(data.data)
          res.data = Number(temp).toFixed(2)
        }
        res.lat = payload.lat
        res.lng = payload.lng
        context.commit('SET_WATER_DEEP_DATA',res)
      })
      // console.log(context,payload)
    },

    setSaltData(context,payload){
      if (!payload.flag){
        context.commit('SET_LAYER_FLAG',false)
        let t = Number(payload.time)
        http.get(getSaltInfo,{month:new Date(t).getMonth() + 1 || 1}).then((data)=>{
          // http.get(getSaltInfo,{time:t || 1519833600000}).then((data)=>{
          console.log(data)
          if (!checkResponseData(data)){
            context.commit('SET_LAYER_FLAG',true)
            return false
          }
          let temp = JSON.parse(data.data)
          payload.data = temp.dataJson
          context.commit('SET_BASE_LAYER_INDEX',payload)
          context.commit('SET_SALT_DATA',payload)
          context.commit('SET_LAYER_FLAG',true)
        })
      }else{
        payload.data = []
        context.commit('SET_SALT_DATA',payload)
        context.commit('SET_LAYER_FLAG',true)
        context.commit('SET_BASE_LAYER_INDEX',payload)

      }
      console.log(context,payload)
    },
    setSaltDataV1(context,payload){
      if (!payload.flag){
        context.commit('SET_LAYER_FLAG',false)
        let t = Number(payload.time)
        const dat = JSON.parse(demo.salinityData.data)
        payload.data = dat.dataJson;
          context.commit('SET_BASE_LAYER_INDEX',payload)
          context.commit('SET_SALT_DATA',payload)
          context.commit('SET_LAYER_FLAG',true)
      }else{
        payload.data = []
        context.commit('SET_SALT_DATA',payload)
        context.commit('SET_LAYER_FLAG',true)
        context.commit('SET_BASE_LAYER_INDEX',payload)

      }
      console.log(context,payload)
    },
    setShipData(context,payload){
      if (context.state.map.shipData != null){
        payload.data = context.state.map.shipData;
        context.commit('SHIP_FLAG',payload)
      }else {
        // todo companyId
        http.post(getShipList).then((data) => {
          console.log(data.data)
          if (!checkResponseData(data)){
            context.commit('SET_LAYER_FLAG',true)
            return false
          }
          // let re = formatPipeLine(data.data)
          payload = Object.assign(payload, {data: [...data.data]})
          context.commit('SHIP_FLAG', payload)
          // console.log(" ====> " ,payload)
        })
      }
    },
    setPortData(context,payload){
      if (context.state.map.portData != null){
        payload.data = context.state.map.portData;
        context.commit('PORT_FLAG',payload)
      }else {
        http.get(getPortList).then((data) => {
          console.log(data.data)
          if (!checkResponseData(data)){
            context.commit('SET_LAYER_FLAG',true)
            return false
          }
          // let re = formatPipeLine(data.data)
          payload = Object.assign(payload, {data: [...data.data]})
          context.commit('PORT_FLAG', payload)
          console.log(" ====> " ,payload)
        })
      }
    },
    setDeviceData(context,payload){
      if (context.state.map.deviceData != null){
        payload.data = context.state.map.deviceData;
        context.commit('DEVICE_FLAG',payload)
      }else {
        // todo companyId
        http.get(getDeviceList,{companyId:184}).then((data) => {
          console.log(data.data)
          if (!checkResponseData(data)){
            context.commit('SET_LAYER_FLAG',true)
            return false
          }
          // let re = formatPipeLine(data.data)
          payload = Object.assign(payload, {data: [...data.data]})
          context.commit('DEVICE_FLAG', payload)
          // console.log(" ====> " ,payload)
        })
      }
    },
    setWarningLineData(context,payload){
      if (context.state.map.warningLineData != null){
        payload.data = context.state.map.warningLineData;
        context.commit('WARNINGLINE_FLAG',payload)
      }else {
        // todo userId
        http.get(getPlatCordonInfo, {userId: 1}).then((data) => {
          console.log(" ====> " ,data.data)
          if (!checkResponseData(data)){
            context.commit('SET_LAYER_FLAG',true)
            return false
          }
          payload = Object.assign(payload, {data: [...data.data]})
          context.commit('WARNINGLINE_FLAG', payload)
        })
      }
    },
    setPipeLineData(context,payload){
      if (context.state.map.pipeLineData != null){
        payload.data = context.state.map.pipeLineData;
        context.commit('PIPE_LINE_FLAG',payload)
      }else {
        http.get(getPipeLineList).then((data) => {
          if (!checkResponseData(data)){
            context.commit('SET_LAYER_FLAG',true)
            return false
          }
          let temp = data.data;
          temp.map((v,i) =>{
            return v.pipelineRoute = formatPipeLine(v.pipelineRoute)
          })
          console.log(temp)
          // let re = formatPipeLine(data.data)
          payload = Object.assign(payload, {data: [...temp]})
          context.commit('PIPE_LINE_FLAG', payload)
          console.log(" ====> " ,payload)
        })
      }
    },
  },
  modules: {

  }
}
