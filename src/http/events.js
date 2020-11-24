/**
 * 风险分析事件库
 */
const uri = '/v1/typhoon-case-info'
const uri1 = '/v1/typhoon-case-report'

export const getPageAnalysis = uri + "/page_analysis";
export const getPageRisk = uri + "/page_assessment";
export const saveStorageEvents = uri + "/save_storage_events";
export const deleteById = uri + "/";
export const downloadById = uri1 + "/download";
export const shareTo = uri1 + "/forward";
export const checkExist = uri1 + "/whether/";
export const importEvents = uri + "/read_events/";
