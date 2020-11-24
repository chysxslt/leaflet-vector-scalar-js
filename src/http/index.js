import config from '../config'
import axios from 'axios'
import Qs from 'qs'
import {Message,MessageBox} from  'element-ui'
import router from  '@/router'
import store from '@/store'
import Store from 'store2'

axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.crossDomain = true;
axios.defaults.withCredentials = true;  //设置cross跨域 并设置访问权限 允许跨域携带cookie信息
axios.defaults.headers.common['Authorization'] = ''; // 设置请求头为 Authorization
axios.defaults.timeout = config.httpTimeout; // 请求的失效时间


// http response 拦截器
axios.interceptors.response.use(
    (response) => {
      //拦截响应，做统一处理
      if (response.data.code > -1) {
        if (response.data.data == [] && response.data.data == ''){
          // Message({
          //   type:'warning',
          //   message:'数据获取失败,请稍后重试',
          //   center:true,
          //   offset:300
          // })
          return Promise.resolve(response)
        }else{
          return Promise.resolve(response)
        }
      }else {
        if (response.data.code == -2) {
          MessageBox.confirm('您未登录！请先登录后,再进行操作。是否登录?', '提示', {
            confirmButtonText: '登录',
            cancelButtonText: '取消',
            type: 'warning',
            center: true
          }).then(() => {
            store.commit('moduleSystem/SHOW_LOGIN_REGISTER')
          }).catch((e) => {
            console.log(e);
          });
          return Promise.resolve(response)
        } else if (response.data.code == -1) {
          // Message.error('未查询到数据,请重新选择时间',{
          //   center:true,
          //   top:500
          // })
          return Promise.resolve(response)
        } else {
          return Promise.resolve(response)
        }
      }
      store.commit('moduleMap/SET_LAYER_FLAG',true)
    },
    //接口错误状态处理，也就是说无响应时的处理
    (error) => {
      return Promise.reject(error.response.status) // 返回接口返回的错误信息
    })



// 重写 get post fromData
export default {
  /**
   * get方法，对应get请求
   * @param {String} url [请求的url地址]
   * @param {Object} params [请求时携带的参数]
   */
  get(url, params) {
    axios.defaults.baseURL = config.baseURL;
    try {
      return new Promise((resolve, reject) => {
        axios.get(url, {
          params: params
        }).then((d) => {
          // console.log('get===>',d)
          resolve(d.data)
        }).catch(err => {
          reject(err)
        })
      })
    }
    catch (e) {
      console.log(e)
    }
  },
  /**
   * delete方法，对应delete请求
   * @param {String} url [请求的url地址]
   * @param {Object} params [请求时携带的参数]
   */
  delete(url, params) {
    axios.defaults.baseURL = config.baseURL;
    return new Promise((resolve, reject) => {
      axios.delete(url, {
        params: params
      }).then(res => {
        // console.log('get===>',res)
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    }).catch((e) => {})
  },
  /**
   * post方法，对应post请求
   * @param {String} url [请求的url地址]
   * @param {Object} params [请求时携带的参数]
   */
  post(url, params) {
    axios.defaults.baseURL = config.baseURL;
    return new Promise((resolve, reject) => {
      axios.post(url, Qs.stringify(params))
        .then(res => {
          resolve(res.data)
        })
        .catch(err => {
          reject(err)
        })
    }).catch((e) => {})
  },
  listPost(url, params) {
    axios.defaults.baseURL = config.baseURL;
    return new Promise((resolve, reject) => {
      axios.post(url, params)
        .then(res => {
          resolve(res.data)
        })
        .catch(err => {
          reject(err)
        })
    }).catch((e) => {})
  },
  /**
   * formData，对应post请求，用来提交文件+数据
   * @param {String} url [请求的url地址]
   * @param {Object} params [请求时携带的参数]
   */
  formData(url, params) {
    axios.defaults.baseURL = config.baseURL;
    return new Promise((resolve, reject) => {
      axios({
        headers: {
          'Content-Type': 'multipart/form-data'// ;boundary=----WebKitFormBoundaryQ6d2Qh69dv9wad2u
        },
        transformRequest: [function (data) { // 在请求之前对data传参进行格式转换
          const formData = new FormData()
          Object.keys(data).forEach(key => {
            formData.append(key, data[key])
          })
          return formData
        }],
        url,
        method: 'post',
        data: params
      }).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    }).catch((e) => {})
  },
  /**
   * formData，对应post请求，用来提交文件+数据
   * @param {String} url [请求的url地址]
   * @param {Object} params [请求时携带的参数]
   */
  formDataAuth(url, params) {
    axios.defaults.baseURL = config.authURL;
    return new Promise((resolve, reject) => {
      axios({
        headers: {
          'Content-Type': 'multipart/form-data'// ;boundary=----WebKitFormBoundaryQ6d2Qh69dv9wad2u
        },
        transformRequest: [function (data) { // 在请求之前对data传参进行格式转换
          const formData = new FormData()
          Object.keys(data).forEach(key => {
            formData.append(key, data[key])
          })
          return formData
        }],
        url,
        method: 'post',
        data: params
      }).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    }).catch((e) => {})
  },
  /**
   * post方法，对应post请求，用于系统类接口使用
   * @param {String} url [请求的url地址]
   * @param {Object} params [请求时携带的参数]
   */
  systemPost(url, params) {
    axios.defaults.baseURL = config.authURL
    return new Promise((resolve, reject) => {
      axios.post(url, Qs.stringify(params))
        .then(res => {
          resolve(res.data)
        })
        .catch(err => {
          reject(err)
        })
    }).catch((e) => {})
  },
  /**
   * post方法，对应post请求，用于系统类接口使用
   * @param {String} url [请求的url地址]
   * @param {Object} params [请求时携带的参数]
   */
  systemGet(url, params) {
    axios.defaults.baseURL = config.authURL;
    return new Promise((resolve, reject) => {
      axios.get(url, {
        params: params
      }).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    }).catch((e) => {})
  },
  /**
   * formData，对应post请求，用于系统类接口使用
   * @param {String} url [请求的url地址]
   * @param {Object} params [请求时携带的参数]
   */
  systemForm(url, params) {
    axios.defaults.baseURL = config.authURL
    return new Promise((resolve, reject) => {
      axios({
        headers: {
          'Content-Type': 'multipart/form-data'// ;boundary=----WebKitFormBoundaryQ6d2Qh69dv9wad2u
        },
        transformRequest: [function (data) { // 在请求之前对data传参进行格式转换
          const formData = new FormData()
          Object.keys(data).forEach(key => {
            formData.append(key, data[key])
          })
          return formData
        }],
        url,
        method: 'post',
        data: params
      }).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    }).catch((e) => {})
  },
  /**
   * systemPut，对应Put请求，用于系统类接口使用
   * @param {String} url [请求的url地址]
   * @param {Object} params [请求时携带的参数]
   */
  systemPut(url, params) {
    axios.defaults.baseURL = config.authURL
    return new Promise((resolve, reject) => {
      axios({
        headers: {
          'Content-Type': 'multipart/form-data'// ;boundary=----WebKitFormBoundaryQ6d2Qh69dv9wad2u
        },
        transformRequest: [function (data) { // 在请求之前对data传参进行格式转换
          const formData = new FormData()
          Object.keys(data).forEach(key => {
            formData.append(key, data[key])
          })
          return formData
        }],
        url,
        method: 'put',
        data: params
      }).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    }).catch((e) => {})
  },
  /**
   * put方法，对应put请求
   * @param {String} url [请求的url地址]
   * @param {Object} params [请求时携带的参数]
   */
  put(url, params) {
    axios.defaults.baseURL = config.baseURL;
    return new Promise((resolve, reject) => {
      axios({
        headers: {
          'Content-Type': 'multipart/form-data'// ;boundary=----WebKitFormBoundaryQ6d2Qh69dv9wad2u
        },
        transformRequest: [function (data) { // 在请求之前对data传参进行格式转换
          const formData = new FormData()
          Object.keys(data).forEach(key => {
            formData.append(key, data[key])
          })
          return formData
        }],
        url,
        method: 'put',
        data: params
      }).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    }).catch((e) => {})
  },
}
