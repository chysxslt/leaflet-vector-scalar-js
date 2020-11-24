import moment from 'moment'
import html2canvas from 'html2canvas'
/**
 *
 * 公用方法
 */

const WEEKS = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'] // 星期表
const OBJECT_CONSTRUCOTR_NAME = ['Array','String','Object','Number','Function','Date','RegExp','Symbol','Boolean','Math']

//  判断 对象是否为原生 类型
export const checkNavtiveClass = (obj) =>{
  let name = obj.constructor.name;
  return OBJECT_CONSTRUCOTR_NAME.includes(name)
}




// 格式化管线  经纬 数据
export const  formatPipeLine = (data) =>{
  let list = data.split(';');
  let arr = []
  list.forEach((v,i) =>{
    let item = v.split(',');
    if (item instanceof Array && item.length == 2){
      arr.push(item);
    }
  })
  return arr;
}


// 格式化 时间轴 小时 和 星期

export const formatDateForTimeline = (date,t) => {
  const n = t || 24 * 7
  const D = date || '2018/03/01'
  const D1 = moment(new Date()).add('year',0).format("YYYY/MM/DD")
  let arr = {},arr1 = {},arr2 = []
  let d = new Date(new Date(D).toLocaleDateString()).getTime();
  let d1 = new Date(new Date(D1).toLocaleDateString()).getTime();
  for (let i = 0; i <= n; i++) {
    // let obj = {};
    arr[i] = d.toString();
    arr1[i] = d1.toString();
    if(i != 0 && i % 23 == 0){
      arr2.push(moment(new Date(+arr[i])).format('MM/DD')) // 显示年月日
      // arr2.push(WEEKS[new Date(d).getDay()])
    }
    d += 3600000;
    d1 += 3600000;
  }
  return {
    time:arr,  // 最小时间间隔
    time1: arr1,
    week:arr2 // 星期几
  }
}

//  海区风险时间轴
export const  formatDateForRiskTimeline = (start, end) => {
  console.log('时间格式化：')
  let arr = {}, allDats = [], i = 0
  const startTime = getDate(start);
  const endTime = getDate(end);
  while((endTime.getTime()-startTime.getTime())>=0){
    const year = startTime.getFullYear();
    const month = (startTime.getMonth()+1).toString().length==1?"0"+(startTime.getMonth()+1).toString():(startTime.getMonth()+1).toString();
    const day = startTime.getDate().toString().length==1?"0"+startTime.getDate():startTime.getDate();
    const hour = startTime.getHours().toString().length==1?"0"+startTime.getHours():startTime.getHours();
    allDats[i]=year+"/"+month+"/"+day;
    startTime.setDate(startTime.getDate()+1);
    i+=1;
  }
  const days = getDays(allDats)
  console.log('days', days)
  const n = allDats.length * 24
  let d = new Date(new Date(start).toLocaleDateString()).getTime();
  for (let i = 0; i <= n; i++) {
    arr[i] = d.toString();
    d += 3600000;
  }
  return {
    time:arr,  // 最小时间间隔
    days:days, // 日期
    max: n
  }
}
//  航线风险时间轴
export const  formatDateForLineRiskTimeline = (start, days) => {
  const n = days.length
  let arr = {}, formdays = []
  let d = moment(start).valueOf()
  
  for (let i = 0; i < n; i++) {
    arr[i] = moment(days[i]+':00:00').valueOf()
    formdays.push(moment(days[i]+':00:00').format("MM/DD HH"))
  }
  // console.log('=-======', arr)
  const newDays = getDays(formdays)
  // console.log('newDays', newDays)
  return {
    time:arr,  // 最小时间间隔
    days:newDays, // 日期
    max: n
  }
}
// 均等分时间轴日期数
const getDays = (arr) => {
  let newArr = [], step = Math.round(arr.length / 7)
  for (let i = 0; i < 7; i++) {
    if (i === 6) {
      newArr.push(arr[arr.length - 1])
    } else {
      let index = i * step
      newArr.push(arr[index])
    }
  }
  return newArr
}
const getDate = (datestr) =>{
  const temp = datestr.split("-");
  return new Date(temp[0],temp[1]-1,temp[2]);
}
//经纬度转换成度分秒

export const latlngChangeToDMS = (value) => {
  if (value == ''){
    return ['','','']
  }else{
    if(!isNaN(Number(value))){
      value = Math.abs(value);
      var v1 = Math.floor(value);//度
      var v2 = Math.floor((value - v1) * 60);//分
      var v3 = Math.round((value - v1) * 3600 % 60);//秒
      return [v1 ,v2, v3 ];
    }
  }

}
// 度分秒转为经纬度
export const DMSChangetoLatlng = (value) =>{
  if (value instanceof Array){
    if (value[0] == '' && value[1] == '' && value[2] == 0){
      return ''
    }else{
      return Math.abs(value[0])  + (Math.abs(value[1])/60 + Math.abs(value[2])/3600);
    }
  }
}

// 获取台风-平台所需枚举名
export const getPlatforEnum = (tPosition, aPosition) => {
  let str = ""
  if (tPosition === 'center') {
    if (aPosition === '1') {
      str = 'TYPHOON_CENTER_PLATFORM_ONE'
    } else if (aPosition === '2') {
      str = 'TYPHOON_CENTER_PLATFORM_TWO'
    } else if (aPosition === '3') {
      str = 'TYPHOON_CENTER_PLATFORM_THREE'
    } else {
      str = 'TYPHOON_CENTER_PLATFORM_CENTER'
    }
  } else if (tPosition === '7') {
    if (aPosition === '1') {
      str = 'TYPHOON_CENTER_SEVEN_PLATFORM_ONE'
    } else if (aPosition === '2') {
      str = 'TYPHOON_CENTER_SEVEN_PLATFORM_TWO'
    } else if (aPosition === '3') {
      str = 'TYPHOON_CENTER_SEVEN_PLATFORM_THREE'
    } else {
      str = 'TYPHOON_CENTER_SEVEN_PLATFORM_CENTER'
    }
  } else if (tPosition === '10') {
    if (aPosition === '1') {
      str = 'TYPHOON_CENTER_TEN_PLATFORM_ONE'
    } else if (aPosition === '2') {
      str = 'TYPHOON_CENTER_TEN_PLATFORM_TWO'
    } else if (aPosition === '3') {
      str = 'TYPHOON_CENTER_TEN_PLATFORM_THREE'
    } else {
      str = 'TYPHOON_CENTER_TEN_PLATFORM_CENTER'
    }
  } else if (tPosition === '12') {
    if (aPosition === '1') {
      str = 'TYPHOON_CENTER_TWELVE_PLATFORM_ONE'
    } else if (aPosition === '2') {
      str = 'TYPHOON_CENTER_TWELVE_PLATFORM_TWO'
    } else if (aPosition === '3') {
      str = 'TYPHOON_CENTER_TWELVE_PLATFORM_THREE'
    } else {
      str = 'TYPHOON_CENTER_TWELVE_PLATFORM_CENTER'
    }
  }
  return str
}
// 获取台风-作业区所需枚举名
export const getFieldEnum = (tPosition, aPosition) => {
  let str = ""
  if (tPosition === 'center') {
    if (aPosition === '1') {
      str = 'TYPHOON_CENTER_FIELD_ONE'
    } else if (aPosition === '2') {
      str = 'TYPHOON_CENTER_FIELD_TWO'
    } else if (aPosition === '3') {
      str = 'TYPHOON_CENTER_FIELD_THREE'
    } else {
      str = 'TYPHOON_CENTER_FIELD_CENTER'
    }
  } else if (tPosition === '7') {
    if (aPosition === '1') {
      str = 'TYPHOON_CENTER_SEVEN_FIELD_ONE'
    } else if (aPosition === '2') {
      str = 'TYPHOON_CENTER_SEVEN_FIELD_TWO'
    } else if (aPosition === '3') {
      str = 'TYPHOON_CENTER_SEVEN_FIELD_THREE'
    } else {
      str = 'TYPHOON_CENTER_SEVEN_FIELD_CENTER'
    }
  } else if (tPosition === '10') {
    if (aPosition === '1') {
      str = 'TYPHOON_CENTER_TEN_FIELD_ONE'
    } else if (aPosition === '2') {
      str = 'TYPHOON_CENTER_TEN_FIELD_TWO'
    } else if (aPosition === '3') {
      str = 'TYPHOON_CENTER_TEN_FIELD_THREE'
    } else {
      str = 'TYPHOON_CENTER_TEN_FIELD_CENTER'
    }
  } else if (tPosition === '12') {
    if (aPosition === '1') {
      str = 'TYPHOON_CENTER_TWELVE_FIELD_ONE'
    } else if (aPosition === '2') {
      str = 'TYPHOON_CENTER_TWELVE_FIELD_TWO'
    } else if (aPosition === '3') {
      str = 'TYPHOON_CENTER_TWELVE_FIELD_THREE'
    } else {
      str = 'TYPHOON_CENTER_TWELVE_FIELD_CENTER'
    }
  }
  return str
}
// 获取台风-船舶所需枚举名
export const getShipEnum = (tPosition) => {
  let str = ""
  if (tPosition === 'center') {
    str = "TYPHOON_CENTER_SHIP_CENTER"
  } else if (tPosition === '7') {
    str = "TYPHOON_CENTER_SEVEN_SHIP_CENTER"
  } else if (tPosition === '10') {
    str = "TYPHOON_CENTER_TEN_SHIP_CENTER"
  } else if (tPosition === '12') {
    str = "TYPHOON_CENTER_TWELVE_SHIP_CENTER"
  }
  return str
}
// 获取台风风险统计详情总的枚举名
export const getTyphoonRiskDetailEnum = (tPosition) => {
  let str = ""
  if (tPosition === '7级风圈') {
    str = "TYPHOON_CENTER_SEVEN"
  } else if (tPosition === '10级风圈') {
    str = "TYPHOON_CENTER_TEN"
  } else if (tPosition === '12级风圈') {
    str = "TYPHOON_CENTER_TWELVE"
  }
  return str
}

// 判断是否为移动端
export const isMobile = () => {
  return  navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
}


// 判断返回 data是否有值
export const checkResponseData = (data) =>{
  let flag = true;
  if (data instanceof Array){
    for (let i = 0; i < data.length; i++) {
      if (!(data[i].data) || data[i].data == [] ){
        flag = false;
        break;
      }
    }
  }else{
    if (!(data.data) || data.data == []){
      flag = false;
    }
  }
  return flag
}

// 截图
export const handleGetReport = () => {
  html2canvas(document.getElementById('map'),{
      useCORS:true // 底图跨域 必须！！
      }).then(function(canvas) {
      const url = canvas.toDataURL("image/png")
      console.log('截图url：', url)
      return url
  });
}
export  const fakeTime =(t) =>{
  console.log(t)
  let m = new Date(t).getMonth() + 1,d = new Date(t).getDay();
  let test = '2018/' + m +'/' + d
  return new Date(test).getTime()
}