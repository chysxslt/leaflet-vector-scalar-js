/**
 * 风险评估
 */

const uri = '/v1/typhoon-route-info'
const uri1 = '/v1/typhoon-sea-risk'
const uri2 = '/v1/typhoon-sea-risk-info'

export const add = uri;
export const page = uri + '/page';
export const deleteById = uri;
export const edit = uri;
export const download = uri + '/export';
export const downloadModel = uri + '/download';
export const uploadById = uri + '/import';
export const uploadNoId = uri + '/upload';
export const getAirLineList = uri + '/list';
export const getRouteAssessment = uri + '/route_assessment';
export const reGetRouteAssessment = uri + '/recalculate_route';
export const saveRouteEvent = uri + '/save_route_event';
export const getRouteInfo = uri + '/route_info';
export const getIntelligentRouteInfo = uri + '/intelligent_route';
export const seaRiskBigData = uri1 + '/list';
export const pointRiskEstimateDetail = uri2 + '/getRiskInfo';
