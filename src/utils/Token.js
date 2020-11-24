/**
 * Token
 * 
 */

 export const Token = ''

 export function setToken(value) {
     window.localStorage.setItem('TYPHOON_SYS_TOKEN', value);
 }
 export function getToken(value) {
     return window.localStorage.getItem('TYPHOON_SYS_TOKEN') + ''
 }
 export function  removeToken() {
     window.localStorage.removeItem('TYPHOON_SYS_TOKEN')
 }
