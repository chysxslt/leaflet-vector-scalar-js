<template>
  <div class="map-layer" :class="{'map-layer-phone': isMobile}"  :style="{'margin-top': (!showMoreFlag ? marginTop :moreMarginTop) }" >

    <div class="map-tips">
      <!-- 经纬度 水深tips -->
      <div class="lat-lng-tips" :class="{'lat-lng-tips-phone': isMobile}">
        <span>纬度:<b>{{currentLat[0]}}°{{currentLat[1]}}'{{currentLat[2]}}"</b></span>
        <span>经度:<b>{{currentLng[0]}}°{{currentLng[1]}}'{{currentLng[2]}}"</b></span>
<!--        <span>水深:<b>{{currentDeep}}</b>米</span>-->
      </div>
    </div>

    <!--   图层工具条  -->
    <div class="map-layer-control" :class="{'map-layer-control-phone': isMobile}" v-if="!isMobile">
    <!--    基础图层  -->
      <ul class="layer-control-ul">
        <li v-for="(item,index) in baseLayerV1" :key="index" @click="toggleBaseLayerV1(item,index)" :class="[baseLayerIndex == index && item.active ? 'active' : '']"><i><img :src="item.layerIcon"  alt=""/></i><span v-show="!isMobile">{{item.layerName}}</span></li>
      </ul>
      <ul class="layer-control-ul">
        <li :class="{'active': showMoreFlag}" @click="toggleMoreLayer()"><i class="el-icon-plus"  ></i><span v-show="!isMobile">更多</span></li>
      </ul>
      <!--  设备图层-->
      <ul class="layer-control-ul" v-show="showMoreFlag">
        <li v-for="(item,index) in deviceLayerV1" :key="index" @click="toggleDeviceLayerV1(item,index)" :class="{'active' : item.active}"><i ><img :src="item.layerIcon"  alt=""/></i><span v-show="!isMobile">{{item.layerName}}</span></li>
      </ul>
    </div>

    <!--   图层工具条  -->
    <div class="map-layer-control" :class="{'map-layer-control-phone': isMobile}" v-if="isMobile">
      <!--    基础图层  -->
      <ul class="layer-control-ul1">
        <li v-for="(item,index) in baseLayer" :key="index" @click="toggleBaseLayer(item,index)" :class="[baseLayerIndex == index && item.active ? 'active' : '']"><i><img :src="item.layerIcon"  alt=""/></i><span v-show="!isMobile">{{item.layerName}}</span></li>
      </ul>
      <ul class="layer-control-ul1">
        <li :class="{'active': showMoreFlag}" @click="toggleMoreLayer()"><i class="el-icon-plus"  ></i><span v-show="!isMobile">更多</span></li>
      </ul>
      <!--  设备图层-->
      <ul class="layer-control-ul1" v-show="showMoreFlag">
        <li v-for="(item,index) in deviceLayer" :key="index" @click="toggleDeviceLayer(item,index)" :class="{'active' : item.active}"><i ><img :src="item.layerIcon"  alt=""/></i><span v-show="!isMobile">{{item.layerName}}</span></li>
      </ul>
    </div>

    <!-- 时间线及图层图例 -->
    <div class="map-time-legend" :class="{'map-time-legend-phone': isMobile}" :style="{'width': timeLineWidth + 'px'}" v-show="showTimeLine">
      <div class="time-line" :class="{'time-line-phone': isMobile}">
        <div class="time-line-picker" v-show="!isMobile">
          <el-date-picker
              v-model="historyDate"
              type="date"
              placeholder="选择日期"
              format="yyyy-MM-dd"
              value-format="timestamp"
              :clearable=false
              :picker-options="pickerOptions"
              @change="changeHistoryDate"
              @blur="togglePickerIcon"
              @focus="togglePickerIcon"
          >
          </el-date-picker>
          <i class="picker-icon" :class="[datePickerActive ? 'el-icon-arrow-down' : 'el-icon-arrow-up']"></i>
        </div>
        <div class="time-line-icon">
          <i @click="playTimeLine" v-if="!timeFlag"><img :src="playIcon" alt=""></i>
          <i  @click="stopTimeLine" v-else><img :src="pauseIcon" alt=""></i>
        </div>
        <div class="time-line-slider" @mouseover="showTimelineTips">
          <div class="custom-tips" :style="customTips.style"  v-show="customTips.show">{{customTips.text}}</div>
          <el-slider v-model="timeValue" :max="timeLineMax" :format-tooltip="formatTimelineTips" :show-stops='false' @change="changeTimeLine" ></el-slider>
          <div class="date-line" >
            <span v-for="(v,index) in timeLineData.week">{{v}}</span>
          </div>
        </div>
      </div>
      <div class="map-legend" :class="{'map-legend-phone': isMobile}">
        <div class="legend-bg" :class="'layer' + baseLayerIndex">
          <span v-for="(v,index) in baseMapLayerLegend[baseLayerIndex]">{{v}}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  // 地图图层控制
  import {mapState} from 'vuex'
  import moment from 'moment'
  import {formatDateForTimeline} from '../../utils/util'
  import playIcon from '@/assets/map/播放.png'
  import pauseIcon from '@/assets/map/暂停.png'
  import { isMobile } from "../../utils/util"
  import demoData from "../../mock/data"

  export default {
    name: 'MapControl',
    components: {

    },
    computed:{
      ...mapState('moduleMap',{ // 注入state
        deviceLayer:state =>state.map.deviceLayer,
        deviceLayerV1:state =>state.map.deviceLayerV1,
        baseLayerV1:state =>state.map.baseLayerV1,
        baseLayer:state =>state.map.baseLayer,
        currentLat:state =>state.map.currentLat,
        currentLng:state =>state.map.currentLng,
        currentDeep:state =>state.map.currentDeep,
        layerFlag:state =>state.map.layerFlag,
        baseLayerIndex:state =>state.map.baseLayerIndex,

      }),
      ...mapState('moduleRiskEstimate',{ // 注入state
        areaRiskEstimateFlag:state =>state.areaRiskEstimateFlag,
        airLineEstimateFlag:state =>state.airLineEstimateFlag,
        airLineAIFlag:state =>state.airLineAIFlag

      }),
      // 时间轴 宽度计算
      timeLineWidth(){
        if (this.isMobile) {
          return  (this.clientWid - this.l - this.r - 25);
        } else {
          return  (this.clientWid - this.l - this.r - 40);
        }
      },
      showTimeLine(){
        let flag = false;
        let {baseLayer} = this;
        // console.log('====> baseLayer' ,baseLayer)
        for (let i = 0; i < baseLayer.length; i++) {
          if (baseLayer[i].active){
            flag = true;
            break;
          }
        }
        return flag
      },
    },
    watch:{

    },
    data () {
      return {
        historyDate:new Date('2020/1/1'),
        isMobile: isMobile(),
        playIcon:playIcon,
        pauseIcon:pauseIcon,
        clientWid:document.documentElement.offsetWidth,
        l : 0,
        r : 0,
        baseMapLayerLegend:[
          ['m/s',0,3,5,10,15,20,30,40],
          // ['°C',-20,-10,0,10,20,30,40],
          ['m',0.5,1,2,3,5,7,9],
          ['°C',10,15,18,22,26,29,33],
          ['m/s',0,0.1,0.5,1,1.5,2,2.5,3,3.5],
          ['hPa',995,1001,1007,1013,1019,1025],
          ['%',22.3,24.8,27.4,29.9,32.5,35.0],
          ['KT',0,45,60,80]
        ],
        // baseLayerInde:null,// 基础图层 activeIndex
        activeToolIndex:null,
        showMoreFlag:false,
        marginTop:(document.documentElement.clientHeight - 255)+'px',
        moreMarginTop:(document.documentElement.clientHeight - 315) + 'px',
        timeValue: [0],
        timeLineData: formatDateForTimeline('2020/1/1'),
        timeLineMax:168,
        timeFlag:false,
        customMarkerLayer:null,
        dragFlag:false,
        datePickerActive:false,
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() < new Date('2018/1/1').getTime() || time.getTime() > new Date('2020/3/31').getTime();
          },
        },
        customTips:{ // 自定义 时间 提示
          text:'',
          style:'',
          show:false
        } //
      }
    },
    mounted(){
      this.$nextTick(() =>{
          setInterval(() =>{
            this.getRightAndLeft();
          },300)
      })
    },
    methods:{
      // 时间轴历史时间 选择
      changeHistoryDate(e){
        console.log(e)
        this.timeLineData = formatDateForTimeline(new Date(e).toLocaleDateString())
        this.timeValue = 0
        this.inputTimeLine(this.timeValue)
        this.stopTimeLine();
        console.log(this.timeLineData)
      },
      // 切换 picker 图标
      togglePickerIcon(){
        this.datePickerActive = !this.datePickerActive
      },
      // 获取左右边栏 宽度
      getRightAndLeft(){
        this.l = document.querySelector('.leftSlideBox') ? document.querySelector('.leftSlideBox').offsetWidth : 0
        this.r = document.querySelector('.rightSlideBox') ? document.querySelector('.rightSlideBox').offsetWidth : 0
      },
      // 切换设备图层
      toggleDeviceLayer(item,index){
        if (item.layerType == 'LATLON_FLAG'){
          this.$store.commit('moduleMap/' + item.layerType,index)
        }else{
          this.$store.dispatch('moduleMap/' + item.layerType,{flag:item.active})
        }
        // console.log(item)
        this.deviceLayer[index].active = !this.deviceLayer[index].active;
      },

      // 切换设备图层 demo用
      toggleDeviceLayerV1(item,index){
        console.log(index)
        if (item.layerType == 'LATLON_FLAG'){
          this.$store.commit('moduleMap/' + item.layerType,index)
        }else{
          this.$store.commit('moduleMap/' + item.layerType,{flag:item.active, data: demoData[item.layerType].data})
        }
        // console.log(item)
        this.deviceLayerV1[index].active = !this.deviceLayerV1[index].active;
      },

      // 切换基础图层
      toggleBaseLayer(item,index){
        this.stopTimeLine()
        console.log(index)
        // 海区风险图层打开时不显示基础图层
        if(!this.areaRiskEstimateFlag && !this.airLineEstimateFlag && !this.airLineAIFlag) {
          if (!this.layerFlag){
            this.$message({
              message: '正在渲染当前图层',
              type: 'warning'
            });
            return false
          }else{
            if (index == this.baseLayerIndex){
              // this.activeLayerIndex = null
              this.$store.dispatch('moduleMap/' + item.layerType, {flag:item.active,index:index})
            }else{
              let activeItem = this.baseLayerIndex != null ? this.baseLayer[this.baseLayerIndex] : null
              if (activeItem){
                this.$store.dispatch('moduleMap/' + activeItem.layerType, {flag:true,index:this.baseLayerIndex})
              }
              // this.$store.dispatch('moduleMap/' + item.layerType, {flag:item.active,time:this.timeLineData.time[this.timeValue],index:index})
              this.changeTimeLine(this.timeValue,index)
              // this.$store.dispatch('moduleMap/' + item.layerType, {flag:item.active,time:null,index:index})
            }
          }

          console.log(this.baseLayer)
        } else {
          this.$Message.warning('图层优先级权限不足，请关闭分析图层后重试')
        }
      },
      // 切换基础图层 本地Demo 用
      toggleBaseLayerV1(item,index){
        debugger
        this.stopTimeLine()
        console.log(index)
        // 海区风险图层打开时不显示基础图层
        // if(!this.areaRiskEstimateFlag && !this.airLineEstimateFlag && !this.airLineAIFlag) {
          if (!this.layerFlag){
            this.$message({
              message: '正在渲染当前图层',
              type: 'warning'
            });
            return false
          }else{
            if (index == this.baseLayerIndex){
              // this.activeLayerIndex = null
              this.$store.dispatch('moduleMap/' + item.layerType, {flag:item.active,index:index})
            }else{
              let activeItem = index != null ? this.baseLayerV1[index] : null
              if (activeItem){
                this.$store.dispatch('moduleMap/' + activeItem.layerType, {flag:false,index:index})
              }
              // this.$store.dispatch('moduleMap/' + item.layerType, {flag:item.active,time:this.timeLineData.time[this.timeValue],index:index})
              this.changeTimeLine(this.timeValue,index)
              // this.$store.dispatch('moduleMap/' + item.layerType, {flag:item.active,time:null,index:index})
            }
          }

          console.log(this.baseLayerV1)
        // } else {
        //   this.$Message.warning('图层优先级权限不足，请关闭分析图层后重试')
        // }
      },
      // 切换更多图层
      toggleMoreLayer(){
        this.showMoreFlag = !this.showMoreFlag
      },
      showTimelineTips(){
        $('.el-slider__runway').mousemove( (e) => {
          console.log(e)
          let lineWdith = e.target.getBoundingClientRect().width,
              lineOffsetX = e.target.getBoundingClientRect().x,
              mouseX = e.clientX,
              mouseY = e.clientY,
              w = mouseX - lineOffsetX
          let n = (lineWdith / 168).toFixed(2)
          let v = Math.floor(w / n)
          this.customTips.text = moment(+this.timeLineData.time[v]).format('HH:00')
          this.customTips.style = `left:${mouseX - lineOffsetX + 145}px;top:-30px`
          // console.log(this.customTips)
          // this.customTips.y = mouseY
        })
        $('.el-slider__runway').mouseover(()=>{
            this.customTips.show = true
        })
        $('.el-slider__runway').mouseout(()=>{
            this.customTips.show = false
        })
      },
      // 格式化 时间轴 tips
      formatTimelineTips(v){
        return  (moment(+this.timeLineData.time[v]).format('MM/DD HH:00'));
      },
      // 切换 图层 或拖拽时 触发 自动移动到有数据的 time
      changeTimeLine(e,index){
        let n = !isNaN(index) ? index : this.baseLayerIndex
        if (n != null){
          let layerType = this.baseLayer[n].layerType
          let tt = 0;
          console.log(e,layerType)
            tt = e;
          // }
          this.timeValue = tt;
          this.inputTimeLine(this.timeValue,index);
        }
      },
      // 时间切换时 调用 store
      inputTimeLine(v,i){

        console.log(v)
        let {time} = this.timeLineData;
        let index = i != null ? i : this.baseLayerIndex
        let item =this.baseLayer[index]
         item =this.baseLayerV1[index]
        console.log('===> 自动调用',item,v,time[v])

        this.$store.dispatch('moduleMap/' + item.layerType, {flag:false,time:time[v],index:index })
      },
      // 播放时间
      playTimeLine(){
        let tt =  this.baseLayerIndex == 0 || this.baseLayerIndex == 3  ? 5000 : 1500
        this.timeFlag = true
        this._t = setInterval(()=>{
          let {timeValue,timeLineMax}  = this
          if (timeValue >= timeLineMax){
            this.stopTimeLine()
            return false
          }else{
            this.timeValue = parseInt(timeValue) + 1
            this.inputTimeLine(this.timeValue,this.baseLayerIndex)
            // console.log(this.timeValue)
          }
        },tt)
      },
      // 停止时间
      stopTimeLine(){
        this.timeFlag = false
        if (this._t){
          clearInterval(this._t)
        }
      }
    },
    created() {
      this.isMobile = isMobile()
    }
  }
</script>

<style type="css" scoped>
  .time-line-slider >>> .el-slider__runway{
    background-color: rgba(2, 2, 2, 0.5) !important;
  }
  .time-line-picker>>> .el-input__prefix{
    display: none;
  }
  .time-line-picker>>> .el-input__inner{
    border-radius: 20px;
    background-color: #00a0e9;
    padding: 0 0 0 10px;
    text-shadow:0 0 0 #FFFFFF;
    border: none;
    outline: none;
    height: 34px;
    cursor: pointer;
    color:transparent;
  }
  .time-line-picker>>> .el-date-editor.el-input{
    width: 120px;
    border-radius: 20px;
    background-color: #00a0e9;
    border: none;
  }
</style>
<style scoped lang="less">
  .map-layer{
    border-radius: 50px;
    width: 30px;
    float: left;
    margin-left: 30px;
    background-color: rgba(2,2,2,0.5);
    .map-tips{
      transition: all .3s;
      position: absolute;
      top: 20px;
      .lat-lng-tips{
        margin-left: -20px;
        float: left;
        color: #ffff;
        text-shadow: #333333 0px 0px 2px,#333333 0px 0px 2px,#333333 0px 0px 2px,#333333 0px 0px 2px,#333333 0px 0px 2px,#333333 0px 0px 2px,#333333 0px 0px 2px;
        span{
          margin-left:10px;
        }
      }
    }
    .map-layer-control{
      color: #ffffff;
      .layer-control-ul{
        li.active{
          i{
            background-color: #00a0e9;
            box-shadow: #333333 0px 2px 2px;
          }
          span{
            background-color: rgba(2,2,2,0.5);
          }
        }
        li{
          cursor: pointer;
          font-size: 14px;
          width: 120px;
          height: 30px;
          display: flex;
          align-items: center;
          &:hover i{
            transition: all .3s;
            background-color: #e60012;
            box-shadow: #333333 0px 2px 2px;
          }
          &:hover span{
            transition: all .3s;
            background-color: rgba(2,2,2,0.2);
          }
          i{
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            img{
              // width: 50%;
              height: 50%;
            }
          }
          span{
            font-weight: 400;
            margin-left: 10px;
            padding: 2px 10px;
            border-radius: 20px;
            text-shadow: #333333 0px 0px 2px,#333333 0px 0px 2px,#333333 0px 0px 2px,#333333 0px 0px 2px,#333333 0px 0px 2px,#333333 0px 0px 2px,#333333 0px 0px 2px;
          }
        }
      }
    }
    .map-time-legend-phone {
      left: 5px !important;
      bottom: -50px !important;
    }
    .time-line-phone {
      position: relative;
      /*bottom: -87px;*/
      zoom: .8;
    }
    .map-legend-phone {
      /*position: absolute;*/
      /*top: -31px;*/
      left: 0px;
      /*transform: rotate(90deg);*/
      position: fixed;
      bottom: -11px;
      /*right: -100px;*/
      width: 100vw !important;
      /*height: 0px !important;*/
      /*zoom: .8;*/
    }
    .map-legend-phone .legend-bg {
      zoom: .85 !important;
      font-size: 10px;
      border-radius: 0 !important;
      margin-left: 0 !important;
    }
    .map-legend-phone span {
      /*transform: rotate(-90deg);*/
      font-size: 12px !important;
    }
    .map-time-legend{
      position: absolute;
      transition: all 0.3s;
      bottom:0;
      margin-left: -3px;
      display: flex;
      align-items: flex-end;
      .time-line{
        flex:1;
        display: flex;
        .time-line-picker{
          width: 130px;
          position: relative;
          .picker-icon{
            width: 20px;
            height: 20px;
            background: #ffffff;
            color: #00a0e9;
            border-radius: 50%;
            line-height: 20px;
            text-align: center;
            position: absolute;
            top: 7px;
            right: 17px;
            transition: all .5s;
          }
        }
        .time-line-icon{
          cursor: pointer;
          /*font-size: 40px;*/
          margin-right: 15px;
          color: #009dff;
          /*float: left;*/
          /*background-color: #fff;*/
          img{
            width: 34px;
            height: 34px;
          }
        }
        .time-line-slider{
          flex: 1;
          .custom-tips{
            position: absolute;
            padding: 2px 15px;
            top:0;
            left: 0;
            border-radius: 15px;
            border: none;
            color: black;
            background-color: #FFFFC8;
            /*&:after, &:before {*/
            /*  border: solid transparent;*/
            /*  content: ' ';*/
            /*  height: 0;*/
            /*  top: 100%;*/
            /*  position: absolute;*/
            /*  width: 0;*/
            /*}*/

            /*&:after {*/
            /*  border-width: 8px;*/
            /*  border-top-color: #FFFFC8;*/
            /*  left: 26px;*/
            /*}*/
          }
          /*margin-left: 15px;*/

        }
        .date-line{
          margin-top: -18px;
          display: flex;
          span {
            flex: 1;
            display: flex;
            color: #FFFFFF;
            font-weight: 400;
            text-align: center;
            vertical-align: bottom;
            border-left-width: 1px;
            border-left-color: #2f332a;
            border-left-style: solid;
            text-shadow: #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px;
            justify-content: center;
            align-items: end;
          }
        }
      }
      .map-legend{
        width: 300px;
        height: 20px;
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        .legend-bg{
          transition: all .3s;
          height: 20px;
          display: flex;
          align-items: center;
          border-radius: 20px;
          width: 100%;
          margin-left: 20px;
          box-shadow: 0px 2px 4px #2f332a;
          padding: 0 5px;
          span{
            text-align: center;
            font-size: 14px;
            font-weight: 400;
            color: #FFFFFF;
            flex: 1;
            /*padding-left: 10px;*/
          }
        }

        .layer0{
          background: linear-gradient(to right,rgba(90,86,143,1), rgba(72,104,181,1), rgba(69,151,168,1), rgba(81,180,98,1), rgba(106,192,82,1), rgba(177,209,67,1), rgba(215,206,60,1), rgba(214,172,64,1), rgba(213,137,72,1), rgba(205,94,93,1), rgba(144,28,79,1), rgba(43,0,1,1));
        }
        .layer1{
          background: linear-gradient(to right,rgba(90,86,143,1), rgba(72,104,181,1), rgba(69,151,168,1), rgba(81,180,98,1), rgba(106,192,82,1), rgba(177,209,67,1), rgba(215,206,60,1), rgba(214,172,64,1), rgba(213,137,72,1), rgba(205,94,93,1), rgba(144,28,79,1), rgba(43,0,1,1))

        }
        .layer2{
          background: linear-gradient(to right,rgba(90,86,143,1), rgba(72,104,181,1), rgba(69,151,168,1), rgba(81,180,98,1), rgba(106,192,82,1), rgba(177,209,67,1), rgba(215,206,60,1), rgba(214,172,64,1), rgba(213,137,72,1), rgba(205,94,93,1), rgba(144,28,79,1), rgba(43,0,1,1))

        }
        .layer3{
          background: linear-gradient(to right,rgba(90,86,143,1), rgba(72,104,181,1), rgba(69,151,168,1), rgba(81,180,98,1), rgba(106,192,82,1), rgba(177,209,67,1), rgba(215,206,60,1), rgba(214,172,64,1), rgba(213,137,72,1), rgba(205,94,93,1), rgba(144,28,79,1), rgba(43,0,1,1))

        }
        .layer4{
          background: linear-gradient(to right,rgba(90,86,143,1), rgba(72,104,181,1), rgba(69,151,168,1), rgba(81,180,98,1), rgba(106,192,82,1), rgba(177,209,67,1), rgba(215,206,60,1), rgba(214,172,64,1), rgba(213,137,72,1), rgba(205,94,93,1), rgba(144,28,79,1), rgba(43,0,1,1))

        }
        .layer5{
          background: linear-gradient(to right,rgba(90,86,143,1), rgba(72,104,181,1), rgba(69,151,168,1), rgba(81,180,98,1), rgba(106,192,82,1), rgba(177,209,67,1), rgba(215,206,60,1), rgba(214,172,64,1), rgba(213,137,72,1), rgba(205,94,93,1), rgba(144,28,79,1), rgba(43,0,1,1))

        }
        .layer6{
          background: linear-gradient(to right,rgba(90,86,143,1), rgba(72,104,181,1), rgba(69,151,168,1), rgba(81,180,98,1), rgba(106,192,82,1), rgba(177,209,67,1), rgba(215,206,60,1), rgba(214,172,64,1), rgba(213,137,72,1), rgba(205,94,93,1), rgba(144,28,79,1), rgba(43,0,1,1))

        }
      }
    }
  }
  .map-layer-phone {
    margin-left: 12px;
    position: absolute;
    bottom: 72px;
  }
  .map-layer-control-phone {
    zoom: .88;

    .layer-control-ul1 {
    li.active {
      i {
        background-color: #00a0e9;
        box-shadow: #333333 0px 2px 2px;
      }

      span {
        background-color: rgba(2, 2, 2, 0.5);
      }
    }

    li {
      cursor: pointer;
      font-size: 14px;
      /*width: 120px;*/
      height: 30px;
      display: flex;
      align-items: center;
      width: auto !important;
      display: flex;
      /*&:hover i {*/
      /*  transition: all .3s;*/
      /*  background-color: #e60012;*/
      /*  box-shadow: #333333 0px 2px 2px;*/
      /*}*/

      /*&:hover span {*/
      /*  transition: all .3s;*/
      /*  background-color: rgba(2, 2, 2, 0.2);*/
      /*}*/

      i {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;

        img {
          // width: 50%;
          height: 50%;
        }
      }

      span {
        font-weight: 400;
        margin-left: 10px;
        padding: 2px 10px;
        border-radius: 20px;
        text-shadow: #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px, #333333 0px 0px 2px;
      }
    }
  }
  }
  .map-layer-control-phone i {
    zoom: .88;
    /*margin-left: 2.3%;*/
    margin: auto;
  }
  .lat-lng-tips-phone{
    position: fixed;
    top: 133px;
    left: 17px;
    zoom: .7;
  }
</style>
