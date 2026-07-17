// import { message } from "antd";
import axios from "axios";
import qs from "qs";
import Cookies from 'js-cookie';

let contentType = "application/x-www-form-urlencoded;charset=UTF-8";

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
axios.defaults.headers["Content-Type"] = contentType;

axios.interceptors.request.use((config) => {
  // 从 cookies 中获取 token 和 sessionId
  const token = Cookies.get('token');
  const sessionId = Cookies.get('sessionId');
  
  axios.defaults.headers.common["token"] = token;
  axios.defaults.headers.common["appId"] = 3;

  if (sessionId) {
    config.headers.ssessionid = sessionId;
  }
  if (
    config.headers["Content-Type"] === contentType &&
    config.method === "post"
  ) {
    config.data = qs.stringify(config.data);
  }
  return config;
});

axios.interceptors.response.use(
  (res) => {
    const { success, rtnMessage, rtnCode, message } = res.data;
    // 如果是修改、删除、更新等涉及数据修改的请求，则从响应头中获取新的 sessionId 并存储
    if (res.config.method !== 'get' && res.config.url !== 'system/account/user/login' && res.config.url !== '/tax/download/info/oss/token') {
      const newSessionId = res.headers["ssessionid"];
      if (newSessionId) {
        Cookies.set("sessionId", newSessionId, { expires: 7 });
      }
    }

    if (message === "用户未登录" || message === "登录过期，请重新登录" || rtnCode === -9999) {
      // refreshToken();
      Cookies.remove('token');
      Cookies.remove('sessionId');
      window.location.href = "/";
    }

    const response = {
      data: res.data,
    };

    if (
      response.data ===
      '{"success":false,"rtnCode":-9999,"rtnMessage":"登录超时，请重新登录"}{"success":false,"rtnCode":-9999,"rtnMessage":"登录超时，请重新登录"}'
    ) {
      const jsonStrings = response.data
        .split("}{")
        .map((str: any, i: any) => (i === 0 ? str + "}" : "{" + str));
      const shouldRedirect = jsonStrings.some((str: any) => {
        const data = JSON.parse(str);
        return data.rtnCode === -9999;
      });
      if (shouldRedirect) {
        Cookies.remove('token');
        Cookies.remove('sessionId');
        window.location.href = "/";
      }
    }

    if (res.data instanceof Blob) {
      return res;
    }

    if (success) {
      return res;
    } else {
      if (message !== undefined) {
        console.log(message);
      }
      console.log(rtnMessage);
      return res;
    }
  },

  (error) => {
    console.error(error);

    if (error.response.status) {
      switch (error.response.status) {
        case 400:
          alert(error.response.data.error.details);
          break;
        case 401:
          alert("未授权，请登录");
          break;

        case 403:
          alert("拒绝访问");
          break;

        case 404:
          alert("请求地址出错");
          break;

        case 408:
          alert("请求超时");
          break;
        case 417:
          alert("预期失败");
          break;

        case 500:
          alert("服务器内部错误");
          break;

        case 501:
          alert("服务未实现");
          break;

        case 502:
          alert("网关错误");
          break;

        case 503:
          alert("服务不可用");
          break;

        case 504:
          alert("网关超时");
          break;

        case 505:
          alert("HTTP版本不受支持");
          break;
        default:
          alert(error.response.status + "网络请求不存在");
          break;
      }
      return Promise.reject(error.response);
    }
    return Promise.reject(error);
  }
);

export default axios;

