// Note: API接口数据
import axios from "axios";
const baseURL = process.env.REACT_APP_BASE_URL;
export function fetchList(start, length, modulePath, data) {
  if (data) {
    // 构建查询字符串
    let query = "?";
    for (const key in data) {
      query += `${key}=${data[key]}&`;
    }
    // 去掉最后一个&
    query = query.slice(0, -1);
    return axios.get(baseURL + modulePath + `/list/${start}/${length}${query}`);
  } else {
    return axios.get(baseURL + modulePath + `/list/${start}/${length}`);
  }
}
export function fetchPage(number, length, modulePath) {
  return axios.get(baseURL + modulePath + `/page/${number}/${length}`);
}
export function fetchDetail(id, modulePath) {
  return axios.get(baseURL + modulePath + `/detail/${id}`);
}

export function create(data, modulePath) {
  return axios.post(baseURL + modulePath + "/create", data);
}
export function createBatch(data, modulePath) {
  return axios.post(baseURL + modulePath + "/create/batch", data);
}
export function update(data, modulePath) {
  return axios.put(baseURL + modulePath + "/update", data);
}
export function updateBatch(data, modulePath) {
  return axios.put(baseURL + modulePath + "/update/batch", data);
}
// export function remove(id, modulePath) {
//   return axios.delete(baseURL + modulePath + `/remove/${id}`);
// }
// export function removeBatch(data, modulePath) {
//   return axios.delete(baseURL + modulePath + "/remove/batch", { data });
// }

export function remove(id, modulePath) {
  return axios.request({
    method: 'delete',
    url: baseURL + modulePath + '/remove',
    data: id,
    headers: { "Content-Type": "application/json" },
  });
}

export function removeBatch(id, modulePath) {
  return axios.request({
    method: 'delete',
    url: baseURL + modulePath + '/remove/batch',
    data: [id],
    headers: { "Content-Type": "application/json" },
  });
}

export function postPage(data, modulePath) {
  return axios.post(baseURL + modulePath + "/post/page", data);
}
export function postDetail(data, modulePath) {
  return axios.post(baseURL + modulePath + "/post/detail", data);
}
export function postUpdate(data, modulePath) {
  return axios.post(baseURL + modulePath + "/post/update", data);
}
export function postRemove(data, modulePath) {
  return axios.post(baseURL + modulePath + "/post/remove", data);
}
// 发布
export function postPublish(id, modulePath) {
  return axios.put(baseURL + modulePath + `/publish/${id}`);
}
// 模板下载
// export function downloadTemplates(positionNo) {
//   if (positionNo) {
//     return axios.get(
//       `${baseURL}/tax/entuser/task/download/template?positionNo=${positionNo}`
//     );
//   } else {
//     return axios.get(`${baseURL}/tax/entuser/task/download/template`);
//   }
// }
// 同步上传
export function postUpload(data, modulePath) {
  return axios.post(baseURL + modulePath + "/upload", data);
}
// 异步上传
export function postUploadAsync(data, modulePath) {
  return axios.post(baseURL + modulePath + "/upload/asyn", data);
}
// 同步下载
export function postDownload(data, modulePath) {
  return axios.post(baseURL + modulePath + "/download", data);
}
// 异步下载
export function postDownloadAsync(data, modulePath) {
  return axios.post(baseURL + modulePath + "/download/asyn", data);
}

// get方法导出
export function fetchDownload(data, modulePath) {
  if (data) {
    // 构建查询字符串
    let query = "?";
    for (const key in data) {
      query += `${key}=${data[key]}&`;
    }
    // 去掉最后一个&
    query = query.slice(0, -1);
    return axios.get(baseURL + modulePath + `/download/asyn${query}`);
  } else {
    return axios.get(baseURL + modulePath + `/download/asyn`);
  }
}

export function disabled(id, modulePath) {
  return axios.disabled(baseURL + modulePath + `/disabled/${id}`);
}

export function fetchPutDownload(data, modulePath) {
  if (data) {
    // 构建查询字符串
    let query = "?";
    for (const key in data) {
      query += `${key}=${data[key]}&`;
    }
    // 去掉最后一个&
    query = query.slice(0, -1);
    return axios.get(baseURL + modulePath + `/download/output/asyn${query}`);
  } else {
    return axios.get(baseURL + modulePath + `/download/output/asyn`);
  }
}

// 带查询的detail接口
export function fetchDetailQuery(id, data, modulePath) {
  if (data) {
    // 构建查询字符串
    let query = "?";
    for (const key in data) {
      query += `${key}=${data[key]}&`;
    }
    // 去掉最后一个&
    query = query.slice(0, -1);
    return axios.get(baseURL + modulePath + `/detail/${id}${query}`);
  } else {
    return axios.get(baseURL + modulePath + `/detail/${id}`);
  }
}


// 一次性获取所有列表数据
export async function fetchAllData(modulePath) {
  // 首先获取数据的总数
  const response = await fetchList(0, 20, modulePath);
  const total = response.data.count; // 假设返回的数据中包含一个名为count的属性

  // 如果总数不超过10，直接返回初次查询的数据
  if (total <= 20) {
    return response.data;
  }

  // 如果总数超过10，再查询所有数据
  const allDataResponse = await fetchList(0, total, modulePath);
  return allDataResponse.data;
}

// 不适合查询，查询仍停留在10条那里
// export async function fetchAllData(modulePath) {
//   // 首先获取数据的总数
//   const response = await fetchList(0, 10, modulePath);
//   const total = response.data.count; // 假设返回的数据中包含一个名为count的属性

//   // 然后使用总数作为length参数来获取所有的数据
//   const allDataResponse = await fetchList(0, total, modulePath);

//   return allDataResponse.data;
// }




// 用法
// fetchAllData('/tax/ent/customer')
//   .then(allData => {
//     console.log(allData.data); // 打印所有的数据
//   })
//   .catch(error => {
//     console.error(error); // 打印错误信息
//   });

// 禁用、启用 批量

export async function handleBatchActions(resolve, reject, value, isStatus, url) {
  const actionUrl = isStatus ? `${url}/enable/batch` : `${url}/disable/batch`;
  try {
    const response = await axios({
      url: actionUrl,
      method: "put",
      data: value,
      headers: { "Content-Type": "application/json" },
    });
    return response;
  } catch (error) {
    console.error("Error in handleBatchActions:", error);
    reject(error);
  }
}




// 禁用、启用 单个
export async function handleActions(resolve, reject, value, isStatus, url) {
  const actionUrl = isStatus ? `${url}/enable` : `${url}/disable`;
  return axios({
    url: actionUrl,
    method: "put",
    data: value,
    headers: { "Content-Type": "application/json" },
  });
}