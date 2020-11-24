/**
 * api 请求url
 * import {test} from '../api'
 * this.$http(test,{...obj}).then()
 */


// 例子
 export const  test = "/api/test";


 export const  getWindInfo = "/v1/typhoon-wind-field/getWindInfo"; // 风场数据接口
 export const  getWindHotInfo = "/v1/typhoon-wind-field/getWindHotInfo"; // 风场热力数据接口
 export const  getWaterDeptInfo = "/v1/typhoon-water-depth/getWaterDeptInfo"; // 水深接口
 export const  getPlatCordonInfo = "/v1/typhoon-config/getPlatCordonInfo"; // 油汽平台接口
 export const  getPipeLineList = "/v1/typhoon-pipeline/list"; // 管线平台接口
 export const  getPortList = "/v1/typhoon-harbor/list"; // 港口平台接口
 export const  getDeviceList = "/v1/typhoon-equipment-library/list"; // 应急设备接口
 export const  getCurrentInfo = "/v1/typhoon-current/getCurrentInfo"; // 洋流数据接口
 export const  getCurrentHotInfo = "/v1/typhoon-current/getCurrentHotInfo"; // 洋流热力数据接口
 export const  getSaltInfo = "/v1/typhoon-salt-info/getSaltInfo"; // 盐度数据接口
 // export const  getSaltInfo = "/v1/typhoon-salt-month/getSaltInfo"; // 盐度数据接口
 export const  getAirTemperature = "/v1/typhoon-sea-temperature/getSeaTemperature"; // 气温数据接口
 export const  getSeaTemperature = "/v1/typhoon-air-temperature/getAirTemperature"; // 海温数据接口
 export const  getWaveInfo = "/v1/typhoon-wave-field/getWaveInfo"; // 海浪数据接口
 export const  getWaveHotInfo = "/v1/typhoon-wave-field/getWaveHotInfo"; // 海浪热力数据接口
 export const  getAirPressure = "/v1/typhoon-pressure/getPressureInfo"; // 气压数据接口

 export const  getEarthWindInfo = "/v1/typhoon-earth-wind-filed/getInfo"; // 全球风场接口
 export const  getEarthPressureInfo = "/v1/typhoon-earth-pressure-filed/getInfo"; // 全球气压接口
 export const  getEarthCurrentInfo = "/v1/typhoon-earth-current-filed/getInfo"; // 全球洋流接口
 export const  getEarthWaveInfo = "/v1/typhoon-earth-wave-hot-filed/getInfo"; // 全球海浪热力接口
 export const  getEarthSeaTempInfo = "/v1/typhoon-earth-sea-temperature-filed/getInfo"; // 全球海温接口



