import axios, { AxiosRequestConfig } from "axios";
// 测试
// const baseURL = "https://hroapitest.zanhua.com.cn";
// 正式
// const baseURL = "https://hroapi2.zanhua.com.cn";
// 实验
const baseURL = process.env.REACT_APP_BASE_URL;
export class Api {
  static fetchList<T extends AxiosRequestConfig>(
    start: number,
    length: number,
    modulePath: string,
    data: T
  ) {
    return axios.get(baseURL + modulePath + `/list/${start}/${length}`, data);
    // console.log(baseURL + modulePath + `/list/${start}/${length}`, data);
  }
  static fetchPage(number: number, length: number, modulePath: string) {
    return axios.get(baseURL + modulePath + `/page/${number}/${length}`);
  }

  static fetchDetail(id: string, modulePath: string) {
    return axios.get(baseURL + modulePath + `/detail/${id}`);
  }

  static create(data: any, modulePath: string) {
    return axios.post(baseURL + modulePath + "/create", data);
  }

  static createBatch(data: any, modulePath: string) {
    return axios.post(baseURL + modulePath + "/create/batch", data);
  }

  static update(data: any, modulePath: string) {
    return axios.put(baseURL + modulePath + "/update", data);
  }

  static updateBatch(data: any, modulePath: string) {
    return axios.put(baseURL + modulePath + "/update/batch", data);
  }

  static remove(id: string, modulePath: string) {
    return axios.delete(baseURL + modulePath + `/remove/${id}`);
  }

  static removeBatch(data: any, modulePath: string) {
    return axios.delete(baseURL + modulePath + "/remove/batch", { data });
  }

  static postPage(data: any, modulePath: string) {
    return axios.post(baseURL + modulePath + "/post/page", data);
  }

  static postDetail(data: any, modulePath: string) {
    return axios.post(baseURL + modulePath + "/post/detail", data);
  }

  static postUpdate(data: any, modulePath: string) {
    return axios.post(baseURL + modulePath + "/post/update", data);
  }

  static postRemove(data: any, modulePath: string) {
    return axios.post(baseURL + modulePath + "/post/remove", data);
  }
}
