<template>
  <div class="container" id="capture">
    <!--  地图工具栏-->
    <div class="map-tools" :style="{right:toolbarRight + 'px'}">
        <ul class="map-tools-bar" :class="{'map-tools-bar-phone': isMobile}" v-show="!isMobile">
          <li v-for="(v,index) in mapToolBar" :key="index" @click="activeTool(v,index)"  :class="activeToolIndex == index ?'active':''">
            <span><img :src="v.icon" alt="" >{{v.name}}</span>
            <ul v-if="v.children && v.children.length > 0" class="children-tool-bar" :class="{'children-tool-bar-phone': isMobile}" v-show="activeToolIndex == index">
              <li v-for="(item,n) in v.children"   @click.stop="setLabelMakerIcon(item,index)"><span :style="{transform: item.name === '清除' ? 'translateX(-3px)' : 'translateX(0px)'}"><img :src="item.icon" alt="">{{item.name}}<span v-if="index == 3"> > </span></span>
                <ul class="icon-arr">
                  <li v-for="(it,i) in item.iconArr" :key="i" @click.stop="setLabelMakerIcon(item,n,it,i)"><img :src="it.url" alt=""></li>
                </ul>
              </li>
            </ul>
          </li>

        </ul>

      <ul class="map-tools-bar" :class="{'map-tools-bar-phone': isMobile}" v-show="isMobile">
        <li v-for="(v,index) in mapToolBar1" :key="index" @click="activeTool(v,index)"  :class="activeToolIndex == index ?'active':''">
          <span style="display: flex;flex-direction: column;">
            <img :src="v.icon" alt="" >
            <div class="vname">
              {{v.name}}
            </div>
          </span>
            <ul class="icon-arr children-tool-bar" :class="{'children-tool-bar-phone': isMobile}" v-show="activeToolIndex == index">
              <li v-for="(it,i) in v.iconArr" :key="i" @click.stop="setLabelMakerIcon(v,index,it,i)"><img :src="it.url" alt=""></li>
            </ul>
        </li>
      </ul>

    </div>

    <l-map id="map" ref='map' class="map" :zoom="zoom" :center="center" :minZoom="minZoom" :maxZoom="maxZoom"  :crs="crs" :options="{zoomControl: false,attributionControl:false}" :style="{height:mapHeight}">

      <!-- 台风影响标记 -->
      <div v-for="(value, key, index) in routeObj" v-if="isShowInfluence">
        <l-layer-group v-for="(item,i) in routeObj[key].influenceMarker" :key="i" v-if="zoom >= 9 && (item.platfType === 'platform' || item.platfType === 'oilFileId')">
          <l-marker :lat-lng="[item.platfLatg, item.platfLong]" :icon="item.platfType === 'platform' ? warningIcon : oilWarningIcon">
            <l-popup class="warning-line-pop">
              <div>
                <p><span>{{item.platfName}}</span> <span>N{{item.platfLatg}}</span><span>E{{item.platfLong}}</span><span @click="typhoonDetailWarningLine(i, key)" ><i  class="el-icon-view" :class="[item.platformCordonOn != 1 ? 'disabled': '']"></i></span></p>
              </div>
            </l-popup>
          </l-marker>
        </l-layer-group>
        <l-layer-group id="" v-if="zoom >= 9 && warningLineFlag">
          <l-layer-group   v-for="(item,i) in routeObj[key].influenceMarker"  :key="i" v-if="item.platformCordonOn == 1 && (item.platfType === 'platform' || item.platfType === 'oilFileId')">
            <l-circle  :lat-lng="[item.platfLatg, item.platfLong]"
                      :radius="warningLineDataAll.platformCordon3 * 1000" :color="warningLineTypes.color3" :fill-color="warningLineTypes.color3" :fill-opacity="fillOpacity" dash-array="8">
            </l-circle>
            <l-circle  :lat-lng="[item.platfLatg, item.platfLong]"
                      :radius="warningLineDataAll.platformCordon2 * 1000" :color="warningLineTypes.color2" :fill-color="warningLineTypes.color2" :fill-opacity="fillOpacity" dash-array="8">
            </l-circle>
            <l-circle :lat-lng="[item.platfLatg, item.platfLong]"
                      :radius="warningLineDataAll.platformCordon1 * 1000" :color="warningLineTypes.color1" :fill-color="warningLineTypes.color1" :fill-opacity="fillOpacity" dash-array="8">
            </l-circle>
          </l-layer-group>
        </l-layer-group>
      </div>
      <!--  油汽田平台-->
      <l-layer-group   v-for="(item,index) in oilPoints" :key="index" v-if="item.rank === 3 || item.rank === 2">
        <l-marker :lat-lng="item.location" :icon="item.rank === 3 ? warningIcon : oilWarningIcon">
          <l-popup class="warning-line-pop">
            <div>
              <p><span>{{item.name}}</span> <span>N{{item.location[0]}}</span><span>E{{item.location[1]}}</span><span @click="toggleWarningLine(index)" ><i  class="el-icon-view" :class="[item.platformCordonOn != 1 ? 'disabled': '']"></i></span></p>
            </div>
          </l-popup>
        </l-marker>
      </l-layer-group>

      <!--   警戒线圈   -->
      <l-layer-group id="circle-group" v-if="warningLineFlag">
        <l-layer-group   v-for="(item,index) in oilPoints"  :key="index" v-if="item.platformCordonOn == 1 && (item.rank === 3 || item.rank === 2)">
          <l-circle  :lat-lng="item.location"
                    :radius="warningLineDataAll.platformCordon3 * 1000" :color="warningLineTypes.color3" :fill-color="warningLineTypes.color3" :fill-opacity="warningLineSwitch ? fillOpacity: 0" dash-array="8">
          </l-circle>
          <l-circle  :lat-lng="item.location"
                    :radius="warningLineDataAll.platformCordon2 * 1000" :color="warningLineTypes.color2" :fill-color="warningLineTypes.color2" :fill-opacity="warningLineSwitch ? fillOpacity: 0" dash-array="8">
          </l-circle>
          <l-circle :lat-lng="item.location"
                    :radius="warningLineDataAll.platformCordon1 * 1000" :color="warningLineTypes.color1" :fill-color="warningLineTypes.color1"  :fill-opacity="warningLineSwitch ? fillOpacity: 0" dash-array="8">
          </l-circle>
        </l-layer-group>
      </l-layer-group>
    </l-map>
<!--    <div id="mask-map" :style="{height:mapHeight}">-->

<!--    </div>-->
    <!-- 定位modal  -->
    <el-dialog
      title="定位输入"
      class="location-dialog"
      :visible.sync="LocationDialogShow"
      width="320px" :modal="false" :show-close="false" :close-on-click-modal="false" :top="'30vh'" v-dialogDrag>
      <div class="dialog-header"><p style="cursor: pointer" @click="toggleLatlngType"><span>{{latlngText}}</span> 切换 <span>>></span></p></div>
      <div class="dialog-body">
        <el-form :model="location" :rules="locationRules" :inline="true" v-if="latlngTypeFlag">
          <el-form-item label="经度:" prop="lng">
            <el-input placeholder="请输入经度" v-model="location.lng" @input="handleValueChange('1')"></el-input>
            <!-- <el-input-number v-model="location.lng" :precision="6" :step="0.1" placeholder="请输入经度" :controls="false"></el-input-number> -->
          </el-form-item>
          <el-form-item label="纬度:" prop="lat">
            <el-input placeholder="请输入纬度" v-model="location.lat" @input="handleValueChange('1')"></el-input>
            <!-- <el-input-number v-model="location.lat" :precision="6" :step="0.1" placeholder="请输入纬度" :controls="false"></el-input-number> -->
          </el-form-item>
        </el-form>
        <el-form class="latlng-form" v-else>
          <div class="latlng-form-div">
            <span class="latlng-label">经度:</span>
            <el-input class="latlng-input" placeholder="度" v-model="location.lngDMS[0]" @input="handleValueChange('0')"></el-input>°
            <el-input class="latlng-input" placeholder="分" v-model="location.lngDMS[1]" @input="handleValueChange('0')"></el-input>′
            <el-input class="latlng-input" placeholder="秒" v-model="location.lngDMS[2]" @input="handleValueChange('0')"></el-input>″
          </div>
          <div class="latlng-form-div">
            <span class="latlng-label">纬度:</span>
            <el-input class="latlng-input" placeholder="度" v-model="location.latDMS[0]" @input="handleValueChange('0')"></el-input>°
            <el-input class="latlng-input" placeholder="分" v-model="location.latDMS[1]" @input="handleValueChange('0')"></el-input>′
            <el-input class="latlng-input" placeholder="秒" v-model="location.latDMS[2]" @input="handleValueChange('0')"></el-input>″
          </div>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeGetLocation()">取 消</el-button>
        <el-button type="primary" @click="getLocationByLatlng()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 文本标记 dialog  -->
    <el-dialog
      title="文本标记样式设置"
      class="location-dialog"
      :visible.sync="textMarkerFlag"
      width="320px" :modal="false" :show-close="false" :close-on-click-modal="false" :top="'30vh'" v-dialogDrag>
      <div class="dialog-body">
        <el-form :inline="true" >
          <el-form-item label="文本内容:" style="margin-bottom: 10px;">
            <el-input placeholder="标记内容" v-model="textMarkerOption.content"></el-input>
          </el-form-item>
          <el-form-item label="字体颜色:" style="margin-bottom: 0;">
            <el-color-picker
                v-model="textMarkerOption.color"
                show-alpha
                :predefine="predefineColors">
            </el-color-picker>
          </el-form-item>
          <el-form-item label="字体大小:" style="margin-bottom: 10px;">
            <el-select v-model="textMarkerOption.fontSize" placeholder="请选择">
              <el-option
                  v-for="item in textFontSize"
                  :key="item.value"
                  :label="item.value"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeTextMarkerDialog()">取 消</el-button>
        <el-button type="primary" @click="textMarker()">标 记</el-button>
      </span>
    </el-dialog>

    <!-- 图标标记 dialog  -->
    <el-dialog
      title="图标标记样式设置"
      class="location-dialog"
      :visible.sync="iconMarkerFlag"
      width="320px" :modal="false" :show-close="false" :close-on-click-modal="false" :top="'30vh'" v-dialogDrag >
      <div class="dialog-body">
        <el-form :inline="true" >
          <el-form-item label="图标样式:" style="width: 100%;display: flex;padding-left: 10px;margin-bottom: 0">
            <img style="width: 40px;height: 40px;" :src="iconMakerOption.icon" alt="">
          </el-form-item>
          <el-form-item label="文本内容:" style="margin-bottom: 10px;">
            <el-input placeholder="标记内容" v-model="iconMakerOption.content"></el-input>
          </el-form-item>
          <el-form-item label="字体大小:" style="margin-bottom: 10px;">
            <el-select v-model="iconMakerOption.fontSize" placeholder="请选择">
              <el-option
                  v-for="item in textFontSize"
                  :key="item.value"
                  :label="item.value"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelIconMarker()">取 消</el-button>
        <el-button type="primary" @click="iconMarkerEnd()">标 记</el-button>
      </span>
    </el-dialog>

    <!-- 图形标记 dialog  -->
    <el-dialog
      title="图形标记样式设置"
      class="location-dialog"
      :visible.sync="shapeMarkerFlag"
      width="320px" :modal="false" :show-close="false" :close-on-click-modal="false" :top="'30vh'" v-dialogDrag >
      <div class="dialog-body">
        <el-form :inline="true" >

          <el-form-item label="文本内容:" style="margin-bottom: 10px;">
            <el-input placeholder="标记内容" v-model="shapeMarkerOption.content"></el-input>
          </el-form-item >

          <el-form-item label="字体大小:" style="margin-bottom: 10px;">
            <el-select v-model="shapeMarkerOption.fontSize" placeholder="请选择">
              <el-option
                  v-for="item in textFontSize"
                  :key="item.value"
                  :label="item.value"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="文本颜色:" style="margin-bottom: 0px;">
            <el-color-picker
                v-model="shapeMarkerOption.color"
                show-alpha
                :predefine="predefineColors">
            </el-color-picker>
          </el-form-item>

          <el-form-item label="区域颜色:" style="margin-bottom: 0px;">
            <el-color-picker
                v-model="shapeMarkerOption.fillColor"
                show-alpha
                :predefine="predefineColors">
            </el-color-picker>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelShapeMarker()">取 消</el-button>
        <el-button type="primary" @click="shapeMarkerEnd()">标 记</el-button>
      </span>
    </el-dialog>

    <!-- 线段标记 dialog  -->
    <el-dialog
      title="线段标记样式设置"
      class="location-dialog"
      :visible.sync="lineMarkerFlag"
      width="320px" :modal="false" :show-close="false" :close-on-click-modal="false" :top="'30vh'" v-dialogDrag >
      <div class="dialog-body">
        <el-form :inline="true" >
          <el-form-item label="线段:" style="margin-bottom: 10px;">
            <el-select v-model="lineMakerOption.lineType" placeholder="请选择">
              <el-option
                  v-for="item in lineTypes"
                  :key="item.value"
                  :value-key="item.label"
                  :label="item.label"
                  :value="item">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="箭头:" style="margin-bottom: 10px;">
            <el-select v-model="lineMakerOption.arrowType" placeholder="请选择">
              <el-option
                  v-for="item in arrowTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="颜色:" style="margin-bottom: 0px;">
            <el-color-picker
                v-model="lineMakerOption.color"
                show-alpha
                :predefine="predefineColors">
            </el-color-picker>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelLineMarker()">取 消</el-button>
        <el-button type="primary" @click="lineMarkerEnd()">标 记</el-button>
      </span>
    </el-dialog>

      <!--   水深提示窗口  -->
      <div class="custom-tips" v-show="waterDeep.flag" :style="waterDeep.style">
        <p v-if="zoom > 4">
          <span>纬度:{{currentDeep.lat[0]}}°{{currentDeep.lat[1]}}′</span>
          <span>经度:{{currentDeep.lng[0]}}°{{currentDeep.lng[1]}}′</span>
        </p>
        <p v-else>
          <span>纬度:{{currentDeep.lat[0]}}°</span>
          <span>经度:{{currentDeep.lng[0]}}°</span>
        </p>
        <p>水深<span>{{currentDeep.data}}</span>米</p>
      </div>

      <!--   当前图层数据 显示窗口  -->
<!--      <div class="custom-tips" v-show="waterDeep.flag" :style="waterDeep.style">
        <p><span>{{currentDeep.data}}</span>米</p>
      </div>-->

<!--  右键菜单  -->
    <div class="contextmenu-tips" v-show="contextmenuTips.flag" :style="contextmenuTips.style">
<!--      <p >编辑</p>-->
      <p @click="contextmenuDel">删除</p>
    </div>
  </div>

</template>

<script>
  import { LMap, LMarker, LPopup, LCircle, LLayerGroup,LIcon } from "vue2-leaflet";
  // import { latLng, icon } from "leaflet"
  import { mapState } from 'vuex'
  import HeatmapOverlay from 'heatmap.js/plugins/leaflet-heatmap'
  import html2canvas from 'html2canvas'
  import { latlngChangeToDMS,DMSChangetoLatlng } from '../../utils/util'
  import { seaRiskBigData as seaRiskBigDataApi } from '@/http/riskEstimate'
  import { isMobile } from "../../utils/util"
  import moment from 'moment'
  import {testHeatmapData} from "../../mock/testData"
  import http from '@/http/index'
  import portIcon from '../../assets/map/港口码头.png'
  import deviceIcon from '../../assets/map/设备库.png'
  import warningIcon from '../../assets/map/油气田平台.png'
  import pipeIcon1 from '../../assets/map/管线1.png'
  import pipeIcon2 from '../../assets/map/管线3.png'
  import pipeIcon3 from '../../assets/map/管线2.png'
  import logo from '../../assets/typhoon-logo.png'
  import logoWhite from '../../assets/typhoon-logo-white.png'
  import platformLogo from '../../assets/map/作业区.png'
  import oilFieldLogo from '../../assets/map/平台.png'
  import chuanBoIcon from '../../assets/map/船舶聚合.png'
  import shipLogo from '../../assets/shipLogo.png'
  import arrowRed from '../../assets/arrowRed.png'
  import chuanLightLogo from '../../assets/chuanLight.png'

  import { getDetailById } from '@/http/ship'

  export default {
    name: 'LeafletMap',
    props:{

    },
    components: {
      LMap, LMarker, LPopup, LCircle, LLayerGroup
    },
    computed:{
      ...mapState('moduleMap',{
        currentDeep:state => state.map.currentDeep,
        titleLayerIndex:state => state.map.titleLayerIndex,
        titleLayers:state => state.map.titleLayers,
        baseLayerIndex:state => state.map.baseLayerIndex,
        baseLayer:state => state.map.baseLayer,
        windFlag: state => state.map.baseLayer[0].active,
        waveFlag: state => state.map.baseLayer[1].active,
        currentFlag: state => state.map.baseLayer[3].active,
        saltFlag: state => state.map.baseLayer[5].active,
        seaTemperatureFlag: state => state.map.baseLayer[2].active,
        airTemperatureFlag: state => state.map.baseLayer[9].active,
        airPressureFlag: state => state.map.baseLayer[4].active,
        latlngFlag: state => state.map.latlngFlag,
        portFlag: state => state.map.portFlag,
        deviceFlag: state => state.map.deviceFlag,
        shipDeviceFlag: state => state.map.shipDeviceFlag,
        warningLineFlag: state => state.map.warningLineFlag,
        pipeLineFlag: state => state.map.pipeLineFlag,
        windData: state => state.map.windData,
        windHotData: state => state.map.windHotData,
        currentData: state => state.map.currentData,
        currentHotData: state => state.map.currentHotData,
        saltData: state => state.map.saltData,
        waveData: state => state.map.waveData,
        waveHotData: state => state.map.waveHotData,
        heatmapData: state => state.map.heatmapData,
        seaTemperatureData: state => state.map.seaTemperatureData,
        airTemperatureData: state => state.map.airTemperatureData,
        airPressureData: state => state.map.airPressureData,
        deviceData: state => state.map.deviceData,
        shipData: state => state.map.shipData,
        portData: state => state.map.portData,
        warningLineData: state => state.map.warningLineData,
        pipeLineData: state => state.map.pipeLineData,
        warningLineSwitch:state =>state.style.warningLineSwitch,  // 全局警戒圈 填充颜色 开关
        vectorAnimateSwitch:state =>state.style.vectorAnimateSwitch,// // 全局 矢量动画 开关
        saveEventsFlag:state =>state.map.saveEventsFlag,// // 地图事件 保存开关
        eventsData:state =>state.map.eventsData,// // 地图事件数据
        loadEventsFlag:state =>state.map.loadEventsFlag,// // 地图事件 读取开关
      }),
      ...mapState('moduleHome',{ // 注入state
        leftShow:state =>state.leftShow,
        rightShow:state =>state.rightShow,
      }),
      toolbarRight(){
        return this.rightShow ? 380 : 20
      },
      latlngText(){
        return   this.latlngTypeFlag ? '度分秒':'度'
      },
    },
    watch:{
      titleLayerIndex(){
        this.initTitleLayer(this.titleLayerIndex)
      },
      saveEventsFlag(){
        if(this.saveEventsFlag){
          this.saveMapEventsToJson()
        }
      },
      portFlag(){
        if (this.portFlag){
          this.addPortMarker()
        }else{
          this.removePortMarker()
        }
      },
      deviceFlag(){
        if (this.deviceFlag){
          this.addDeviceMarker()
        }else{
          this.removeDeviceMarker()
        }
      },
      pipeLineFlag(){
        if (this.pipeLineFlag){
          this.addPipeLineMarker()
        }else{
          this.removePipeLineMarker()
        }
      },
      vectorAnimateSwitch(){
        // if (!this.vectorAnimateSwitch){
          this.toggleVectorLayer(this.vectorAnimateSwitch)
        // }
      },
      currentDrawLayerId(){
        console.log('===>currentDrawLayerId',this.currentDrawLayerId)
      },
      windData(){
        this.removeVectorLayer();
        if (this.baseLayerIndex == 0 && this.windFlag){
          this.addVectorLayer('wind',this.windData);
          this.addScalarLayer('wind',this.windData)
          // this.addHeatmap(this.windHotData,'wind')
        }else{
          this.resetMapLayer()
        }
      },
      currentData(){
        this.removeVectorLayer();
        if (this.baseLayerIndex == 3 && this.currentFlag){
          this.addVectorLayer('current',this.currentData);
          this.addScalarLayer('current',this.currentData)
          // this.addHeatmap(this.currentHotData,'current')
        }else{
          this.resetMapLayer()
        }
      },
      waveData(){
        this.removeVectorLayer()
        if (this.baseLayerIndex == 1 && this.waveFlag){
          this.addVectorLayer('wave',this.waveData);
          this.addScalarLayer('wave',this.waveData)
          // this.addHeatmap(this.waveHotData,'wave')
        }else{
          this.resetMapLayer()
        }
      },
      saltData(){
        this.removeVectorLayer()
        // console.log(this.saltFlag)
        if (this.baseLayerIndex == 5&& this.saltFlag){
          this.addScalarLayer('salt',this.saltData);
        }else{
          this.resetMapLayer();
        }
      },
      seaTemperatureData(){
        this.removeVectorLayer()
        // console.log(this.seaTemperatureFlag)
        if (this.baseLayerIndex == 2 && this.seaTemperatureFlag){
          this.addScalarLayer('seaTemp',this.seaTemperatureData)
          // this.addHeatmap(this.seaTemperatureData);
        }else{
          this.resetMapLayer();
        }
      },
      airTemperatureData(){
        this.removeVectorLayer()
        // console.log(this.airTemperatureFlag)
        if (this.airTemperatureFlag){
          this.addScalarLayer('airTemp',this.airTemperatureData)
          // this.addHeatmap(this.airTemperatureData);
        }else{
          this.resetMapLayer();
        }
      },
      airPressureData(){
        this.removeVectorLayer()
        // console.log(this.airPressureFlag)
        if (this.baseLayerIndex == 4 && this.airPressureFlag){
          this.addScalarLayer('pressure',this.airPressureData)
          // this.addHeatmap(this.airPressureData,'pressure');
        }else{
          this.resetMapLayer();
        }
      },
      latlngFlag(){
        if (this.latlngFlag){
          this.addLatlngLayer();
        }else{
          this.removeLatlngLayer();
        }
      },
      routeFlag() {
        // console.log('启动路径', this.routeFlag)
        if (this.routeFlag) {
          this.drawRoute()
          this.isShowInfluence = false
          this.addInfluenceMarker(this.zoom);
        }
      },
      drawPolyLineFlag() {
        if (this.drawPolyLineFlag) {
          this.clearAllMapLayer()
          this.changeToolbar(this.drawAirLine)
        } else {
          this.clearDrawAirLineEstimate()
        }
      },
      drawPolyLineFinishedFlag() {
        if (!this.drawPolyLineFlag && !this.drawPolyLineFinishedFlag) {
          this.clearAirLineLayer()
        }
      },
      drawPolyLineSavedFlag() {
        if (this.drawPolyLineSavedFlag) {
          this.clearAirLineLayer()
        }
      },
      areaRiskEstimateUpdateStatus() {
        console.log('海区风险评估热力图层开关：', this.areaRiskEstimateUpdateStatus)
        if ((this.areaRiskEstimateLineFlag || this.areaRiskEstimateFlag) && this.areaRiskEstimateUpdateStatus !== 0) {
          // this.addScalarLayer('',this.seaRiskBigData)
          // this.removeScalarLayer()
          this.addAreaRiskEstimateHeatmap(this.seaRiskBigData)
          // this.addAreaRiskEstimateHeatmap(this.areaRiskEstimateData)
        } else {
          // console.log('=======================================')
          // this.removeAreaRiskEstimateHeatmap()
          this.removeSeaRiskScalarLayer()
          this.removeMaskMap()
        }
      },
      oilFieldFlag() {
        if (this.oilFieldFlag) {
          // this.showOilFieldPoint()
        }
      },
      shipFlag() {
        if (this.shipFlag) {
          this.showShip(this.shipList, 'selected')
        }
      },
      editable() {
        if (this.editable) {
          this.openEdit()
        } else {
          this.closeEdit()
        }
      },
      editableAI() {
        if (this.editableAI) {
          this.openEdit()
        } else {
          this.closeEdit()
        }
      },
      airLineEstimateFlag() {
        if (this.airLineEstimateFlag) {
          this.drawAirLineEstimate()
        } else {
          this.clearDrawAirLineEstimate()
        }
      },
      warningLineFlag() {
        if (this.warningLineFlag) {
          // this.addWarningLineLayer()
        } else {
          this.removeAllWarningLine()
        }
      },
      airLineAIFlag() {
        if (this.airLineAIFlag !== 0) {
          console.log('airLineEstimateData', this.airLineEstimateData)
          // this.drawAirLineAILine()
          this.drawAirLineEstimate()
        } else {
          this.clearDrawAirLineEstimate()
        }
      },
      autoShipFlag() {
        if (this.autoShipFlag) {
          this.handleSetShipPosition(this.autoShipDetail)
        }
      },
      centerViewFlag() {
        if (this.centerViewFlag) {
          this.setCenterView()
        }
      },
      shipDeviceFlag() {
        if (this.shipDeviceFlag) {
          this.showShip(this.shipData, 'base')
        } else {
          this.removeShipDeviceLayer()
        }
      },
      airLineEstimateAIFlag() {
        if (this.airLineEstimateAIFlag) {
          this.clearAirLineLayer()
          this.drawAiLine()
        }
      },
      loadEventsFlag() {
        if (this.loadEventsFlag) {
          this.addMapEventsToMap()
        }
      }
    },
    data() {
      const checkLatLng = (rule, value, callback) => {
        const reg = /^(\-|\+)?\d+(\.\d{1,6})?$/
        if (reg.test(value)) {
          callback();
        } else {
          callback(new Error('数值不正确，小数不超过6位'))
        }
      };
      return {
        contextmenuTarget:null,
        mapTitleLayer:null, // 地图底图图层
        isMobile: isMobile(),
        mapHeight: isMobile() ? document.documentElement.clientHeight + 'px' : (document.documentElement.clientHeight) + 'px',
        mapToolBar:[
          {name:'测距离',toolType:'measurePolyline',icon:require('../../assets/tool/distance.png')},
          {name:'测面积',toolType:'measurePolygon',icon:require('../../assets/tool/area.png')},
          {name:'定位',toolType:'getLocation',icon:require('../../assets/tool/position.png')},
          {name:'标记',toolType:'labelMarker',icon:require('../../assets/tool/sign.png'),
            children:[
              {name:'图形标记',toolChildType:'shapeMarker',icon:require('../../assets/tool/shape_marker.png'),iconArr:[{url:require('../../assets/tool/circle.png'),toolType:'circleMarker'},
                  {url:require('../../assets/tool/square.png'),toolType:'rectangleMarker'},
                  {url:require('../../assets/tool/polygon.png'),toolType:'polygonMarker'}
                  ]},
              {name:'图标标记',toolChildType:'iconMarker',icon:require('../../assets/tool/icon_marker.png'),iconArr:[{url:require('../../assets/tool/flag_icon.png')},{url:require('../../assets/tool/sight_icon.png')},{url:require('../../assets/tool/location_icon.png')},{url:require('../../assets/tool/star_icon.png')}]},
              {name:'线段标记',toolChildType:'lineMarker',icon:require('../../assets/tool/line_marker.png'),iconArr:[{url:require('../../assets/tool/line.png')},{url:require('../../assets/tool/dashed.png')}]}
              ]
          },
          {name:'文字',toolType:'textMarker',icon:require('../../assets/tool/font.png')},
          {name:'截图',toolType:'captureScreen',icon:require('../../assets/tool/screenshot.png')},
          {name:'编辑',toolType:'editLayer',icon:require('../../assets/tool/edit.png')},
          // {name:'删除',toolType:'deleteLayer',icon:require('../../assets/tool/del.png')},
          // {name:'清除',toolType:'clearAll',icon:require('../../assets/tool/clear.png')},
          {name:'更多',toolType:'',icon:require('../../assets/tool/more.png'),
            children:[
              {name:'清除',toolChildType:'deleteLayer',icon:require('../../assets/tool/clear.png')},
            ]
          },
        ],
          mapToolBar1:[
              {name:'距离',toolType:'measurePolyline',icon:require('../../assets/tool/distance.png')},
              {name:'面积',toolType:'measurePolygon',icon:require('../../assets/tool/area.png')},
              {name:'定位',toolType:'getLocation',icon:require('../../assets/tool/position.png')},
              // {name:'标记',toolType:'labelMarker',icon:require('../../assets/tool/sign.png'),
              //     children:[
              //         // {name:'图形标记',toolChildType:'shapeMarker',icon:require('../../assets/tool/shape_marker.png'),iconArr:[{url:require('../../assets/tool/circle.png')},{url:require('../../assets/tool/square.png')},{url:require('../../assets/tool/polygon.png')}]},
              //         // {name:'图标标记',toolChildType:'iconMarker',icon:require('../../assets/tool/icon_marker.png'),iconArr:[{url:require('../../assets/tool/flag_icon.png')},{url:require('../../assets/tool/sight_icon.png')},{url:require('../../assets/tool/location_icon.png')},{url:require('../../assets/tool/star_icon.png')}]},
              //         // {name:'线段标记',toolChildType:'lineMarker',icon:require('../../assets/tool/line_marker.png'),iconArr:[{url:require('../../assets/tool/line.png')},{url:require('../../assets/tool/dashed.png')}]}
              //     ]
              // },
            {name:'图标',toolType:'iconMarker',icon:require('../../assets/tool/icon_marker.png'),
              iconArr:[{url:require('../../assets/tool/flag_icon.png')},
                {url:require('../../assets/tool/sight_icon.png')},
                {url:require('../../assets/tool/location_icon.png')},
                {url:require('../../assets/tool/star_icon.png')}]},
            {name:'线段',toolType:'lineMarker',icon:require('../../assets/tool/line_marker.png'),
              iconArr:[{url:require('../../assets/tool/line.png')},
                {url:require('../../assets/tool/dashed.png')}]},
              {name:'文字',toolType:'textMarker',icon:require('../../assets/tool/font.png')},
              {name:'清除',toolType:'deleteLayer1',icon:require('../../assets/tool/clear.png')},
              // {name:'截图',toolType:'captureScreen',icon:require('../../assets/tool/screenshot.png')},
              // {name:'编辑',toolType:'editLayer',icon:require('../../assets/tool/edit.png')},
              // {name:'删除',toolType:'deleteLayer',icon:require('../../assets/tool/del.png')},
              // {name:'清除',toolType:'clearAll',icon:require('../../assets/tool/clear.png')},
              // {name:'更多',toolType:'',icon:require('../../assets/tool/font.png'),
              //     children:[
              //         {name:'清除',toolChildType:'deleteLayer',icon:require('../../assets/tool/clear.png')},
              //     ]
              // },
          ],
        drawAirLine: {name:'绘制航线',toolType:'airLine',icon:require('../../assets/tool/font.png')},
        warningLineTypes: {   // 警戒圈样式
          color1:'red',
          color2:'yellow',
          color3:'green',
        },
        editLayerFlag:false, // 开始编辑标记
        deleteLayerFlag:false, // 开始删除标记
        LocationDialogShow:false,
        testHeatmapData:testHeatmapData,
        map:null,  // 基础地图
        maskMap:null, // 遮罩地图
        topoLayer:null, // 遮罩图层
        heatmapLayer:null, // 热力图图层
        velocityLayer:null, // 矢量图图层
        scalarLayer:null, // 强度图图层
        latlngLayer:null, // 经纬度图层
        influenceLayer: null, // 台风影响设备标记图层
        routeLayer: null, // 台风路径图层
        areaRiskEstimatelayer: null, // 海区风险评估热力图层
        minZoom: this.Global.map.minZoom,
        maxZoom: this.Global.map.maxZoom,
        zoom: this.Global.map.zoom,
        center: this.Global.map.center,
        url: this.Global.map.mapSource.blue,
        crs:L.CRS.EPSG3857,
        fillOpacity: 0.2,
        pipeLineTypes: { // 管线图标
          type1:{color:'#434444',icon:L.icon({ /**/ iconUrl: pipeIcon1, ...this.Global.map.customIcon})},
          type2:{color:'#AD67A9',icon:L.icon({ /**/ iconUrl: pipeIcon2, ...this.Global.map.customIcon})},
          type3:{color:'#E6007A',icon:L.icon({ /**/ iconUrl: pipeIcon3, ...this.Global.map.customIcon})},
        },
        deviceIcon:L.icon({ /* 设备库图标*/ iconUrl: deviceIcon, ...this.Global.map.customIcon}),
        portIcon:L.icon({/* 港口图标*/ iconUrl: portIcon, ...this.Global.map.customIcon}) ,
        warningIcon: L.icon({  /* 平台图标*/ iconUrl: oilFieldLogo, iconSize:[15,15],iconAnchor:[5,5]}),
        oilWarningIcon: L.icon({  /* 平台图标*/ iconUrl: platformLogo, iconSize:[15,15],iconAnchor:[5,5]}),
        longLatList: [[36.12341, 120.114129], [36.22351, 120.214139], [36.32351, 120.314139], [37.42351, 121.4214139], [37.52351, 121.514139], [37.62351, 121.614139], [37.72351, 121.714139], [37.82351, 121.814139], [37.92351, 121.914139], [37.62351, 121.614139], [37.22351, 121.414139], [37.22351, 121.214139], [37.22351, 121.214139], [37.22351, 121.214139], [37.22351, 121.214139], [37.22351, 121.214139], [38.12361, 124.114149]],
        // 绘制航线
        drawLine: null,
        drawLineLayer: null,
        lineDistance: 0,
        latLngs: [],

        /*   工具栏  开始 */
        clearAllFlag:false, // 清除所有标记 flag
        currentLayerType:null,  //   =====================  当前绘制 图层 类型  ==================   绘制类型必需有且 值是唯一,用来区别当前工具绘制状态!!!!
        editLayer:null,
        deleteLayer:null,
        activeToolIndex:null, // 工具栏激活状态
        activeToolChildIndex:null, // 二级工具栏激活状态
        toolbarLayer:null,
        featureGroup:null,
        toolbarOptions:null,
        latlngTypeFlag:true, // 经纬度切换flag
        location:{   // 定位
          lat:'',  // 纬度
          lng:'',  // 经度
          latDMS:['','',''], // 纬度 => 度分秒
          lngDMS:['','',''], // 经度 => 度分秒
        },
        locationRules: {
          lat: [
            { required: false, message: '', trigger: 'change', validator: checkLatLng, }
          ],
          lng: [
            { required: false, message: '', trigger: 'change', validator: checkLatLng, }
          ]
        },
        textFontSize:[{value:'12px'}, {value:'14px'}, {value:'16px'}, {value:'18px'}, {value:'20px'},], // 标记的文字大小
        lineTypes:[{value:'0',label:'实线'},{value:'10',label:'虚线'}], // 线段标记
        arrowTypes:[{value:'0',label:'无'},{value:'1',label:'单箭头'},{value:'2',label:'双箭头'}], // 线段箭头
        predefineColors:['#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1', '#1e90ff', '#c71585',], // 标记文字可选颜色
        textMarkerFlag:false, //文字标记flag
        textMarkerOption:{color:'#FF0000', fontSize:'14px', content:''},
        iconMarkerFlag:false, // 图标标记下拉
        lineMarkerFlag:false, // 线段标记下拉
        shapeMarkerFlag:false, // 图形标记
        labelMarkerFlag:null, // 图形标记flag   1 图形  2 图标  3 线段
        iconMakerOption:{icon:'', fontSize:'14px', content:'',color:'#FF0000'}, // 图标标记style
        lineMakerOption:{lineType:{value:'0',label:'实线'}, arrowType:'无',fontSize:'14px', content:'',color:'#FF0000',}, // 线段标记style
        shapeMarkerOption:{icon:'', fontSize:'14px', content:'',color:'#FF0000',fillColor:'#00a0e9'}, // 图形标记style
        currentDrawLayerId:null, // 当前正在绘制的layer 的id
        /*  工具栏  结束*/
        oilFieldPointLayer: null, // 油气田平台点位图层
        shipLayer: null, // 船舶图层
        shipDeviceLayer: null, // 船舶基础图层
        airLineEstimateLayer: null, // 航线风险分析路径图层
        airLineFeatureGroup: null, // 编辑航线图层
        airLineAIFeatureGroup: null, // 编辑智能航线图层
        warningLineLayer: null, // 警戒线图层
        editableControl: null, // 编辑控件
        chuanLineRiskLayer: null, // 航线风险评估船logo图层
        isShowInfluence: true, // 更新影响设施视图
        latLngChangeFlag: false,
        duChangeFlag: false,
        seaRiskScalarLayer: null, // 海区风险热力图
        confirmClear: false,
        waterDeep:{  // 水深提示
          style:'',
          flag:false
        },
        contextmenuTips:{  // 右键提示
          style:'',
          flag:false
        }
      }
    },
    mounted() {
      this.initVueLeaflet()
      this.initWarningLine()
    },
    methods:{
      // 初始化 vue2leaflet
      initVueLeaflet(){
        // 地图挂载到 this.map
        this.$nextTick(() =>{
          this.map = this.$refs.map.mapObject;
          this.map.doubleClickZoom.disable(); // 禁用双击放大
          window.map = this.map; // 注册 全局 map 对象
          this.map.on('mousemove',(e)=>{ // 经纬度显示
            this.$store.commit('moduleMap/SET_LATLNG',e.latlng)
          })
          // this.map.on('click',(e)=>{ // 水深
          //   console.log(e.latlng)
            // L.popup().setLatLng(e.latlng).setContent('<p>' + e.latlng.lat.toFixed(2) +',' + e.latlng.lng.toFixed(2) + '</p>').openOn(this.map)
            // this.$store.dispatch('moduleMap/setWaterDeepData',e.latlng)
          //   this.showWaterDeep(e)
          //   if(this.pointSelectFlag) {
          //   }
          // })
          this.map.addEventListener("mousedown", (e) => {
            // 阻止浏览器右键菜单弹出
            document.oncontextmenu = () => {
                event.returnValue = !this.drawPolyLineFlag;
            }
            if(this.drawPolyLineFlag && e.originalEvent.button === 2 && this.drawLine._currentLatLng) {
                this.drawLine.deleteLastVertex()
            }
          })
          this.map.on('movestart',()=>{
            this.hideWaterDeep();
            this.closeContextmenu();
          })
          // 监听Esc键取消绘制航线
          this.map.addEventListener('keyup', (e) => {
            if (e.originalEvent.keyCode) {
             this.clearAirLineLayer()
            }
          })
          // 监听地图缩放等级
          this.map.addEventListener("zoomend", (e) =>{
            const ZoomNum = this.map.getZoom();
            this.zoom = ZoomNum
            console.log('地图缩放监听：', ZoomNum)
            if (ZoomNum >= 9) {
              this.addInfluenceMarker(ZoomNum);
            } else {
              this.removeInfluenceMarker()
            }
            console.log(ZoomNum)
          })
          // this.heatmapLayer = new HeatmapOverlay(this.Global.map.heatmapConfg).addTo(this.map)
          // 绘制航线事件
          // 初始化工具条
          this.initToolbarLayer();
          // const wData = JSON.parse(demo.windData.data)
          setTimeout(() =>{
            this.initTitleLayer(1); // 默认加载午夜蓝 底图
            // this.$store.commit("moduleMap/SET_WIND_DATA", {flag: false, data: wData.dataJson})
            // process.env.NODE_ENV == 'production' ? this.$store.dispatch('moduleMap/setWindData',{index:0,flag:false,time:new Date('2020/1/1').getTime()}) : () =>{ }
          },1000)
        })
      },
      // 加载 遮罩 图层
      addMaskMap(){
        //layer for disctrict
        // 地图添加topojson图层
        const districtLayer = (layer) => {
          layer.setStyle({fillColor: '#00192E', weight: 1.5, color: '#464849', opacity: 1, fillOpacity: 1});
        }

        if (this.topoLayer){
          this.topoLayer.addData(Geojson);
          this.topoLayer.eachLayer(districtLayer);
          this.topoLayer.addTo(this.map);

        }else{
          //changing topojson to geojson
          L.TopoJSON = L.GeoJSON.extend({
            addData: function (jsonData) {
              if (jsonData.type === "Topology") {
                for (let key in jsonData.objects) {
                  if (jsonData.objects.hasOwnProperty(key)) {
                    let geojson = topojson.feature(jsonData, jsonData.objects[key]);
                    L.GeoJSON.prototype.addData.call(this, geojson);
                  }
                }
              } else {
                L.GeoJSON.prototype.addData.call(this, jsonData);
              }
            }
          });
          this.topoLayer = new L.TopoJSON();
          // 读取json数据
          this.topoLayer.addData(Geojson);
          this.topoLayer.eachLayer(districtLayer);
          this.topoLayer.addTo(this.map);
          console.log('加载 mask 图层')
        }
      },
      // 移除遮罩 图层
      removeMaskMap(){
        if (this.topoLayer) {
          this.topoLayer.clearLayers()
          this.topoLayer.remove()
        }
      },
      // 初始化底图
      initTitleLayer(index){
        if (this.mapTitleLayer){
          this.mapTitleLayer.setUrl(this.titleLayers[index].url)
        }else{
          this.mapTitleLayer = L.tileLayer(this.titleLayers[index].url, {
            // maxZoom: 18,
            // tileSize: 256,
            // zoomOffset: 1
          }).addTo(this.map)
          // this.initChinaLayer();
        }
      },
      // 加载多种底图
      initChinaLayer(){
        /**
         * 智图地图内容
         */
        var normalm1 = L.tileLayer.chinaProvider('Geoq.Normal.Map', {maxZoom: 20, minZoom: 3}),normalm2 = L.tileLayer.chinaProvider('Geoq.Normal.Color', {maxZoom: 20, minZoom: 3}),normalm3 = L.tileLayer.chinaProvider('Geoq.Normal.PurplishBlue', {maxZoom: 20, minZoom: 3}),normalm4 = L.tileLayer.chinaProvider('Geoq.Normal.Gray', {maxZoom: 20, minZoom: 3}),normalm5 = L.tileLayer.chinaProvider('Geoq.Normal.Warm', {maxZoom: 20, minZoom: 3}),normalm6 = L.tileLayer.chinaProvider('Geoq.Normal.Cold', {maxZoom: 20, minZoom: 3});
        /**
         * 天地图内容
         */
        var normalm = L.tileLayer.chinaProvider('TianDiTu.Normal.Map', {maxZoom: 20, minZoom: 3}), normala = L.tileLayer.chinaProvider('TianDiTu.Normal.Annotion', {maxZoom: 20, minZoom: 3}), imgm = L.tileLayer.chinaProvider('TianDiTu.Satellite.Map', {maxZoom: 20, minZoom: 3}), imga = L.tileLayer.chinaProvider('TianDiTu.Satellite.Annotion', {maxZoom: 20, minZoom: 3});

        var normal = L.layerGroup([normalm, normala]), image = L.layerGroup([imgm, imga]);
        /**
         * 谷歌
         */
        var normalMap = L.tileLayer.chinaProvider('Google.Normal.Map', {maxZoom: 20, minZoom: 3}), satelliteMap = L.tileLayer.chinaProvider('Google.Satellite.Map', {maxZoom: 20, minZoom: 3}),satelliteMapImg = L.tileLayer.chinaProvider('Google.Satellite.Annotion', {maxZoom: 20, minZoom: 3});
        var googleImg = L.layerGroup([satelliteMap,satelliteMapImg])
        /**
         * 高德地图
         */
        var Gaode = L.tileLayer.chinaProvider('GaoDe.Normal.Map', {maxZoom: 20, minZoom: 3}), Gaodimgem = L.tileLayer.chinaProvider('GaoDe.Satellite.Map', {maxZoom: 20, minZoom: 3}), Gaodimga = L.tileLayer.chinaProvider('GaoDe.Satellite.Annotion', {maxZoom: 20, minZoom: 3}), Gaodimage = L.layerGroup([Gaodimgem, Gaodimga]), OSM = L.tileLayer.chinaProvider('OSM.Normal.Map', {maxZoom: 20, minZoom: 3});
        // var OSMimage = L.layerGroup([Gaodimgem, Gaodimga]);

        var baseLayers = {"智图地图": normalm1, "智图多彩": normalm2, "智图午夜蓝": normalm3, "智图灰色": normalm4, "智图暖色": normalm5, "智图冷色": normalm6, "天地图": normal, "天地图影像": image, "谷歌地图": normalMap, "谷歌影像": googleImg, "高德地图": Gaode, "高德影像": Gaodimage, "OSM地图": OSM,}
        // L.tileLayer(normalMap).addTo(this.map)
        L.control.layers(baseLayers,null).addTo(this.map);
      },
      // 重置所有 气象图层
      resetMapLayer(){
        this.removeVectorLayer();
        this.removeScalarLayer();
        this.removeHeatmap();
        this.removeMaskMap();
      },
      // 清除全部气象图层
      clearAllMapLayer(){
        this.resetMapLayer();
        let {baseLayer} = this;
        baseLayer.forEach((v,i) =>{
          this.$store.commit('moduleMap/SET_BASE_LAYER_INDEX',{index:i,flag:true})
        })
      },
      // 切换工具栏
      activeTool(item,index){
        // if (item.toolType == 'labelMarker'){
        //   // this.iconMarkerFlag = true
        // }
        this.activeToolIndex = index;
        // }else{
        if (item.toolType === 'iconMarker') { // 图形
          this.currentLayerType = item.toolType;
          // this.labelMarker();
          // this.iconMarkerFlag = true
        }
        if (item.toolType === 'lineMarker') { // 线段
          this.currentLayerType = item.toolType;
          // this.labelMarker();
          // this.iconMarkerFlag = true
        }
        this.changeToolbar(item,index);
        // this.resetToolbar()
      },
      //加载热力图
      addHeatmap(data,type){
        // this.resetMapLayer();
        if(this.heatmapLayer != null){
          this.heatmapLayer.onRemove(this.map)
        }
        let heatData ={};
        let config = {...this.Global.map.heatmapConfg}, gradient ={};

        switch (type) {
          case 'pressure':
            heatData = {max: 1080, min: 990}
            config = {...config, radius:0.4}
            break;

          case 'salt':
            heatData = {max: 70, min: 0}
            config = {...config, radius:0.4}
            break;

          case 'wind':
            heatData = {max: 40, min: 0}
            config = {...config, radius:0.75,
              // gradient: {   "0.99": "rgba(255,0,0,1)", /* 颜色过渡*/ "0.75": "rgba(255,255,0,1)", "0.5": "rgba(0,255,0,1)", "0.25": "rgba(0,255,255,1)", "0": "rgba(0,0,255,1)"}
            }
            break;

          case 'wave':
            heatData = {max: 6, min: 0}
            config = {...config, radius:0.4,
              // gradient: {   "0.99": "rgba(255,0,0,1)", /* 颜色过渡*/ "0.75": "rgba(255,255,0,1)", "0.5": "rgba(0,255,0,1)", "0.25": "rgba(0,255,255,1)", "0": "rgba(0,0,255,1)"}
            }
            break;

          case 'current':
            heatData = {max: 3, min: 0.1}
            config = {...config, radius:0.4,
              // gradient: {   "0.99": "rgba(255,0,0,1)", /* 颜色过渡*/ "0.75": "rgba(255,255,0,1)", "0.5": "rgba(0,255,0,1)", "0.25": "rgba(0,255,255,1)", "0": "rgba(0,0,255,1)"}
            }
            break;

          default:
            heatData = {max: 100, min: 0}
            config = {...config}
            break;
        }

        this.heatmapLayer = new HeatmapOverlay(config).addTo(this.map)
        heatData.data =  data;
        console.log("热力图 开始.." ,type,data)
        // let {cfg } =  this.heatmapLayer
        // this.heatmapLayer.cfg = {...cfg,...config}
        // this.heatmapLayer.configure(config).setData(heatData)
        this.heatmapLayer.setData(heatData)
      },
      //移除热力图
      removeHeatmap(){
        if (this.heatmapLayer){
          // this.heatmapLayer.onRemove(this.map);
          this.heatmapLayer.setData({max:1000000,min:9999,data:[]})
        }
      },
      //加载海区风险热力图
      addAreaRiskEstimateHeatmap(data){
        console.log(data)
        this.clearAllMapLayer()
        let config = {minValue:0.01,maxValue:100}
        config['colorScale'] = [
          [0.01, [48, 217, 126]],
          [10, [48, 217, 126]],
          [20, [48, 217, 126]],
          [30, [48, 217, 126]],
          [40, [48, 217, 126]],
          [50, [255, 244, 92]],
          [60, [255, 244, 92]],
          [70, [254, 144, 44]],
          [80, [254, 144, 44]],
          [90, [254, 4, 4]],
          [100, [254, 4, 4]],
        ]
        this.addMaskMap()
        console.log('this.seaRiskScalarLayer', this.seaRiskScalarLayer)
        if (this.seaRiskScalarLayer === null) {
          this.seaRiskScalarLayer = new L.scalarLayer({
            displayValues: false,
            displayOptions: {
              velocityType: "",
              displayPosition: "",
              displayEmptyString: ""
            },
            ...config
          })
          this.seaRiskScalarLayer.onAdd(this.map)
        }
        this.seaRiskScalarLayer.setData(data.dataJson);
      },
      //移除海区风险热力图
      removeAreaRiskEstimateHeatmap(){
        if (this.areaRiskEstimatelayer !== null){
          this.areaRiskEstimatelayer.onRemove(this.map);
        }
      },
      // 加载强度图
      addScalarLayer(type,data){
        debugger
        let config = {};
        switch (type) {
          case 'pressure':
            config = {...config, minValue:99000,maxValue:105000}
            break;

          case 'salt':
            config = {...config, minValue:20,maxValue:35}
            break;

          case 'wind':
            config = {...config, minValue:0.01,maxValue:30}
            break;

          case 'wave':
            config = {...config, minValue:0.01,maxValue:9}
            break;

          case 'current':
            config = {...config, minValue:0.001,maxValue:2}
            break;

          case 'seaTemp':
            config = {...config, minValue:270,maxValue:300}
            break;

          default:
            config = {...config,minValue:-30.0,maxValue:40}
            break;
        }

      // if (this.scalarLayer){
      //   this.scalarLayer.setOptions(config)
      //   this.scalarLayer.setData(data);
      // }else{
        if(this.scalarLayer) {
          this.removeScalarLayer()
        }
        this.scalarLayer =new L.scalarLayer({
          displayValues: false,
          displayOptions: {
            velocityType: "",
            displayPosition: "",
            displayEmptyString: ""
          },
          ...config
        })
        this.scalarLayer.setData(data);
        this.scalarLayer.onAdd(this.map)
      // }
      if (type == 'pressure' || type == 'wind' || type == 'wave'){
        this.removeMaskMap()
      }else{
        this.addMaskMap()
      }

      },
      // 加载风场 洋流图层 海浪图层 矢量
      addVectorLayer(type,data){
        console.log(type, data)
        // if(!this.vectorAnimateSwitch){ // 全局 矢量动画 形状
        //   return
        // }
        // this.toggleVectorLayer(this.vectorAnimateSwitch)
        let obj ={
          colorScale:["rgb(222,255,253)", "rgb(234,234,234)","rgb(255,255,255)","rgb(156,156,156)","rgb(255,106,43)"],
          opacity:this.vectorAnimateSwitch ? 0.7 : 0
        };
        if (type == 'wind'){
          obj = {
            ...obj,
            maxVelocity: 35,
            lineWidth: 1,
            particleMultiplier:1/500,
            frameRate: 20,
          }

        }else if(type == 'wave'){
          obj = {
            ...obj,
            maxVelocity: 10,
            lineWidth: 6,
            // velocityScale:0.11,
            particleMultiplier: 1/500,
            frameRate: 30,
          };

        }else{
          obj = {
            ...obj,
            maxVelocity: 5,
            lineWidth: 1,
            velocityScale:0.1,
            particleMultiplier:1/500,
            frameRate:20,
          }
        }
        this.velocityLayer =new L.velocityLayer({
          displayValues: false,
          displayOptions: {
            velocityType: "",
            displayPosition: "",
            displayEmptyString: ""
          },
          ...obj
        })
        console.log(obj,data)

        this.velocityLayer.setData(data);
        this.velocityLayer.onAdd(this.map)
      },
      // 移除矢量图
      removeVectorLayer(){
        if (this.velocityLayer){
          this.velocityLayer.onRemove();
          this.velocityLayer = null
        }
      },
      // j显示/隐藏 矢量动画 图层
      toggleVectorLayer(flag){
        let canvas = document.querySelector('.velocity-overlay');
        if (canvas) {
          canvas.style.opacity = flag ? '1' : '0'
        }
      },
      // 移除标量图
      removeScalarLayer(){
        if (this.scalarLayer){
          this.scalarLayer.onRemove();
          this.scalarLayer = null
        }
      },

      removeSeaRiskScalarLayer() {
        if (this.seaRiskScalarLayer){
          this.seaRiskScalarLayer.onRemove();
          this.seaRiskScalarLayer = null
        }
      },

      // 显示经纬网格
      addLatlngLayer(){
        this.latlngLayer = L.latlngGraticule({
          opacity: 1,
          weight: 0.5,
          color: '#f6f6f6',
          font: '14px Verdana',
          dashArray: [5,5],
          zoomInterval: [
            {start: 0, end: 2, interval: 30},
            {start: 3, end: 3, interval: 20},
            {start: 4, end: 4, interval: 10},
            {start: 5, end: 6, interval: 5},
            {start: 7, end: 7, interval: 2},
            {start: 8, end: 8, interval: 1},
            {start: 9, end: 9, interval: 1/2},
            {start: 10, end: 10, interval: 1/5},
            {start: 11, end: 11, interval: 1/10},
            {start: 12, end: 12, interval: 1/20},
            {start: 13, end: 13, interval: 1/30},
            {start: 14, end: 15, interval: 1/60},
            {start: 16, end: 17, interval: 1/120},
            {start: 18, end: 20, interval: 1/600},
          ]
        }).addTo(this.map);
      },
      // 隐藏经纬网格
      removeLatlngLayer(){
        if (this.latlngLayer){
          this.latlngLayer.onRemove(this.map);
        }
      },

      // 显示全部警戒线
      addWarningLineLayer(){
        console.log('this.warningLineDataAll', this.warningLineDataAll)
        if(this.warningLineLayer === null) {
          this.warningLineLayer = L.layerGroup().addTo(this.map)
        }
        if(this.oilPoints.length > 0) {
          this.oilPoints.forEach((item, index) => {
            if(item.rank === 2 || item.rank === 3) {
              const circle1 = L.circle(item.location, {radius: this.warningLineDataAll.platformCordon3 * 1000, fillOpacity: 0, color: this.warningLineTypes.color3, dashArray: 8, fillColor: this.warningLineTypes.color3, fillOpacity:this.warningLineSwitch ? this.fillOpacity: 0})
              const circle2 = L.circle(item.location, {radius: this.warningLineDataAll.platformCordon2 * 1000, fillOpacity: 0, color: this.warningLineTypes.color2, dashArray: 8, fillColor: this.warningLineTypes.color2, fillOpacity:this.warningLineSwitch ? this.fillOpacity: 0})
              const circle3 = L.circle(item.location, {radius: this.warningLineDataAll.platformCordon1 * 1000, fillOpacity: 0, color: this.warningLineTypes.color1, dashArray: 8, fillColor: this.warningLineTypes.color1, fillOpacity:this.warningLineSwitch ? this.fillOpacity: 0})
              this.warningLineLayer.addLayer(circle1)
              this.warningLineLayer.addLayer(circle2)
              this.warningLineLayer.addLayer(circle3)
            }
          })
        }
      },
      // 隐藏全部警戒线
      removeAllWarningLine(){
        if(this.warningLineLayer !== null) {
          this.warningLineLayer.onRemove(this.map)
        }
      },
      toggleWarningLine(index){
        console.log(index)
        this.oilPoints[index].platformCordonOn == 1 ? this.oilPoints[index].platformCordonOn = 2 : this.oilPoints[index].platformCordonOn =1
      },
      typhoonDetailWarningLine(index, key){
        this.isShowInfluence = false
        console.log(index)
        this.routeObj[key].influenceMarker[index].platformCordonOn == 1 ? this.routeObj[key].influenceMarker[index].platformCordonOn = 2 : this.routeObj[key].influenceMarker[index].platformCordonOn =1
        console.log(this.routeObj[key].influenceMarker[index])
        this.isShowInfluence = true
      },
      getColor(value) {
        const legendList = this.Global.typhoon.legendList
        const result = legendList.filter(_ => _.name === value)[0].color
        // console.log(result)
        return result
      },
      // 台风风圈影响设施标记
      addInfluenceMarker(value) {
        this.isShowInfluence = true
        const zoom = value || this.Global.map.zoom
        this.removeInfluenceMarker()
        if (this.routeFlag && zoom >= 9) {
          let obj = this.routeObj
          for (let i in obj) {
            if (obj[i].bindName !== '') {
              let markers = []
              // this.longLatList.forEach(item => {
              //   const marker = L.marker(item,{draggable:false,title:'test',riseOnHover:true}).bindPopup(`${item.platfName}`)
              //   markers.push(marker)
              // })
              let imgStyle = 'width:24px;height:24px;',
              divStyle = 'position: absolute;z-index:-1'

              let groupLayer = L.markerClusterGroup({
                maxClusterRadius: 20,
                iconCreateFunction: function (cluster) {
                  var markers = cluster.getAllChildMarkers();
                  var n = 0;
                  for (let i = 0; i < markers.length; i++) {
                    n += 1;
                  }
                  return L.divIcon({ html:`<div style="${divStyle}"><img style="${imgStyle}" src="${chuanBoIcon}" alt=""></div><p >${n}</p>` , className: 'my-cluster', iconSize: [24,24]});
                },
                //Disable all of the defaults:
                spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false
              });
              obj[i].influenceMarker.forEach(item => {
                // console.log('==================', item)
                if (item.platfType !== 'platform') {
                  // 自定义图标
                  const myIcon = L.divIcon({
                    className: "headIcon",
                    iconAnchor: [0, 24],
                    labelAnchor: [-6, 0],
                    popupAnchor: [0, -36],
                    html: `<img style="${this.getIconCss(item.platfType, item.heading)}" src="${this.getIconLogo(item.platfType)}" />`
                  })
                  let marker = null
                  if (item.platfType === 'shipType') {
                    let shipMarker = L.marker([item.platfLatg, item.platfLong],{icon: myIcon, draggable:false,riseOnHover:true}).on('click', () => this.getShipDetail(item))
                    groupLayer.addLayer(shipMarker)
                  } else {
                    marker = L.marker([item.platfLatg, item.platfLong],{icon: myIcon, draggable:false,riseOnHover:true}).bindPopup(this.getPopup(item.platfType, item))
                  }
                  // const marker = L.marker([item.platfLatg, item.platfLong],{icon: myIcon, draggable:false,riseOnHover:true}).bindPopup(`${item.platfName}`)
                  markers.push(marker)
                  // if(item.platfType === 'platform') {
                  //   if (obj[i].warningLineLayer === null) {
                  //     obj[i].warningLineLayer = L.layerGroup().addTo(this.map)
                  //   }
                  //   const circle1 = L.circle([item.platfLatg, item.platfLong], {radius: this.warningLineDataAll.platformCordon1 * 1000, fillOpacity: 0, color: 'red', dashArray: 8})
                  //   const circle2 = L.circle([item.platfLatg, item.platfLong], {radius: this.warningLineDataAll.platformCordon2 * 1000, fillOpacity: 0, color: 'yellow', dashArray: 8})
                  //   const circle3 = L.circle([item.platfLatg, item.platfLong], {radius: this.warningLineDataAll.platformCordon3 * 1000, fillOpacity: 0, color: 'green', dashArray: 8})
                  //   obj[i].warningLineLayer.addLayer(circle1)
                  //   obj[i].warningLineLayer.addLayer(circle2)
                  //   obj[i].warningLineLayer.addLayer(circle3)
                  // }
                }
              })
              this.map.addLayer(groupLayer)
              obj[i].influenceLayer = groupLayer
              // obj[i].influenceLayer = L.layerGroup(markers).addTo(this.map)
            }
          }
          // this.$store.commit('moduleForecast/SET_TYPHOON_TOUTE_DATA', obj)
          // this.influenceLayer = L.layerGroup(markers).addTo(this.map)
        }
      },
    //  获取船舶详情
      getShipDetail (item) {
        http.get(getDetailById + `/${item.platftId}`, {}).then(res => {
          if (res.code === 0) {
            this.handleShowShipDetail(res)
          }
        })
      },
      // 获取对应的popup
      getPopup(type, item) {
        const that = this
        let content = ''
        if (type === 'platform') {
          // content = `<div><p><span>油田：${item.platfName}</span> <span>N${item.platfLatg}</span> <span>E${item.platfLong}</span> <span ><i onclick="${function g() { return that.handleWarningLineIsShow(item)}}" style="font-size: 20px;cursor: pointer;vertical-align: sub;" class="el-icon-view ${item.platformCordonOn != 1 ? 'disabled': ''}"></i></p></p></div>`
          // content = `<div><p><span>油田：${item.platfName}</span> <span>N${item.platfLatg}</span> <span>E${item.platfLong}</span> <span ><i onclick="${(e)=> handleWarningLineIsShow(item)}" style="font-size: 20px;cursor: pointer;vertical-align: sub;" class="el-icon-view ${item.platformCordonOn != 1 ? 'disabled': ''}"></i></span></p></div>`
        } else if (type === 'oilFileId') {
          content = `作业区：${item.platfName}`
        } else {
          content = item.platfName
        }
        return content
      },
      // 控制警戒圈是否显示（非组件渲染部分）
      handleWarningLineIsShow(item) {
        console.log('item', item)
      },
      // 影响设施css
      getIconCss(type, roate) {
        let cssStr = ''
        if (type === 'platform') {
          cssStr = 'width: 15px;height: 15px;position: absolute;top: -10px;left: -6px'
        } else if (type === 'oilFileId') {
          cssStr = 'width: 20px;height: 20px;position: absolute;top: -10px;left: -10px'
        } else {
          cssStr = `width: 30px;height: 30px;position: absolute;top: -8px;left: -15px;-webkit-transform: rotate(${roate}deg);-moz-transform: rotate(${roate}deg)`
        }
        return cssStr
      },
      // 影响设施logo
      getIconLogo(type) {
        let logo
        if (type === 'platform') {
          logo = oilFieldLogo
        } else if (type === 'shipType') {
          logo = shipLogo
        } else if (type === 'oilFileId') {
          logo = platformLogo
        }
        return logo
      },
      // 移除台风风圈影响设施标记
      removeInfluenceMarker() {
        let obj = this.routeObj
        for (let i in obj) {
          console.log(obj[i])
          if (obj[i].influenceLayer !== null) {
            obj[i].influenceLayer.clearLayers()
            // obj[i].influenceLayer.onRemove(this.map)
          }
          if (obj[i].warningLineLayer !== null) {
            obj[i].warningLineLayer.onRemove(this.map)
          }
        }
      },
      // 绘制路径
    drawRoute() {
      console.log('划线开始')
      const that = this
      let obj = that.routeObj
      for (let i in obj) {
        // console.log(i,'=》', obj[i].isDelete, 'status:', this.routeFlag)
        if (!obj[i].isDelete) {
          if (obj[i].bindName !== '') {
            // console.log('有名字：', obj[i])
            if (obj[i].routeLayer === null) {
              // console.log('拿到的测试数据：', JSON.stringify(obj[i].data))
              let markers = [], layerArr = [], headLogo=null, headPoint=[], points = [], count = obj[i].detailData.length + 1, timer = []
              obj[i].detailData.forEach((item, index) => {
                let time = null,marker = null, polyline = null
                if (index === 0) {
                  this.map.setView([item.latitude, item.longitude])
                }
                // 自定义台风路径点信息
                let content = "<div style='width: 220px;color: white;margin-bottom: -8px;'>" +
                "<div style='width: 236px;height: 48px;margin:-8px 0 0 -8px;padding: 5px;border: 1px solid rgb(35, 40, 74);font-size: 16px;line-height: 39px;background-color: rgb(0, 71, 157);'>" + obj[i].bindName + "</div>" +
                "<div style='width: 236px;margin-left:-8px;padding: 10px;background-color: rgba(9,7,37,1);'>" +
                "<p><span>到达时间：</span><span>" + moment(item.time).format('MM月DD日 HH时') + "</span></p>" +
                // `<p style='margin-top: 10px;'><span>强度：</span><span>${item.strong && item.strong !== null ? item.strong : '-'}</span></p>` +
                "<p style='margin-top: 10px;'><span>中心位置：</span><span>" + item.longitude + "°E " + item.latitude + "°N" + "</span></p>" +
                `<p style='margin-top: 10px;'><span>最大风速：</span><span>${item.speed && item.speed !== null ? item.speed : '-'}米/秒</span></p>` +
                `<p style='margin-top: 10px;'><span>中心气压：</span><span>${item.pressure && item.pressure !== null ? item.pressure : '-'}百帕</span></p>` +
                `<p style='margin-top: 10px;'><span>移动方向：</span><span>${item.move_dir && item.move_dir !== null ? item.move_dir : '-'}</span></p>` +
                `<p style='margin-top: 10px;'><span>移动速度：</span><span>${item.move_speed && item.move_speed !== null ? item.move_speed + '公里/小时' : '-'}</span></p>` +
                // "<br /><p style='margin-top: 10px;'><span>影响设施：</span></p>" +
                // "<p style='margin-top: 10px;'><span>作业区：</span><span>-</span></p>" +
                // "<p style='margin-top: 10px;'><span>油气平台：</span><span>-</span></p>" +
                // "<p style='margin-top: 10px;'><span>船舶：</span><span>-</span></p></div>" +
                  "</div>"
                // "<div style='position: absolute;top: 169px;right: -14px;margin-left: 110px;float: left;width: 0; height: 0;border-width: 7px;border-style: solid;border-color: transparent rgba(55,66,102,0.9) transparent transparent;transform: rotate(180deg);'></div></div>"
                // 自定义图标
                const myIconCss = `width: 12px;height: 12px;border-radius: 99px;background: ${that.getColor(item.strong)};position: absolute;top: 18px;left: -6px;`
                const myIcon = L.divIcon({
                  className: "my-custom-pin",
                  iconAnchor: [0, 24],
                  labelAnchor: [-6, 0],
                  popupAnchor: [0, -36],
                  html: `<div style="${myIconCss}"></div>`
                })
                // animation: rotate 5s linear infinite;-webkit-animation: rotate 5s linear infinite; 动效
                const headIconCss = `width: 25px;height: 25px;position: absolute;top: 11px;left: -13px;`
                const headIcon = L.divIcon({
                  className: "headIcon",
                  iconAnchor: [0, 24],
                  labelAnchor: [-6, 0],
                  popupAnchor: [0, -36],
                  html: `<img style="${headIconCss}" src="${logoWhite}" />`
                })
                if (index + 1 <= obj[i].data.length - 1 ) {
                  headPoint = obj[i].data.slice(index -1, index)
                }
                if (index === 0) {
                  headLogo = L.marker([item.latitude, item.longitude],{icon: headIcon, riseOnHover: false}).bindTooltip(content)
                  marker = L.marker([item.latitude, item.longitude],{icon: myIcon, riseOnHover: true}).on('click', () => this.handleMarkerDetail(item, i)).bindTooltip(content)
                  points.push(item)
                  markers.push(marker)
                  obj[i].routeLayer = L.layerGroup([marker, headLogo]).setZIndex(9999).addTo(that.map)
                } else {
                  timer[index] = setTimeout(() => {
                  if (headLogo !== null) {
                      obj[i].routeLayer.removeLayer(headLogo)
                  }
                      points = obj[i].data.slice(0, index+1)

                      headLogo = L.marker([item.latitude, item.longitude],{icon: headIcon, riseOnHover: false}).bindTooltip(content)
                      marker = L.marker([item.latitude, item.longitude],{icon: myIcon, riseOnHover: true}).on('click', () => this.handleMarkerDetail(item, i)).bindTooltip(content)
                      polyline = L.polyline(points, { color: '#ffffff', weight: 1 })
                      if (obj[i] && obj[i].routeLayer && obj[i].routeLayer !== null) {
                        obj[i].routeLayer = obj[i].routeLayer.addLayer(headLogo)
                        obj[i].routeLayer = obj[i].routeLayer.addLayer(polyline)
                        obj[i].routeLayer = obj[i].routeLayer.addLayer(marker)
                      }
                      points.push(item)
                      markers.push(marker)
                      layerArr.push(polyline)
                      clearTimeout(timer[index])
                      // if (index === obj[i].detailData.length - 1) {
                      //   return
                      // }
                    }, index * 66);
                  }

                })
              this.$store.commit('moduleForecast/SET_TYPHOON_TOUTE_DATA', obj)
            }
          }
        } else {
          // console.log('删除路径图层')
          if (obj[i].routeLayer !== null) {
            obj[i].routeLayer.onRemove(this.map)
          }
          if (obj[i].influenceLayer !== null) {
            obj[i].influenceLayer.onRemove(this.map)
          }
          if (obj[i].warningLineLayer !== null) {
            obj[i].warningLineLayer.onRemove(this.map)
          }
          if (obj[i].typhoonQuad !== null) {
            obj[i].typhoonQuad.onRemove(this.map)
          }
          delete obj[i]
          this.$store.commit('moduleForecast/SET_TYPHOON_TOUTE_DATA', obj)
        }
      }
        console.log('划线结束')
      },

    drawPolyLineEvent() {
      console.log('准备绘制航线')
        console.log('this.drawLine', this.drawLine)
        if (this.drawLine === null) {
          this.drawLine = new L.Draw.Polyline(this.map);
        }
        console.log('触发绘制航线事件')
        this.drawLine.enable()
        this.map.on(L.Draw.Event.CREATED, (e)=> {
          // console.log(e)
            const type = e.layerType,
                layer = e.layer;
                // console.log(layer.getLatLngs())
            if (this.drawPolyLineFlag && type === "polyline") {
              const latLngs = layer.getLatLngs()
              // console.log('获取到的点位坐标：', JSON.stringify(latLngs))
              let tempLatLng = null, distanceNum = 0, points = []
              // 此代码可支持绘制完后动画展示
              // const line = L.motion.polyline(layer.getLatLngs(), {
              //   color: "orange"
              // }, {
              //   auto: true,
              //   easing: L.Motion.Ease.swing
              // }).motionSpeed(100000).addTo(this.map);
              if (this.drawLineLayer === null) {
                this.drawLineLayer = L.polyline(latLngs, {
                  color: "blue"
                }).addTo(this.map);
              }

              latLngs.forEach(item => {
                const point = [item.lat, item.lng]
                points.push(point)
                if(tempLatLng == null){
                  tempLatLng = item;
                  return;
                }
                  distanceNum += tempLatLng.distanceTo(item);
                  tempLatLng = item;
              })
              this.lineDistance = (distanceNum / 1000).toFixed(2)
              this.latLngs = points
              // console.log('最终距离：', (distanceNum / 1000).toFixed(2))
            }
        });
        this.map.on(L.Draw.Event.DRAWSTOP, (e)=> {
          console.log('绘制结束++++++++')
          this.drawLine.disable()
        });
      },
      drawPolyLine() {
      // 测试绘制航线-开始
        this.drawLine.enable()
        // 测试绘制航线-结束
      },
      clearAirLineLayer() {
        if (this.drawLineLayer !== null) {
          this.drawLineLayer.onRemove(this.map)
          this.drawLineLayer = null
        }
      },
      // 求出方位半径方向上弧形经纬度
      getPoints(center, cradius, startAngle) {
        let radius = cradius / 100
        let pointNum = 900
        let endAngle = startAngle + 90
        let points = []
        let sin
        let cos
        let x
        let y
        let angle

        for (var i = 0; i <= pointNum; i++) {
          angle = startAngle + (90 * i / pointNum);
          sin = Math.sin((angle) * Math.PI / 180);
          cos = Math.cos((angle) * Math.PI / 180);
          x = center[0] + radius * sin;
          y = center[1] + radius * cos;
          points.push([x, y]);
        }
        return points
      },
      // 判断对象的值是否相等
      isObjectValueEqual (obj) {
        for (let i in obj) {
          for (let j in obj) {
            if(obj[i] !== obj[j]) {
              return false
            }
          }
        }
        return true
     },
      handleMarkerDetail(markerData, key) {
        const that = this
        // console.log(markerData)
        // markerData.latitude
        // markerData.longitude
        // se 东南 sw 西南 ne 东北 nw 西北
        // markerData.radius7_quad
        // markerData.radius10_quad
        // markerData.radius12_quad
        // console.log('东北',this.getPoints([markerData.latitude, markerData.longitude], markerData.radius7_quad.ne, 0))
        // console.log('西北',this.getPoints([markerData.latitude, markerData.longitude], markerData.radius7_quad.nw, 90))
        // console.log('西南',this.getPoints([markerData.latitude, markerData.longitude], markerData.radius7_quad.sw, 180))
        // console.log('东南',this.getPoints([markerData.latitude, markerData.longitude], markerData.radius7_quad.se, 270))
        if (that.routeObj[key].typhoonQuad === null) {
          that.routeObj[key].typhoonQuad = L.layerGroup().addTo(this.map)
        } else {
          that.routeObj[key].typhoonQuad.onRemove(this.map)
        }
        let circel, circel1
        if(markerData.radius7 !== 0) {
          // 如果 风圈数据里的方位的值相等就画圆，不相等就画多边形
          // if (this.isObjectValueEqual(markerData.radius7_quad)) {
          //   circel = L.circle([markerData.latitude, markerData.longitude], {radius: markerData.radius7*1000, fillColor: '#fff45c', color: '#fff45c', weight: 1})
          //   that.routeObj[key].typhoonQuad.addLayer(circel)
          // } else {
          //   let r7Ne = this.getPoints([markerData.latitude, markerData.longitude], markerData.radius7_quad.ne, 0)
          //   let r7Nw = this.getPoints([markerData.latitude, markerData.longitude], markerData.radius7_quad.nw, 90)
          //   let r7Sw = this.getPoints([markerData.latitude, markerData.longitude], markerData.radius7_quad.sw, 180)
          //   let r7Se = this.getPoints([markerData.latitude, markerData.longitude], markerData.radius7_quad.se, 270)
          //   circel1 = L.polygon([
          //     ...r7Ne, // 东北
          //     ...r7Nw, // 西北
          //     ...r7Sw, // 西南
          //     ...r7Se, // 东南
          //   ], {smoothFactor: .1,noClip: false, fillColor: '#fff45c', color: '#fff45c',weight: 1 })
            // that.routeObj[key].typhoonQuad.addLayer(circel1)

            let l = L.typhoon([markerData.latitude, markerData.longitude],markerData.radius7_quad,{color: "#fff45c", weight: 1, opacity: 1, fill: true, fillColor: "#fff45c", fillOpacity: 0.2, clickable: true})
            that.routeObj[key].typhoonQuad.addLayer(l)
          // }
        }
        if(markerData.radius10 !== 0) {
          // 如果 风圈数据里的方位的值相等就画圆，不相等就画多边形
          // if (this.isObjectValueEqual(markerData.radius10_quad)) {
          //   circel = L.circle([markerData.latitude, markerData.longitude], {radius: markerData.radius10*1000, fillColor: '#fe902c', color: '#fe902c', weight: 1})
          //   that.routeObj[key].typhoonQuad.addLayer(circel)
          // } else {
          //   let r10Ne = this.getPoints([markerData.latitude, markerData.longitude], markerData.radius10_quad.ne, 0)
          //   let r10Nw = this.getPoints([markerData.latitude, markerData.longitude], markerData.radius10_quad.nw, 90)
          //   let r10Sw = this.getPoints([markerData.latitude, markerData.longitude], markerData.radius10_quad.sw, 180)
          //   let r10Se = this.getPoints([markerData.latitude, markerData.longitude], markerData.radius10_quad.se, 270)
          //   circel1 = L.polygon([
          //     ...r10Ne, // 东北
          //     ...r10Nw, // 西北
          //     ...r10Sw, // 西南
          //     ...r10Se, // 东南
          //   ], {smoothFactor: .1,noClip: false, fillColor: '#fe902c', color: '#fe902c',weight: 1 })
            // that.routeObj[key].typhoonQuad.addLayer(circel1)

            let l = L.typhoon([markerData.latitude, markerData.longitude],markerData.radius10_quad,{color: "#fe902c", weight: 1, opacity: 1, fill: true, fillColor: "#fe902c", fillOpacity: 0.2, clickable: true})
            that.routeObj[key].typhoonQuad.addLayer(l)
          // }
        }
        if(markerData.radius12 !== 0) {
          // circel = L.circle([markerData.latitude, markerData.longitude], {radius: markerData.radius12*1000, fillColor: '#ae00d9', color: '#ae00d9'})
          // that.routeObj[key].typhoonQuad.addLayer(circel)
        }
        if(markerData.radius12 !== 0) {
          // 如果 风圈数据里的方位的值相等就画圆，不相等就画多边形
          // if (this.isObjectValueEqual(markerData.radius12_quad)) {
          //   circel = L.circle([markerData.latitude, markerData.longitude], {radius: markerData.radius12*1000, fillColor: '#ae00d9', color: '#ae00d9', weight: 1})
          //   that.routeObj[key].typhoonQuad.addLayer(circel)
          // } else {
          //   let r12Ne = this.getPoints([markerData.latitude, markerData.longitude], markerData.radius12_quad.ne, 0)
          //   let r12Nw = this.getPoints([markerData.latitude, markerData.longitude], markerData.radius12_quad.nw, 90)
          //   let r12Sw = this.getPoints([markerData.latitude, markerData.longitude], markerData.radius12_quad.sw, 180)
          //   let r12Se = this.getPoints([markerData.latitude, markerData.longitude], markerData.radius12_quad.se, 270)
          //   circel1 = L.polygon([
          //     ...r12Ne, // 东北
          //     ...r12Nw, // 西北
          //     ...r12Sw, // 西南
          //     ...r12Se, // 东南
          //   ], {smoothFactor: .1,noClip: false, fillColor: '#ae00d9', color: '#ae00d9',weight: 1 })
            // that.routeObj[key].typhoonQuad.addLayer(circel1)

            let l = L.typhoon([markerData.latitude, markerData.longitude],markerData.radius12_quad,{color: "#ae00d9", weight: 1, opacity: 1, fill: true, fillColor: "#ae00d9", fillOpacity: 0.3, clickable: true})
            that.routeObj[key].typhoonQuad.addLayer(l)
          // }
        }


        // var l = L.typhoon(markerData.latitude, markerData.longitude, ["30KTS", 50, 40, 40, 50, 2554565], this.typhoonCircle_colors[0])
        // l.setLatLng_Circle(markerData.latitude, markerData.longitude,["64KTS", 50, 40, 40, 50, 2554565])
        // that.routeObj[key].typhoonQuad.addLayer(l)
        this.riskStatisticsList.forEach((item, index) => {
          if (item.id === that.routeObj[key].bindId) {
            const index = item.eachPoint.findIndex(_ => _.time === markerData.time)
            // console.log('时间位置：', index)
            if(index > -1) {
              // console.log('拿到的点位信息：', points[index].datasList)
              let points = item.eachPoint[index].datasList, newList = []
              points.forEach(item => {
                let obj = {...item}
                obj['platformCordonOn'] = 1
                newList.push(obj)
              })
              that.routeObj[key].influenceMarker = newList
              that.$store.commit('moduleForecast/SET_TYPHOON_TOUTE_DATA', that.routeObj)
            }
          }
        })
        // const result = this.riskStatisticsList.
        // const overlay = new L.echartsLayer(this.map, echarts);
        // const chartsContainer=overlay.getEchartsContainer();
        // const myChart=overlay.initECharts(chartsContainer);
        // const option={
        //   series: [
        //       {
        //           name: '半径模式',
        //           type: 'pie',
        //           radius: [0, 110],
        //           center: ['25%', '50%'],
        //           roseType: 'area',
        //           itemStyle: {
        //               color: 'rgba(128, 128, 128, .4)',
        //               borderColor: 'rgba(128, 128, 128, 0)',
        //               borderWidth: 0
        //           },
        //           hoverAnimation: false,
        //           legendHoverLink: false,
        //           silent:true, // 去除hover高亮显示
        //           label: {
        //               show: false
        //           },
        //           emphasis: {
        //               label: {
        //                   show: false
        //               }
        //           },
        //           data: [
        //               {value: 20, name: 'ne'},
        //               {value: 35, name: 'se'},
        //               {value: 30, name: 'nw'},
        //               {value: 40, name: 'sw'}
        //           ]
        //       }
        //   ]
        // };//这里跟百度echarts的map的option一样,the option is same as echarts map
        // overlay.setOption(option);
      },
      /*   工具条   */
      // 初始化工具条图层
      initToolbarLayer(){
        this.toolbarLayer = new L.layerGroup().addTo(this.map);
        this.featureGroup = new L.featureGroup().addTo(this.map);
        this.airLineFeatureGroup = new L.featureGroup()
        this.airLineAIFeatureGroup = new L.featureGroup().addTo(this.map)
        this.editableControl = new L.EditToolbar.Edit(this.map, {featureGroup: this.airLineFeatureGroup})
        this.airLineAIEditControl = new L.EditToolbar.Edit(this.map, {featureGroup: this.airLineAIFeatureGroup})
        this.deleteLayer = new L.EditToolbar.Delete(this.map,{
          featureGroup:this.featureGroup
        });
        this.editLayer = new L.EditToolbar.Edit(this.map,{
          featureGroup:this.featureGroup
        })
        // this.map.addLayer(this.toolbarLayer);
        // this.toolbarOptions = new L.Control.Draw({
        //   draw: {polygon: true, polyline:true, marker: true, circle: true, rectangle: true, marker: true, circlemarker: true},
        //   edit: {featureGroup: this.featureGroup, remove:true}
        // });
        this.map.on(L.Draw.Event.DRAWSTOP, (e)=> {
          this.resetToolbar()
        });

        this.map.on(L.Draw.Event.EDITMOVE, (e)=> {
          console.log(e);
          // this.resetToolbar()
        });
        this.map.on(L.Draw.Event.EDITVERTEX, (e)=> {
          console.log(e);

          // this.resetToolbar()
        });
        this.map.on(L.Draw.Event.EDITRESIZE, (e)=> {
          console.log(e);
          // this.resetToolbar()
        });
        this.map.on(L.Draw.Event.MARKERCONTEXT, (e)=> {
          console.log(e);
          // this.resetToolbar()
        });
        this.map.on(L.Draw.Event.EDITSTOP, (e)=> {
          console.log(e);
          // this.resetToolbar()
        });
      },
      // 二级工具菜单
      setLabelMakerIcon(item,index,it,i){
        let type = item.toolChildType || item.toolType;
        // console.log(item.toolType)
        // console.log(item,index,it.url,i)
        this.currentLayerType =it && it.toolType ? it.toolType : type;
        this.activeToolChildIndex = i
        // console.log(item,index)
        switch (type) {
          case 'iconMarker':
            this.iconMarkerStart(type,it.url)
            // this.openIconMarker(url);
            break;
          case 'lineMarker':
            this.lineMarkerStart(type,it.url,i);
            break;
          case 'shapeMarker':
            this.shapeMarkerStart(it.toolType);
            break;
          case 'deleteLayer':
            this.openClearAllMarker();
            break;

          default:
            return false
            break;
        }
      },
        isMobileClose () {
          this.confirmClear = false
        },
        isMobileCom () {
            this.confirmClear = false
            this.clearAllMarker();
        },
      // 清除所有 标记 dialog
      openClearAllMarker(){
          if (this.isMobile) {
              this.confirmClear = true
          } else {
              this.$confirm('是否清除地图上所有标记内容?', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                  center: true
              }).then(() => {
                  this.clearAllMarker();
              })
          }
      },
      // 开打图标标记 样式
      openIconMarker(){
        this.iconMarkerFlag = true
      },
      // 关闭图标标记 样式
      closeIconMarker(){
        this.iconMarkerFlag = false;
        this.iconMakerOption = {icon:'', fontSize:'14px', content:'',color:'#FF0000'};
      },
      // 取消图标标记 样式
      cancelIconMarker(){
        this.cancelCurrentMarker();
        this.closeIconMarker();
      },
      openLineMarker(){
        this.lineMarkerFlag = true
      },
      closeLineMarker(){
        this.lineMarkerFlag = false
        this.lineMakerOption = {lineType:{value:'0',label:'实线'}, arrowType:'无',fontSize:'14px', content:'',color:'#FF0000',}
      },
      cancelLineMarker(){
        this.cancelCurrentMarker();
        this.closeLineMarker();
      },
      openShapeMarker(){
        this.shapeMarkerFlag = true
      },
      closeShapeMarker(){
        this.shapeMarkerFlag = false
        this.shapeMarkerOption ={icon:'', fontSize:'14px', content:'',color:'#FF0000',fillColor:'#00a0e9'}
      },
      cancelShapeMarker(){
        this.cancelCurrentMarker();
        this.closeShapeMarker();
      },
      // 图形标记 包含圆 矩形 多边形
      shapeMarkerStart(type){
        console.log("图形标记")
        switch (type) {
          case 'circleMarker':
            this.drawShapeMaker('circle',type)
            break;
          case 'rectangleMarker':
            this.drawShapeMaker('rectangle',type)
            break;
          case 'polygonMarker':
            this.drawShapeMaker('polygon',type)
            break;
          default:
            break;
        }
      },
      // 图形 标记 公用方法
      drawShapeMaker(drawType,type){
        let shapeMarker = null;
        if (drawType == 'circle'){
          shapeMarker = new L.Draw.Circle(this.map);
        }else if (drawType == 'rectangle'){
          shapeMarker = new L.Draw.Rectangle(this.map);
        }else if (drawType == 'polygon'){
          shapeMarker = new L.Draw.Polygon(this.map);
        }else{
          return
        }
        shapeMarker.enable();
        let layerId = null,tempLayer = {}
        this.map.on(L.Draw.Event.CREATED, (e) => {
          if (e.layerType == drawType && this.currentLayerType == type) {
            tempLayer = e.layer;
            e.layer.markerType = type
            this.featureGroup.addLayer(e.layer);
            layerId = this.featureGroup.getLayerId(e.layer);
            this.currentDrawLayerId = layerId
            // console.log(this.currentDrawLayerId)
            setTimeout(() => {
              this.openShapeMarker()
            }, 100)
          }
        });
        this.map.on(L.Draw.Event.DRAWSTOP, (e)=> {
          shapeMarker.disable()
          // polygon = null
        });
      },
      // 获取多边形 中心点
      getPolygonCenter(pList) {
        var area = 0;
        var x = 0;
        var y = 0;
        for (var i = 1; i <= pList.length; i++) {
          var lat = pList[i % pList.length].lat;
          var lng = pList[i % pList.length].lng;
          var nextLat = pList[i - 1].lat;
          var nextLng = pList[i - 1].lng;
          var temp = (lat * nextLng - lng * nextLat) / 2;
          area += temp;
          x += (temp * (lat + nextLat)) / 3;
          y += (temp * (lng + nextLng)) / 3;
        }
        x = x / area;
        y = y / area;
        return [x, y];
      },
      // 图形 标记结束
      shapeMarkerEnd(){
        let {shapeMarkerOption,currentDrawLayerId,currentLayerType} = this;
        let layer = this.featureGroup.getLayer(currentDrawLayerId),
            style = {
              fillColor:shapeMarkerOption.fillColor,
            }
        layer.setStyle(style)
        // layer.bindTooltip(shapeMarkerOption.content,{direction:'auto',permanent:true})
        let center = []
        if (layer.markerType == 'circleMarker'){
          center = layer.getLatLng()
        }else{
          center  = this.getPolygonCenter(layer._latlngs[0])
          layer.on('click',(e)=>{
            console.log(this.getPolygonCenter(layer._latlngs[0]))
          })
        }
        let textClass = `color:${shapeMarkerOption.color};font-size:${shapeMarkerOption.fontSize};width:100px;height:20px;text-align:center;word-wrap:break-word`;
        let textIcon = L.divIcon({iconSize:[100,20],iconAnchor: [50, 10],className:'text-icon',html:`<p style="${textClass}">${shapeMarkerOption.content}</p>` })
        let marker = L.marker(center,{icon:textIcon});
        let lg = L.featureGroup([layer,marker])
        // lg.on('mouseover',(e)=>{
        //   console.log(e)
        // })
        // lg.on('mouseout',(e)=>{
        //   console.log(e)
        // })
        lg.markerType = currentLayerType
        this.featureGroup.removeLayer(currentDrawLayerId)
        lg.on('contextmenu',(e) =>{
          this.openContextmenu(e)
        })
        this.featureGroup.addLayer(lg)
        this.closeShapeMarker()
      },
      // 开始绘制线段
      lineMarkerStart(type,url,i){
        console.log("线段标记")
        this.lineMakerOption.lineType = this.lineTypes[i]
        let line = new L.Draw.Polyline(this.map);
        line.enable();
        let layerId = null,tempLayer = {}
        this.map.on(L.Draw.Event.CREATED, (e) => {
          if (e.layerType == 'polyline' && this.currentLayerType == type){
            tempLayer = e.layer;
            e.layer.markerType = type
            this.featureGroup.addLayer(e.layer);
            layerId = this.featureGroup.getLayerId(e.layer);
            this.currentDrawLayerId = layerId
            // console.log(this.currentDrawLayerId)
            setTimeout(()=>{
              this.openLineMarker()
            },100)
          }
        });
        this.map.on(L.Draw.Event.DRAWSTOP, (e)=> {
          line.disable()
          // line = null
          });
      },
      lineMarkerEnd(){
        console.log("线段标记 样式")
        let {currentDrawLayerId,currentLayerType} = this;
        let {lineType,arrowType,fontSize,content,color,} = this.lineMakerOption,
            layer = this.featureGroup.getLayer(currentDrawLayerId),
            latlngs = layer._latlngs,len = layer._latlngs.length;
        // 箭头 初始化 角度 ->始发 -> 拼接
        let startDegree = this.degreeByTwoLatlng(latlngs[1], latlngs[0]) + 'deg',
            endDegree = this.degreeByTwoLatlng(latlngs[len-2], latlngs[len-1]) + 'deg',
            startArrowClass = `transform: rotate(${startDegree});width:20px;height:20px;`,
            endArrowClass = `transform: rotate(${endDegree});width:20px;height:20px;`,
            startArrowIcon = L.divIcon({iconSize:[20,20],className:'arrow-icon',html:`<img style="${startArrowClass}"  src="${arrowRed}"/>` }),
            endArrowIcon = L.divIcon({iconSize:[20,20],className:'arrow-icon',html:`<img style="${endArrowClass}"  src="${arrowRed}"/>` })
        //
        let startArrow = L.marker([latlngs[0].lat,latlngs[0].lng],{icon:startArrowIcon}),
            endArrow = L.marker([latlngs[len-1].lat,latlngs[len-1].lng],{icon:endArrowIcon});
        // 箭头绑定 线段 layerid  传输 和 删除用
        startArrow.lineMarkerId = currentDrawLayerId
        endArrow.lineMarkerId = currentDrawLayerId

        let customStyle = {
          color:color,
          dashArray:lineType.value,
        }
        // 重置样式
        layer.setStyle(customStyle)
        // 组合 线 + 箭头
        let group = []
        if (arrowType == 2){
          group = [layer,endArrow,startArrow]
        }else if (arrowType == 1){
          group = [layer,endArrow]
        }else{
          group = [layer]
        }

        let lineLayer = L.featureGroup(group)
        lineLayer.markerType = currentLayerType
        this.featureGroup.removeLayer(currentDrawLayerId)
        lineLayer.on('contextmenu',(e) =>{
          this.openContextmenu(e)
        })
        this.featureGroup.addLayer(lineLayer)

        this.closeLineMarker()
      },
      // 两个经纬度间 角度
      degreeByTwoLatlng(start,end){
        let s = this.map.latLngToLayerPoint(start),
            e = this.map.latLngToLayerPoint(end)
        let x = e.x -s.x,y = e.y - s.y;
        let degree = 360 * Math.atan2(y,x) / (Math.PI * 2) + 90;
        console.log('====> 角度',degree)
        return degree
      },
      // 开始绘制图标标记
      iconMarkerStart(type,url){
        console.log("图标标记2")
        this.iconMakerOption.icon = url
        let text = new L.Draw.Marker(this.map);
        text.enable();
        let layerId = null,tempLayer = {}
        this.map.on(L.Draw.Event.CREATED, (e) => {
          if (e.layerType == 'marker' && this.currentLayerType == type){
            tempLayer = e.layer;
            e.layer.markerType = type
            this.featureGroup.addLayer(e.layer);
            layerId = this.featureGroup.getLayerId(e.layer);
            this.currentDrawLayerId = layerId
            // console.log(this.currentDrawLayerId)
            setTimeout(()=>{
              this.openIconMarker()
            },100)
          }
        });
        this.map.on(L.Draw.Event.DRAWSTOP, (e)=> {
          text.disable()
          // text = null;
        });
      },
      // 图标标记 结束
      iconMarkerEnd(){
        console.log("图标标记 样式")
        let {currentDrawLayerId} = this;
        let {icon,fontSize,content,color} = this.iconMakerOption;
        let textClass = `color:${color};font-size:${fontSize};width:100px;height:20px;text-align:center;word-wrap:break-word`,
            imgClass = `width:40px;height:40px;`,
            iconMakerClass = `width:100px;height:60px;text-align:center;`
        let customIcon= L.divIcon({
          // iconUrl:icon,
          iconSize: [100, 60],
          iconAnchor: [50, 30],
          className:'icon-marker',
          html: `<div style="${iconMakerClass}"><img style="${imgClass}" src="${icon}" alt="" /><p  style="${textClass}">${content}</p></div>`
        })
        let layer = this.featureGroup.getLayer(currentDrawLayerId)
        layer.setIcon(customIcon)
        layer.on('contextmenu',(e) =>{
          this.openContextmenu(e)
        })
        this.closeIconMarker();
      },
      // 选择对应工具
      changeToolbar(item,index){
        let type = item.toolType;
        this.currentLayerType = type;
        switch (type) {
          case 'measurePolyline':
            this.measurePolyLineDistance(type);
            break;
          case 'measurePolygon':
            this.measurePolygonArea(type);
            break;
          case 'getLocation':
            this.getLocationDialog();
            break;
          case 'textMarker':
            this.openTextMarkerDialog(type);
            break;
          case 'captureScreen':
            this.captureScreenStart(type);
            break;
          case 'clearAll':
            this.clearAllMarker();
            break;
          case 'airLine':
            this.drawPolyLineEvent();
            break;
          case 'editLayer':
            this.toggleEditLayer(index,type);
            break;
          case 'deleteLayer':
            this.toggleDeleteLayer(index,type);
            break;
          case 'deleteLayer1':
            this.openClearAllMarker() // 移动端清除
            break;

          default:
            return false
            break;
        }
      },
      toggleEditLayer(index,type){
        if(type == this.currentLayerType){
          if(this.editLayerFlag){
            this.mapToolBar[index].name = '编辑'
            this.resetToolbar();
            this.editLayer.disable();
            this.editLayer.save();
          }else{
            this.mapToolBar[index].name = '保存'
            this.editLayer.enable();
          }
          this.editLayerFlag = !this.editLayerFlag;
          console.log(this.featureGroup.getLayers())
        }
      },
      toggleDeleteLayer(index,type){
        if(type == this.currentLayerType) {
          if (this.deleteLayerFlag) {
            this.mapToolBar[index].name = '删除'
            this.resetToolbar();
            this.cancelEveryLayersCanDel();
            this.deleteLayer.disable();
            this.deleteLayer.save();
          } else {
            this.mapToolBar[index].name = '保存'
            this.deleteLayer.enable();
            this.everyLayersCanDel();
          }
          this.deleteLayerFlag = !this.deleteLayerFlag;
          console.log(this.featureGroup.getLayers())
        }
      },
      // 图层所有标记可以被点后删除 事件绑定
      everyLayersCanDel(){
        let arr = this.featureGroup.getLayers()
        arr.forEach((layer,index) =>{
          layer.on('click', (e) => {
            console.log(e.target)
            this.featureGroup.removeLayer(e.target._leaflet_id)
          });
        })
      },
      // 图层所有标记可以被点后删除 事件清除
      cancelEveryLayersCanDel(){
        let arr = this.featureGroup.getLayers()
        arr.forEach((layer,index) =>{
          layer.off('click', (e) => {
            // console.log(e.target)
            // this.featureGroup.removeLayer(e.target._leaflet_id)
          });
        })
      },
      // 定位
      getLocationDialog(){
        this.LocationDialogShow = true
      },
      // 关闭定位
      closeGetLocation(){
        this.LocationDialogShow = false
        this.resetToolbar()
        this.location = {
          lat:'',
          lng:'',
          latDMS:['','',''],
          lngDMS:['','','']
        }
      },
      // 判断是否发生数值改变
      handleValueChange(type) {
        if (type === '1') {
          this.latLngChangeFlag = true
        } else {
          this.duChangeFlag = true
        }
      },
      // 定位
      getLocationByLatlng(){
        let {location} = this;
        if (!this.latlngTypeFlag && this.duChangeFlag){
          this.location.lat = DMSChangetoLatlng(location.latDMS).toFixed(6)
          this.location.lng = DMSChangetoLatlng(location.lngDMS).toFixed(6)
        }
        let lat = this.location.lat ? this.location.lat : 36
        let lng = this.location.lng ? this.location.lng : 123
        let marker = L.marker([lat,lng]).addTo(this.map)
        this.map.setView([lat,lng])
        setTimeout(()=>{
          marker.onRemove(this.map)
        },3000)
        this.closeGetLocation()
      },
      // 切换经纬度显示
      toggleLatlngType(){
        let {location} = this;
        if(this.latlngTypeFlag && this.latLngChangeFlag){
          this.location.lngDMS = latlngChangeToDMS(location.lng)
          this.location.latDMS = latlngChangeToDMS(location.lat)
          this.latLngChangeFlag = false
        }else if (!this.latlngTypeFlag && this.duChangeFlag){
          this.location.lat = DMSChangetoLatlng(location.latDMS).toFixed(6)
          this.location.lng = DMSChangetoLatlng(location.lngDMS).toFixed(6)
          this.duChangeFlag = false
        }
        this.latlngTypeFlag = !this.latlngTypeFlag

      },
      // 开启文字标记
      openTextMarkerDialog(){
        this.textMarkerFlag = true;
      },
      // 关闭文字标记
      closeTextMarkerDialog(){
        this.textMarkerFlag = false;
        this.activeToolIndex = null;
        this.textMarkerOption = {
          color:'#FF0000',
          fontSize:'14px',
          content:''
        };
      },
      // 文字marker
      textMarker(type){
        console.log("文字标记")
        let text = new L.Draw.Marker(this.map);
        let tempObj = {...this.textMarkerOption};
        let {color,fontSize,content} = tempObj;
        console.log('====>',tempObj)
        text.enable();
        let marker = null;
        this.closeTextMarkerDialog();
        this.map.on(L.Draw.Event.CREATED, (e) => {
        if (this.currentLayerType == 'textMarker' && e.layerType == 'marker'){
          let textClass = `color:${color};font-size:${fontSize};width:100px;height:20px;text-align:center;word-wrap:break-word`;
          let icon= L.divIcon({
            iconSize: [100, 20],
            iconAnchor: [50, 10],
            className:'text-marker',
            html: `<p  style="${textClass}">${content}</p>`
          })
          e.layer.markerType = 'textMarker'
          e.layer.on('contextmenu',(e) =>{
            this.openContextmenu(e)
          })
          e.layer.setIcon(icon)
          this.featureGroup.addLayer(e.layer);
          console.log(marker)
        }
        });
        this.map.on(L.Draw.Event.DRAWSTOP, (e)=> {
          console.log('文字标记结束=====')
          text.disable()
          // text = null;
        });

      },
      // 全地图截图
      captureScreen(){
        html2canvas(document.getElementById('map'),{
            useCORS:true, // 底图跨域 必须！！
            // allowTaint:false
            }).then(function(canvas) {
          let link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");//下载链接
          link.setAttribute("download", new Date().toLocaleString() + "_截图.png");
          link.style.display = "none";//a标签隐藏
          document.body.appendChild(link);
          link.click();
        });
        this.resetToolbar();
      },
      // 框选截图
      captureScreenStart(type){
        console.log("框选截图")
        this.$message({
          type:'warning',
          center:true,
          offset:100,
          message:'框选范围进行截图，按“ESC”可取消截图'
        })
        let rectangle = new L.Draw.Rectangle(this.map,{shapeOptions: {stroke: true, color: 'red', weight: 2, opacity: 0.9, fill: true, fillColor: null, /*same as color by default*/ fillOpacity: 0.1, clickable: true}});
        rectangle.enable();
        this.map.on(L.Draw.Event.CREATED, (e) => {
          if (this.currentLayerType == type && e.layerType == 'rectangle'){
            this.featureGroup.addLayer(e.layer);
            if (!e.layer.flag){
              this.$confirm('是否下载本次截图', '提示', {
                confirmButtonText: '下载',
                cancelButtonText: '取消',
                type: 'warning',
                showClose:false,
                center: true
              }).then(() => {
                let latlngs = e.layer._latlngs[0]
                // console.log(latlngs)
                this.featureGroup.removeLayer(e.layer);
                this.captureScreenEnd(latlngs);
                this.$message({
                  type: 'success',
                  message: '下载成功!',
                  offset:100
                });
              }).catch(() => {
                this.featureGroup.removeLayer(e.layer);
              });
            }
            e.layer.flag = true
          }
        });
        this.map.on(L.Draw.Event.DRAWSTOP, (e)=> {
          console.log('框选截图结束====')
          rectangle.disable()
        });
      },
      // 载图完成 准备下进行图片下载
      captureScreenEnd(points){
        let bounds = this.map.getBounds(),
            zero = [bounds._northEast.lat,bounds._southWest.lng],
            zeroPoint = map.latLngToLayerPoint(zero)   // 计算当前 视窗内的 原点经纬度 ==> 对应的屏幕坐标 （地图位移及缩放时计算 startPoint的偏移量）
        let startPoint = map.latLngToLayerPoint(points[1]), // latlng 转 屏幕坐标 计算 起点及宽高
            endPoint =  map.latLngToLayerPoint(points[3]),
            width = Math.abs(startPoint.x - endPoint.x),
            height = Math.abs(startPoint.y - endPoint.y);

        html2canvas(document.getElementById('map'),{
          useCORS:true, // 底图跨域 必须！！
          // allowTaint:false
        }).then((canvas) => {
          this.downloadIamge(canvas,(startPoint.x - zeroPoint.x),(startPoint.y - zeroPoint.y),width,height)
          this.resetToolbar()
        });
      },
      // 下载图片
      downloadIamge(canvas, capture_x, capture_y, capture_width, capture_height) {
        // 创建一个用于截取的canvas
        var clipCanvas = document.createElement('canvas')
        clipCanvas.width = capture_width
        clipCanvas.height = capture_height
        // 截取图片
        clipCanvas.getContext('2d').drawImage(canvas, capture_x, capture_y, capture_width, capture_height, 0, 0, capture_width, capture_height)
        var clipImgBase64 = clipCanvas.toDataURL() // 生成图片url

        // 下载图片
        let link = document.createElement("a");
        link.href = clipImgBase64;//下载链接
        link.setAttribute("download", new Date().toLocaleString() + "_截图.png");
        link.style.display = "none";//a标签隐藏
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link)
      },

      // 取消 并 清除正在标记内容
      cancelCurrentMarker(){
        if (this.currentDrawLayerId){
          this.featureGroup.removeLayer(this.currentDrawLayerId)
          this.currentDrawLayerId = null
        }
      },
      // 重置地图工具条
      resetToolbar(){
        if(this.editLayerFlag){
          let {mapToolBar} = this
          for (let i = 0; i <mapToolBar.length ; i++) {
            if (mapToolBar[i].toolType == 'editLayer'){
              this.mapToolBar[i].name = '编辑'
              break;
              }
            }
          this.editLayer.disable();
          this.editLayer.save();
        }
        if(this.deleteLayerFlag){
          let {mapToolBar} = this
          for (let i = 0; i <mapToolBar.length ; i++) {
            if (mapToolBar[i].toolType == 'deleteLayer'){
              this.mapToolBar[i].name = '删除'
              break;
            }
          }
          this.deleteLayer.disable();
          this.deleteLayer.save();
        }
        this.currentLayerType = null // 清除当前 绘制类型
        this.contextmenuTarget = null // 清除当前 右键选中元素
        this.activeToolIndex = null
        this.activeToolChildIndex = null
        this.labelMarkerFlag = null
        this.textMarkerFlag = null
        this.iconMarkerFlag = false
        this.shapeMarkerFlag = false
        this.lineMarkerFlag = false
      },
      // 测距
      measurePolyLineDistance(type){
        console.log("开始测距")
        let line = new L.Draw.Polyline(this.map);
        line.enable();
        this.map.on(L.Draw.Event.CREATED, (e) => {
          let tempLayer = {},distance = 0
          if (e.layerType == 'polyline' && this.currentLayerType == type){
            // tempLayer = e.layer
            let latlngs = e.layer._latlngs,
                tempLatLng = null;
            latlngs.forEach(item => {
              if(tempLatLng == null){
                tempLatLng = item;
                return;
              }
              distance += tempLatLng.distanceTo(item);
              tempLatLng = item;
            })
            let pop = (distance / 1000).toFixed(2) + ' KM';
            e.layer.markerType = type;
            console.log("====>距离",pop);
            if (!e.layer.tipsFlag){
              e.layer.on('contextmenu',(e) =>{
                this.openContextmenu(e)
              })
              this.featureGroup.addLayer(e.layer.bindTooltip(pop,{direction:'auto',permanent:true}));
            }
            e.layer.tipsFlag = true;
          }
        });
        // L.marker([36.7772, 125.2606],{draggable:true}).bindLabel('Look revealing label!',{ noHide: true }).addTo(this.map).showLabel();
        this.map.on(L.Draw.Event.DRAWSTOP, (e)=> {
          console.log('测距结束=====')
          line.disable()
        });
      },
      // 测面积
      measurePolygonArea(type){
        console.log("开始测面积")
        let polygon = new L.Draw.Polygon(this.map);
        polygon.enable();
        this.map.on(L.Draw.Event.CREATED, (e) => {
          let tempLayer = {},tempLatLngs = [];
          if(e.layerType == 'polygon' && this.currentLayerType == type){
            tempLayer = e.layer
            let latlngs = tempLayer._latlngs;
            latlngs[0].forEach((v,i)=>{
              let {lat,lng} = v,
                  arr = [lng,lat];
              tempLatLngs.push(arr);
            })
            tempLatLngs.push([latlngs[0][0].lng,latlngs[0][0].lat])
            // console.log('=======> 多边形',tempLatLngs);
            let p = turf.polygon([tempLatLngs]);
            let area = (turf.area(p) / 1000000).toFixed(2) + ` KM<sup>2</sup>`;
            console.log("====>面积",area);
            e.layer.markerType = type
            if (!e.layer.tipsFlag){
              e.layer.on('contextmenu',(e) =>{
                this.openContextmenu(e)
              })
              this.featureGroup.addLayer(e.layer.bindTooltip(area,{direction:'auto',permanent:true}));
            }
            e.layer.tipsFlag = true;
          }
        })
        this.map.on(L.Draw.Event.DRAWSTOP, (e)=> {
          console.log('面积结束=====')
          polygon.disable()
        });
      },
      // 显示油气田点位
      showOilFieldPoint() {
        console.log('拿到的oilPoints；', this.oilPoints)
        if (this.oilFieldPointLayer !== null) {
          this.oilFieldPointLayer.onRemove(this.map)
        }
        if(this.warningLineLayer === null) {
          this.warningLineLayer = L.layerGroup().addTo(this.map)
        }
        const myIconCss = 'width: 20px;height: 20px;position: absolute;top: 13px;left: -10px'
        let imgStyle = 'width:24px;height:24px;',
        divStyle = 'position: absolute;z-index:-1'

        let groupLayer = L.markerClusterGroup({
          maxClusterRadius: 1,
          iconCreateFunction: function (cluster) {
            var markers = cluster.getAllChildMarkers();
            var n = 0;
            for (let i = 0; i < markers.length; i++) {
              n += 1;
            }
            return L.divIcon({ html:`<div style="${divStyle}"><img style="${imgStyle}" src="${chuanBoIcon}" alt=""></div><p >${n}</p>` , className: 'my-cluster', iconSize: [24,24]});
          },
          //Disable all of the defaults:
          spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false
        });
        if(this.oilPoints.length > 0) {
          this.oilFieldPointLayer = L.layerGroup().addTo(this.map)
          this.oilPoints.forEach((item, index) => {
            if (item.rank === 2 || item.rank === 3) {
              const myIcon = L.divIcon({
                className: "headIcon",
                iconAnchor: [0, 24],
                labelAnchor: [-6, 0],
                popupAnchor: [0, -10], // item.rank === 2 ? oilFieldLogo : platformLogo
                html: `<img style="${myIconCss}" src="${item.rank === 2 ? platformLogo : oilFieldLogo}" />`
              })
              const marker = L.marker(item.location, {icon: myIcon, riseOnHover: true}).bindPopup(item.name)
              groupLayer.addLayer(marker);
            }
            // if (this.warningLineFlag && (item.rank === 2 || item.rank === 3)) {
            //   const circle1 = L.circle(item.location, {radius: this.warningLineDataAll.platformCordon3 * 1000, fillOpacity: 0, color: this.warningLineTypes.color3, dashArray: 8, fillColor: this.warningLineTypes.color3, fillOpacity:this.warningLineSwitch ? this.fillOpacity: 0})
            //   const circle2 = L.circle(item.location, {radius: this.warningLineDataAll.platformCordon2 * 1000, fillOpacity: 0, color: this.warningLineTypes.color2, dashArray: 8, fillColor: this.warningLineTypes.color2, fillOpacity:this.warningLineSwitch ? this.fillOpacity: 0})
            //   const circle3 = L.circle(item.location, {radius: this.warningLineDataAll.platformCordon1 * 1000, fillOpacity: 0, color: this.warningLineTypes.color1, dashArray: 8, fillColor: this.warningLineTypes.color1, fillOpacity:this.warningLineSwitch ? this.fillOpacity: 0})
            //   this.warningLineLayer.addLayer(circle1)
            //   this.warningLineLayer.addLayer(circle2)
            //   this.warningLineLayer.addLayer(circle3)
            // }
          })
          this.oilFieldPointLayer = groupLayer
          this.map.addLayer(groupLayer)
        } else {
          this.removeAllWarningLine()
        }
      },
      // 显示船舶点位
      showShip(list, type) {
        console.log('拿到的shipList:', this.shipList)
        if (type === 'selected' && this.shipLayer !== null) {
          this.shipLayer.onRemove(this.map)
        } else if (type === 'base' && this.shipDeviceLayer !== null) {
          this.shipDeviceLayer.onRemove(this.map)
        }
        if(list.length > 0) {
          let imgStyle = 'width:24px;height:24px;',
          divStyle = 'position: absolute;z-index:-1'

          let groupLayer = L.markerClusterGroup({
            maxClusterRadius: 20,
            iconCreateFunction: function (cluster) {
              var markers = cluster.getAllChildMarkers();
              var n = 0;
              for (let i = 0; i < markers.length; i++) {
                n += 1;
              }
              return L.divIcon({ html:`<div style="${divStyle}"><img style="${imgStyle}" src="${chuanBoIcon}" alt=""></div><p >${n}</p>` , className: 'my-cluster', iconSize: [24,24]});
            },
            //Disable all of the defaults:
            spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false
          });
          list.forEach((item, index) => {
            let obj = type === 'selected' ? item.data : item
            const myIconCss = `width: 30px;height: 30px;position: absolute;top: 14px;left: -9px;-webkit-transform: rotate(${obj.heading}deg);-moz-transform: rotate(${obj.heading}deg)`
            const myIcon = L.divIcon({
              className: "headIcon",
              iconAnchor: [0, 24],
              labelAnchor: [-6, 0],
              popupAnchor: [0, -36],
              html: `<img style="${myIconCss}" src="${shipLogo}" />`
            })
            // const content = `${obj.name}`
            const marker = L.marker([obj.latitude, obj.longitude], {icon: myIcon, riseOnHover: true}).on('click', () => this.handleShowShipDetail(type === 'selected' ? item : {data: item}))

            groupLayer.addLayer(marker);
          })
          if (type === 'selected') {
            this.shipLayer = groupLayer
          } else {
            this.shipDeviceLayer = groupLayer
          }
          this.map.addLayer(groupLayer)
        }
      },
      removeShipDeviceLayer() {
        if (this.shipDeviceLayer !== null) {
          this.shipDeviceLayer.clearLayers()
        }
      },
      handleShowShipDetail(item) {
        console.log('船舶信息', item)
        if (this.isMobile) {
          this.$refs.shipDetail.showAction(item.data)
        } else {
          this.$refs.shipDetail.showModal(item.data)
        }
      },
      // 清除图层上所有标记内容
      clearAllMarker(){
        this.resetToolbar();
        this.featureGroup.eachLayer((layer) =>{
          // layer.closeTooltip();
          // layer.unbindTooltip();
          // console.log(layer)
          // layer.on('click', (e) => {
          //   console.log(e.target)
          //   this.featureGroup.removeLayer(e.target._leaflet_id)
          // });
          this.featureGroup.removeLayer(layer)
        });
        this.deleteLayer.removeAllLayers();
        let tips = document.querySelector('.leaflet-tooltip-pane') // 清除所有 tips
        tips.innerHTML = ''
        this.featureGroup.clearLayers();
        // this.airLineEstimateLayer.onRemove(this.map)
        let list = window.zTreeObj.getNodes()
        // 取消选中的油气田平台
        this.oilPoints.forEach(item => {
          this.getUpdateTreeNode(list, item.id, item.data.pid)
          let treeNode = item.data
          treeNode.checked = false
          this.$store.commit('moduleForecast/SET_OILfIELD_POINTS', {...treeNode})
        })
        this.clearAllTyphoonLayers()
        this.$store.commit('moduleMap/SET_LOADING_EVENTS_FLAG_FALSE')
      },
      //  zTree重置
      getUpdateTreeNode(list, id, pid) {
        list.forEach((item, index) => {
          // console.log('list[index]', list[index])
           if (item.id === pid) {
              window.zTreeObj.checkNode(item, false)
            }
          if (item.id === id) {
            // console.log('找到了', item)
            window.zTreeObj.checkNode(item, false)
            return false
          } else if (item.children && item.children.length > 0) {
            this.getUpdateTreeNode(item.children, id)
          }
        })
      },
      // 清除台风相关的所有图层
      clearAllTyphoonLayers() {
        let obj = this.routeObj
        for (let i in obj) {
          if (obj[i].routeLayer !== null) {
            obj[i].routeLayer.onRemove(this.map)
          }
          if (obj[i].influenceLayer !== null) {
            obj[i].influenceLayer.onRemove(this.map)
          }
          if (obj[i].typhoonQuad !== null) {
            obj[i].typhoonQuad.onRemove(this.map)
          }
        }
        if (this.shipLayer !== null) {
          this.shipLayer.onRemove(this.map)
        }
        if (this.oilFieldPointLayer !== null) {
          this.oilFieldPointLayer.onRemove(this.map)
        }
      },
      toolTest(){
        console.log('clearAll',this.featureGroup.getLayers())
        this.saveMapEventsToJson();
        let arr = this.featureGroup.getLayers()
        arr.forEach((layer,index) =>{
          // layer.setTooltipContent('ajsdfas')
          // layer.setStyle({dashArray:'10',dashOffset:'1',weight:5,fillColor:'red',fillOpacity:0.5,color:'yellow'})
          // layer.unbindTooltip();
          // if(layer._layers){
          //   for (let key in layer._layers ){
          //     if  (layer._layers[key].markerType){
          //       console.log(layer._layers[key].markerType)
          //       break;
          //     }
          //   }
          // }else{
          //   console.log(layer.markerType)
          // }

          layer.on('click', (e) => {
            console.log(e.target)
            this.featureGroup.removeLayer(e.target._leaflet_id)
          });
        })
      },
      toolbarDel(){
        // this.clearAllMapLayer();
        // this.addMapEventsToMap();
        var ll = [36,120];
       var m =  L.marker(ll, {

        }).on('contextmenu',(e)=>{
          this.openContextmenu(e)
       })
        this.featureGroup.addLayer(m);
      },
      // 打开右键菜单
      openContextmenu(e){
        this.contextmenuTarget = e;
        this.contextmenuTips.flag  = true;
        let t = e.originalEvent.clientY;
        let l = e.originalEvent.clientX;
        this.contextmenuTips.style = `left:${l}px;top:${t}px`;
      },
      // 右键菜单删除
      contextmenuDel(){
        let {contextmenuTarget} = this;
        if (contextmenuTarget){
          let id = contextmenuTarget.target._leaflet_id
          this.featureGroup.removeLayer(id)
        }
        this.closeContextmenu()
      },
      // 关闭右键菜单
      closeContextmenu(){
        this.contextmenuTips = {
          style :'',
          flag: false,
        }
        this.contextmenuTarget = null;
      },
      // 编辑航线
      openEdit() {
        const that = this
        console.log('this.airLineFeatureGroup', this.airLineFeatureGroup)
        this.airLineEstimateLayer.setStyle({opacity: 0.2})
        const arr = this.airLineEstimateLayer.getLayers()
        arr.forEach((layer, index) =>{
          if (layer._latlng) {
            layer.setOpacity(0.2)
          }
        });
        const polyline = L.polyline(this.estimateLineData, { color: 'rgb(0, 255, 0)' })
        this.airLineFeatureGroup.addLayer(polyline).addTo(this.map)
        this.editableControl.enable()
        this.map.on(L.Draw.Event.EDITSTOP, (e)=> {
          console.log('e', e)
          console.log('拿到的this.airLineFeatureGroup', that.airLineFeatureGroup.getLayers())
          const { type } = e
           const layers = e.layers;
           if (that.estimateLineData.length > 0) {
            const laters = that.airLineFeatureGroup.getLayers()
            const newLatlngs = laters[laters.length - 1]._latlngs
            console.log('newLatlngs:',newLatlngs)
            let data = [], points = []
            newLatlngs.forEach((item, index) => {
              let obj = {}
              const lat = item.lat.toFixed(1)
              const lng = item.lng.toFixed(1)
              console.log('点位坐标：', lat, lng)
              let point = [Number.parseFloat(lat), Number.parseFloat(lng)]

              obj.latitude = Number.parseFloat(lat)
              obj.longitude = Number.parseFloat(lng)
              data.push(obj)
              points.push(point)
            })
            console.log('编辑完的点集合：', points)
            // let timer = null
            // timer = setTimeout(() => {
            //   that.drawAirLineEstimate()
            //   if (timer !== null) {
            //     clearTimeout(timer)
            //   }
            // }, 600);
           }
        });
      },
      // 结束编辑
      closeEdit() {
        console.log('this.editableControl2', this.editableControl)
        if (this.editableControl !== null) {
          // this.airLineFeatureGroup.save()
          this.editableControl.disable()
        }
      },
      drawAirLineAILine() {
        const that = this
        that.clearDrawAirLineAIEstimate()
        this.airLineAIData.forEach(item => {

        })
      },
      clearDrawAirLineAIEstimate() {
        if (this.airLineAIFeatureGroup !== null) {
          this.airLineAIFeatureGroup.onRemove(this.map)
        }
      },
      // 智能航线选择已有航线
      drawAiLine() {
        // console.log('绘制出航线来')
        const that = this
        that.clearDrawAirLineEstimate()
        that.clearAirLineLayer()
        this.drawLineLayer = L.polyline(this.airLineEstimateAIData, {
          color: "blue"
        }).addTo(this.map);
      },
      drawAirLineEstimate() {
        const that = this
        // console.log('===================this.airLineEstimateData', this.airLineEstimateData)
        console.log('===================this.estimateLineData', this.estimateLineData)
        this.removeSeaRiskScalarLayer()
        that.clearDrawAirLineEstimate()
        that.clearAllMapLayer()
        let estimateLineDataCopy = []
        this.airLineEstimateData.forEach((item, index) => {
          let marker = null, polyline = null
          // points.push([item.latitude, item.longitude])
          let content = `<p style='margin-top: 10px;'><span>时间：</span><span>${item.date && item.date !== null ? item.date : '-'}</span></p>` +
            `<p style='margin-top: 10px;'><span>经度：</span><span>${item.longitude && item.longitude !== null ? item.longitude.toFixed(6) : '-'}</span></p>` +
            `<p style='margin-top: 10px;'><span>纬度：</span><span>${item.latitude && item.latitude !== null ? item.latitude.toFixed(6) : '-'}</span></p>`
          // 自定义图标
          const myIconCss = `width: 12px;height: 12px;border-radius: 99px;background: ${that.getAirLineEstimateColor(item.grade)};position: absolute;top: 17px;left: -6px;border: 1px solid black;`
          const myIcon = L.divIcon({
            className: "my-custom-pin",
            iconAnchor: [0, 24],
            labelAnchor: [-6, 0],
            popupAnchor: [0, -36],
            html: `<div style="${myIconCss}"></div>`
          })

          const headIconCss = `width: 25px;height: 25px;position: absolute;top: 11px;left: -13px;`
          const headIcon = L.divIcon({
            className: "headIcon",
            iconAnchor: [0, 24],
            labelAnchor: [-6, 0],
            popupAnchor: [0, -36],
            html: `<img style="${headIconCss}" src="${chuanLightLogo}" />`
          })
          marker = L.marker([item.latitude, item.longitude],{icon: myIcon, riseOnHover: false}).on('click', () => this.handleGetChuanPosition(item, headIcon)).bindTooltip(content)

          // 原始图层
          if (this.airLineEstimateLayer === null) {
            this.airLineEstimateLayer = new L.featureGroup([marker]).addTo(that.map)
          } else {
            this.airLineEstimateLayer.addLayer(marker)
            if (index === this.airLineEstimateData.length - 1) {
              // console.log('that.estimateLineData=====================that.estimateLineData',that.estimateLineData)
              if (that.estimateLineData.length > 0) {
                polyline = L.polyline(this.estimateLineData, { color: 'rgb(255, 69, 0)' })
              } else {
                let estimateLineDataCopy = []
                this.airLineEstimateData.forEach(item1 => {
                  estimateLineDataCopy.push([item1.latitude, item1.longitude])
                })
                polyline = L.polyline(estimateLineDataCopy, { color: 'rgb(255, 69, 0)' })
              }
              this.airLineEstimateLayer.addLayer(polyline)
            }
          }

          // 可编辑图层
          // if (this.airLineFeatureGroup === null) {
          //   this.airLineFeatureGroup = L.layerGroup()
          // } else if (index === this.airLineEstimateData.length - 1) {
          //   polyline = L.polyline(this.estimateLineData, { color: 'rgb(0, 255, 0)' })
          //   this.airLineFeatureGroup.addLayer(polyline)
          // }
          if(index === 0) {
            this.chuanLineRiskLayer = L.marker([item.latitude, item.longitude],{icon: headIcon, riseOnHover: false}).addTo(this.map)
          }

          if(index === 0) {
            this.handleGetChuanPosition(item, headIcon)
          }
          that.airLineFeatureGroup.onRemove(that.map)
        })
      },
      handleGetChuanPosition(item, headIcon) {
        http.formData(seaRiskBigDataApi, {type: item.type, startTime: moment(item.date+':00:00').valueOf()}).then(res => {
          if (res.code === 0) {
            const bigData = res.data.json
          }
        })
        console.log('item', item)
        this.handleSetShipPosition(item)
      },
      handleSetShipPosition(item) {
        this.chuanLineRiskLayer.setLatLng([item.latitude, item.longitude])
      },
      removeChuanLineRiskLayer() {
        if (this.chuanLineRiskLayer !== null) {
          this.chuanLineRiskLayer.onRemove(this.map)
          this.chuanLineRiskLayer = null
        }
      },
      clearDrawAirLineEstimate() {
        if (this.airLineEstimateLayer !== null) {
          this.airLineEstimateLayer.onRemove(this.map)
        }
        if (this.airLineFeatureGroup !== null) {
          this.airLineFeatureGroup.onRemove(this.map)
        }
        this.removeSeaRiskScalarLayer()
        this.removeChuanLineRiskLayer()
      },
      getAirLineEstimateColor(value) {
        let color = ''
        if (value <= 45) {
          color = '#ffff'
        } else if (value <= 60) {
          color = '#fff45c'
        } else if (value <= 80) {
          color = '#fe902c'
        } else {
          color = '#fe0404'
        }
        return color
      },
      initWarningLine() {
        // 设置警戒线
        const data = window.localStorage.getItem('TYPHOON_WARNING_LINE_DATA')
        if (data && data !== '') {
            this.formObj = JSON.parse(data)
            this.$store.commit('moduleMap/SET_WARNING_LINE_DATA', this.formObj)
        }
      },
      // 加载港口
      addPortMarker(){
        let {portData} = this;
        let imgStyle = 'width:24px;height:24px;',
            divStyle = 'position: absolute;z-index:-1'
        this.portLayer = L.markerClusterGroup({
          maxClusterRadius: 30,
          iconCreateFunction: function (cluster) {
            var markers = cluster.getAllChildMarkers();
            var n = 0;
            for (let i = 0; i < markers.length; i++) {
              n += 1;
            }
            return L.divIcon({ html:`<div style="${divStyle}"><img style="${imgStyle}" src="${portIcon}" alt=""></div><p >${n}</p>` , className: 'my-cluster', iconSize: [24,24]});
          },
          //Disable all of the defaults:
          spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false
        });
        portData.forEach((v,i)=>{
          let m = L.marker([v.harborLatitude,v.harborLongitude],{icon:this.portIcon}).bindPopup(v.harborNameCn)
          this.portLayer.addLayer(m);
        })
        this.map.addLayer(this.portLayer)
      },
      // 移除港口
      removePortMarker(){
        this.portLayer.clearLayers();
      },
      // 加载设备库
      addDeviceMarker(){
        let {deviceData} = this;
        let imgStyle = 'width:24px;height:24px;',
            divStyle = 'position: absolute;z-index:-1'
        this.deviceLayer = L.markerClusterGroup({
          maxClusterRadius: 20,
          iconCreateFunction: function (cluster) {
            var markers = cluster.getAllChildMarkers();
            var n = 0;
            for (let i = 0; i < markers.length; i++) {
              n += 1;
            }
            return L.divIcon({ html:`<div style="${divStyle}"><img style="${imgStyle}" src="${deviceIcon}" alt=""></div><p >${n}</p>` , className: 'my-cluster', iconSize: [24,24]});
          },
          //Disable all of the defaults:
          spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false
        });
        deviceData.forEach((v,i)=>{
          let m = L.marker([v.latitude,v.longitude],{icon:this.deviceIcon}).bindPopup(v.name)
          this.deviceLayer.addLayer(m);
        })
        this.map.addLayer(this.deviceLayer)
      },
      // 移除设备库
      removeDeviceMarker(){
        this.deviceLayer.clearLayers();
      },
      // 加载管线
      addPipeLineMarker(){
        let {pipeLineData} = this;
        let imgStyle = 'width:24px;height:24px;',
            divStyle = 'position: absolute;z-index:-1'
        this.pipeLineLayer = L.featureGroup().addTo(this.map)
        this.pipeLineIconLayer = L.markerClusterGroup({
          maxClusterRadius: 20,
          iconCreateFunction: function (cluster) {
            var markers = cluster.getAllChildMarkers();
            var n = 0;
            for (let i = 0; i < markers.length; i++) {
              n += 1;
            }
            return L.divIcon({ html:`<div style="${divStyle}"><img style="${imgStyle}" src="${pipeIcon3}" alt=""></div><p >${n}</p>` , className: 'my-cluster', iconSize: [24,24]});
          },
          //Disable all of the defaults:
          spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false
        });
        pipeLineData.forEach((v,i)=>{
          let m = L.marker(v.pipelineRoute[0],{icon:this.pipeLineTypes['type' + v.pipelineType].icon}).bindPopup(`<p>${v.pipelineDescription.replace(/&&/g,'</br>')}</p>`)
          let l = L.polyline([v.pipelineRoute],{color:this.pipeLineTypes['type' + v.pipelineType].color})
          this.pipeLineLayer.addLayer(l);
          this.pipeLineIconLayer.addLayer(m);
        })
        this.map.addLayer(this.pipeLineIconLayer)
        this.map.addLayer(this.pipeLineLayer)
      },
      // 移除设备库
      removePipeLineMarker(){
        this.pipeLineIconLayer.clearLayers();
        this.pipeLineLayer.clearLayers();
      },
      setCenterView() {
        this.map.setView(this.centerPoint)
      },
      // 回填地图事件
      addMapEventsToMap(){
        this.clearAllMarker()
        let {eventsData} = this;
        for (let key in eventsData){
          let list =[...eventsData[key]]
          switch (key) {
            case 'measurePolyline':
              for (let i = 0; i < list.length; i++) {
                let options = list[i].options;
                const line = L.polyline(list[i].latlngs,{...options}).bindTooltip(list[i].tooltip,{direction:'auto',permanent:true})
                this.featureGroup.addLayer(line)
              }
              break;
            case 'measurePolygon':
              for (let i = 0; i < list.length; i++) {
                let options = list[i].options;
                const polygon = L.polygon(list[i].latlngs,{...options}).bindTooltip(list[i].tooltip,{direction:'auto',permanent:true})
                this.featureGroup.addLayer(polygon)
              }
              break;
            case 'textMarker':
              for (let i = 0; i < list.length; i++) {
                let options = list[i].options.icon.options;
                let icon= L.divIcon({...options})
                const text = L.marker(list[i].latlngs,{icon:icon})
                this.featureGroup.addLayer(text)
              }
              break;
            case 'iconMarker':
              for (let i = 0; i < list.length; i++) {
                let options = list[i].options.icon.options;
                let icon= L.divIcon({...options})
                const text = L.marker(list[i].latlngs,{icon:icon})
                this.featureGroup.addLayer(text)
              }
              break;
            case 'lineMarker':
              for (let i = 0; i < list.length; i++) {
                let options = list[i].options;
                let lg = L.featureGroup()
                const line = L.polyline(list[i].latlngs,{...options})
                lg.addLayer(line);
                const layers = list[i].layers;
                layers.forEach((v,i) =>{
                  const icon= L.divIcon(v.options)
                  const marker = L.marker(v.latlng,{icon:icon})
                  lg.addLayer(marker);
                })
                this.featureGroup.addLayer(lg)
              }
              break;
            case 'polygonMarker':
              for (let i = 0; i < list.length; i++) {
                let options = list[i].options;
                let lg = L.featureGroup()
                const polygon = L.polygon(list[i].latlngs,{...options})
                lg.addLayer(polygon);
                const layers = list[i].layers;
                layers.forEach((v,i) =>{
                  const icon= L.divIcon(v.options)
                  const marker = L.marker(v.latlng,{icon:icon})
                  lg.addLayer(marker);
                })
                this.featureGroup.addLayer(lg)
              }
              break;
            case 'rectangleMarker':
              for (let i = 0; i < list.length; i++) {
                let options = list[i].options;
                let lg = L.featureGroup()
                const polygon = L.polygon(list[i].latlngs,{...options})
                lg.addLayer(polygon);
                const layers = list[i].layers;
                layers.forEach((v,i) =>{
                  const icon= L.divIcon(v.options)
                  const marker = L.marker(v.latlng,{icon:icon})
                  lg.addLayer(marker);
                })
                this.featureGroup.addLayer(lg)
              }
              break;
            case 'circleMarker':
              for (let i = 0; i < list.length; i++) {
                let options = list[i].options;
                let lg = L.featureGroup()
                const circle = L.circle(list[i].latlngs,{...options})
                lg.addLayer(circle);
                const layers = list[i].layers;
                layers.forEach((v,i) =>{
                  const icon= L.divIcon(v.options)
                  const marker = L.marker(v.latlng,{icon:icon})
                  lg.addLayer(marker);
                })
                this.featureGroup.addLayer(lg)
              }
              break;
            default:
              break;
          }
        }
      },
      // 保存地图上所有事件
      saveMapEventsToJson(){
        let layerArr = this.featureGroup.getLayers(),
            data = {
              measurePolyline:[], measurePolygon:[], circleMarker:[], rectangleMarker:[], polygonMarker:[], textMarker:[], iconMarker:[], lineMarker:[],
            }
        layerArr.forEach((layer,index) =>{
          let layerObj = {
            latlngs:[], options:{}, bounds:[], markerType:'',tooltip:{}, layers:[]
          }
          // 标记组
          if(layer.markerType && layer._layers){
            let layers = layer._layers;
            for (let key in layers){
              let tm = {}
              if(layers[key].markerType == layer.markerType){
                layerObj.markerType = layers[key].markerType
                layerObj.options = layers[key].options
                layerObj.bounds = layers[key]._bounds || ''
                layerObj.tooltip = layers[key]._tooltip ? layers[key]._tooltip._content : ''
                layerObj.latlngs = layers[key]._latlngs || layers[key]._latlng
              }else{
                tm.options = layers[key].options.icon.options
                tm.latlng = layers[key]._latlng
                layerObj.layers.push(tm)
                tm = null
              }
            }
          }else if(layer.markerType){
            layerObj.markerType = layer.markerType
            layerObj.options = layer.options
            layerObj.bounds = layer._bounds || ''
            layerObj.tooltip = layer._tooltip ? layer._tooltip._content : ''
            layerObj.latlngs = layer._latlngs || layer._latlng
          }
          data[layer.markerType].push(layerObj)
          layerObj = null;
        })
        console.log(data);

        this.$store.commit('moduleMap/SET_MAP_EVENTS_DATA',{data:data,flag:false})
        return data;
      },
      // 显示 水深提示窗
      showWaterDeep(e){
        if (this.currentLayerType){
          console.log(e)
        }else{
          console.log(e)
          let t = e.originalEvent
          let style = `left:${t.clientX - 98}px;top:${t.clientY - 80}px`;
          this.waterDeep.style = style;
          this.waterDeep.flag = true;
        }
      },
      // 隐藏水深提示
      hideWaterDeep(){
        this.waterDeep.flag = false;
      }
    },
    created() {
      console.log(this.isMobile)
      this.isMobile = isMobile()
    }
  }

</script>

<style scoped lang="less">
.container {
  height: 100%;
  .contextmenu-tips{
    position: absolute;
    top: 0px;
    left: 0px;
    /*width: 200px;*/
    /*height: 200px;*/
    background-color: #fff;
    border-radius: 2px;
    overflow: hidden;
    p{
      padding: 5px 10px;
      cursor: pointer;
      &:hover{
        background-color: #c3c3c3;
        color: #00a0e9;
      }
    }
  }
  .custom-tips{
    position: absolute;
    padding: 10px;
    width: 190px;
    top: 100px;
    left:100px;
    /*border-radius: 15px;*/
    border: none;
    color: #c3c3c3;
    background-color: #ffffff;
    span{
      display: inline-block;
      width: 85px;
      color: #006fc6;
    }
    &:after, &:before {
      border: solid transparent;
      content: ' ';
      height: 0;
      top: 100%;
      position: absolute;
      width: 0;
    }

    &:after {
      border-width: 8px;
      border-top-color: #FFFFC8;
      left: 90px;
    }
    p:last-of-type>span{
      padding: 0 10px;
      width: auto;
      color: #c3c3c3;
      font-weight: 400;
    }
  }
  .map {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
  .bg_canvas{
    width: 100%;
    display: none;
    position: absolute;
    z-index: 500;
    left: 0;
    top: 60px;
  }
}
.typhoon-logo {
  background: url('../../assets/typhoon-logo.gif') no-repeat;
  background-size: 100% 100%;
}
  //
  .warning-line-pop{
    /deep/ .el-icon-view {
      position: absolute;
      right: 9px;
      top: 16px;
    }
    p{
      /*display: flex;*/
      /*align-items: center;*/
      span{
        /*margin: 0 10px;*/
        margin-right: 10px;
        line-height: 15px;
        flex: auto;
        i{
          cursor: pointer;
          font-size: 20px;
        }
        i.disabled{
          color:#CCCCCC;
        }
      }
    }
  }
/* 地 图 工具条*/
.map-tools{
  border-radius: 3px;
  background-color: #fff;
  box-shadow: 1px 2px 5px rgba(11,19,28,0.2s);
  position: absolute;
  right: 55px;
  top: 20px;
  transition: all .3s;
  .map-tools-bar-phone {
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    position: fixed;
    right: 5px;
    top: 135px;
    background: #ffffff;
    zoom: .7;
    /*width: 70px;*/
    .vname {
      font-size: 12px;
      transform: scale(.9);
    }
    img {
      margin-right: 0 !important;
      width: 20px !important;
      height: auto !important;
      margin-bottom: 3px;
    }
    li {
        padding: 4px 4px 4px 5px !important;
        box-sizing: border-box;
        border-right: none !important;
        span {
            padding: 2px 2px 4px 3px !important;
            border-bottom: 1px solid #e4e4e4;
        }
    }
    li:first-child {
      padding: 6px 4px 6px 5px !important;
    }
    li:last-child {
      padding: 3px 4px 3px 5px !important;
      border-bottom: none;
        span {
            border-bottom: none;
        }
    }
  }
  .map-tools-bar{
    >li{
      font-size: 12px;
      cursor: pointer;
      padding: 5px 8px;
      display: inline-block;
      border-right: 1px solid #cccccc;
      span{
        display: flex;
        justify-content: center;
        align-items: center;
        img{
          margin-right: 3px;
          width: 13px;
          height: 13px;
        }
      }
      &.active{
        /*background-color: #57a3f3;*/
        color: #0AA0E7;
      }
      &:hover{
        /*background-color: #0AA0E7;*/
        color: #0AA0E7;
      }
      &:hover > .children-tool-bar{
        display: block;
      }
      .children-tool-bar-phone {
        position: fixed !important;
        right: 60px!important;
        top: 140px!important;
        li {
            line-height: 20px !important;
        }
        .icon-arr {
          position: absolute;
          display: none;
          left: -61px !important;
          width: 120px;
          background-color: #fff;
          padding: 0;
          -ms-flex-wrap: wrap;
          flex-wrap: wrap;
          transform: translateY(62px);
        }
      }
      .children-tool-bar{
        padding-top: 10px;
        margin-top: -10px;
        display: none;
        position: absolute;
        top: 32px;
        margin-left: -8px;
        >li{
          background-color: #fff;
          color: #2c3e50;
          height: 28px;
          line-height: 28px;
          padding: 0 5px 0 10px;
          border-bottom: 0.5px solid #cccccc;
          &:hover{
            color: #0AA0E7;
          }
          span{
            >img{
              /*margin-right: 5px;*/
            }
            >span{
              margin-left: 5px;
            }
          }
          &.active{
            color: #0AA0E7;
          }
          &:hover{
            /*background-color: #0AA0E7;*/
            color: #0AA0E7;
          }
          .icon-arr{
            position: absolute;
            display: none;
            left: 94px;
            width: 175px;
            background-color: #fff;
            padding: 0;
            flex-wrap: wrap;
            >li{
              margin: 9px;
              border:1px solid #c3c3c3;
              height: 40px;
              width: 40px;
              padding: 5px;
              img{
                width: 30px;
                height: 30px;
              }
              &:hover{
                border: 1px solid #00a0e9;
              }

            }
          }
        }
        li:nth-child(1) > .icon-arr{
          top:10px;
        }
        li:nth-child(2) > .icon-arr{
          top:38px;
        }
        li:nth-child(3) > .icon-arr{
          top:66px;
        }
        li:nth-child(1):hover > .icon-arr{
          display: flex;
        }
        li:nth-child(2):hover > .icon-arr{
          display: flex;
        }
        li:nth-child(3):hover > .icon-arr{
          display: flex;
        }
      }
    }
    li:last-of-type{
      border-right: none;
    }
  }
}
.location-dialog {
  border-radius: 10px;
  .dialog-body{
    padding: 20px 20px 0 20px;
    text-align: center;
  }
  .dialog-header{
    position: absolute;
    right: 20px;
    top: 0;
    color: #FFFFFF;
    background-color: unset;
    border-radius: 5px 5px 0 0;
    p{
      height: 50px;
      line-height: 50px;
    }
  }
}

.latlng-form{
  .latlng-form-div{
    margin-bottom: 22px;
    .latlng-label{
      /*margin-right: 20px;*/
    }
    .latlng-input{
      width: 20%;
      margin-left: 10px;
      margin-right: 5px;
    }
  }
}



.text-marker{
  width: 100px !important;
  height: 30px !important;
  line-height: 30px;
  background-color: unset;
}
.icon-marker {
  width: 100px !important;
  height: 70px !important;
  line-height: 70px;
  background-color: unset;
  text-align: center;
  img {
    width: 40px;
    height: 40px;
  }
}


@keyframes rotate{from{transform: rotate(0deg);}to{transform: rotate(360deg);transition: all 5s;}}


</style>
<style scoped lang="css">

  .location-dialog>>> .el-dialog{
    border-radius: 5px;
  }
  .location-dialog>>> .el-dialog__header{
    padding: 0;
    background-color: #00479D;
    height: 50px;
    line-height: 50px;
    border-radius: 5px 5px 0 0;
  }
  .location-dialog>>> .el-dialog__title{
    margin-left: 20px ;
    color: #FFFFFF ;
  }
  .location-dialog>>> .el-dialog__body{
    padding: 0;
  }
  .location-dialog>>> .el-dialog__footer{
    padding:  0 20px 10px 20px;
    border-radius:  0 0 5px 5px;
  }
  .location-dialog>>> .el-color-picker__trigger{
    width: 185px;
    height: 44px;
  }
  .location-dialog>>> .el-input{
    width: 185px;
  }
  .arrow-icon{
    width: 30px;
    height: 30px;
    background-color: blue;
    transform: rotate(45deg);
  }
  .text-icon{
    width: 100px;
    height: 20px;
    color: #d81e06;
    line-height: 20px;
    font-size: 14px;
  }

  /* 遮罩图层 */
  #mask-map{
    width: 100%;
  }


</style>
<style >
  .my-cluster {
    width: 24px;
    height: 24px;
    /*background-color: blue;*/
    text-align: center;

  }
  .my-cluster p{
    width: 24px;
    height: 24px;
    line-height: 24px;
    color: #ffffff;
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    border-radius: 20px;
    text-shadow: #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px;
  }
</style>
