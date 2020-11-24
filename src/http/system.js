/**
 * 系统
 */

const uri = '/v1/auth'
const uri1 = '/v1/sso'
const uri2 = '/v1/sms/send-'
const email = '/v1/email'

export const login = uri + "/login";
export const loginApp = uri1 + "/app-login";
export const register = uri1 + "/external-register";
export const sendMsg = uri2;
export const logout = uri1 + '/logout';
export const sendEmailCode = email + '/send';
export const emailBind = email + '/bind-';
export const typhoon = `/v1/typhoon-feedback`

