/**
 * 台风
 */

const uri = '/v1/typhoon'

export const list = uri + "/list/";                                            //台风列表
export const getDetailById = uri;                                              // 台风详情
export const getRiskStatistics = uri + '/impact_risk_statistics/';
export const getSpacingDistancePlatform = uri + '/spacing_distance_platform';  // 台风间距 平台
export const getSpacingDistanceArea = uri + '/spacing_distance_field';         // 台风间距  作业区
export const getSpacingDistanceShip = uri + '/spacing_distance_ship';          // 台风间距 船舶
export const downloadModel = uri + '/json_templates';          // 台风模板下载
export const uploadNoId = uri + '/upload_custom_typhoon';          // 自定义台风上传
export const getListCustom = uri + '/list_custom';          // 获取自定义台风列表
export const getTyphoonUpdateTime = uri + '/get_latest_typhoon';          // 获取自定义台风列表
