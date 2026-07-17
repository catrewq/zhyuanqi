import { Modal } from "antd";
import SearchName from "./apiEnum";
import moment from "moment";
const { info } = Modal;


// 字典转换
export const getGenericStatus = (status, map) => {
  let m = new Map(map);
  return m.get(status);
};


export const convertStringToNumber = (input, map) => {
  let conversionMap = new Map(map);
  return conversionMap.get(input);
};

// 用法
// let statusMap = [
//     [0, "否"],
//     [1, "是"],
//     ["default", ""],
//   ];
//   getGenericStatus(1, statusMap);  // 返回 "是"

// 判断是否是中文
export const isChinese = (text) => {
  var re = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
  return re.test(text);
}
// 用法
// postData.entryStatus = isChinese(postData.entryStatus) ? Number(getStatusNumber(postData.entryStatus)) : Number(postData.entryStatus);

// 公用confirm提示
export const showInfo = (text) => {
  info({
    closable: true,
    content: <p>{text}</p>,
    width: "400px",
  });
}
// 用法
// show("请先勾选,再进行操作!");

//  base64解码
export const decodeBase64 = (encodedString) => {
  var decodedString = atob(encodedString);
  return decodedString;
}

// base64编码 
export const encodedString = (decodedString) => {
  var encodedString = btoa(decodedString);
  return encodedString;
}


// 使用方法
// var encodedString = 'SGVsbG8gV29ybGQh';
// console.log(decodeBase64(encodedString)); // 输出：Hello World!

// 判断是否为数字
export const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
}
// 用法
// console.log(isNumber(123)); // 输出：true
// console.log(isNumber('Hello World!')); // 输出：false

// 直接过滤掉数组对象中的空值。
export const filterEmptyValues = (rows) => {
  return rows.filter(row => {
    return Object.values(row).every(value => value);
  });
}


export const removeEmptyAndNaN = (obj) => {
  // 创建一个新的对象，用于存储过滤后的数据
  const newObj = {};

  // 遍历对象的每一个键值对
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      // 如果值是对象，递归调用函数
      if (typeof value === 'object' && value !== null) {
        newObj[key] = Array.isArray(value)
          ? value.map(item => removeEmptyAndNaN(item))
          : removeEmptyAndNaN(value);
      } else if (value !== null && value !== undefined && !Number.isNaN(value)) {
        // 过滤掉 null、undefined 和 NaN
        newObj[key] = value;
      }
    }
  }

  return newObj;
}

// 示例数据
// const data = {
//   "isDoubleBase": false,
//   "name": "1",
//   "insType": 0,
//   "cityId": 24,
//   "entRate": 1,
//   "pslRate": 1,
//   "entRoundType": 0,
//   "pslRoundType": 0,
//   "entPrecision": 0,
//   "pslPrecision": 0,
//   "yearlyCtbFreq": 10,
//   "yearlyCtbMonth": null,
//   "entAddAmt": 0,
//   "entry": [
//     {
//       "startMonth": "202405",
//       "endMonth": "202409",
//       "entBaseRange": "1",
//       "pslBaseRange": "1",
//       "oprInfo": {
//         "operate": "ADD"
//       }
//     }
//   ],
//   "pslAddAmt": null
// };



// 过滤掉对象中的空值
// export const filterObjectEmptyValues = (obj) => {
//   let result = {};
//   Object.keys(obj).forEach(key => {
//     if (obj[key] === null || obj[key] === undefined || (Array.isArray(obj[key]) && obj[key].length)) {
//       //Do nothing
//     } else {
//       result[key] = obj[key];
//     }
//   });
//   return result;
// };
export const filterObjectEmptyValues = (obj) => {
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item != null && item !== '')
      .map(item => (typeof item === 'object' ? filterObjectEmptyValues(item) : item));
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v != null && v !== '' && (!Array.isArray(v) || v.length > 0))
        .map(([k, v]) => [k, filterObjectEmptyValues(v)])
    );
  }
  return obj;
};

// 过滤对象中的空值，包含数组
export const removeEmptyValues = (obj) => {
  for (var key in obj) {
    if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      removeEmptyValues(obj[key]);
    }
  }
  return obj;
}

// 使用
//   const filteredObj = removeEmptyValues(obj);

//对象参数，单一属性
export const getPostData_obj = (label) => {
  const obj = {};
  for (let key in label) {
    if (
      label[key] !== undefined &&
      label[key] !== null &&
      label[key] !== ""
    ) {
      // obj[`${SearchName.EQ}_${key}`] = label[key];
      obj[`${Array.isArray(label[key]) ? SearchName.IN : SearchName.EQ}_${key}`] = Array.isArray(label[key]) ? label[key].join(',') : label[key];
    }
  }
  return obj;
};

// 使用示例
// let labels = { phone: "phone" };
// let postData = getPostData_obj(labels);

// postData对象时就进行判断并删除空值
export const deleteEmpty = (postData) => {
  Object.keys(postData).forEach(key => {
    if (!postData[key]) {
      delete postData[key];
    }
  });
}

//  如果日期对象存在，函数就会返回格式化后的日期，否则返回空字符串
// export const dateFormat = (date, format) => {
//   return date ? moment(date).format(format) : null;
// }



// 使用示例
// render: (text) => (dateFormat(text, "YYYY-MM-DD")),
// obj.socialNotApplyMonth = dateFormat(obj.socialNotApplyMonth, "YYYY-MM");

// 公用函数来禁用早于给定日期的所有日期
export const disabledEndDate = (startMonth) => {
  return (endValue) => {
    if (!endValue || !startMonth) {
      return false;
    }
    return endValue.valueOf() <= startMonth.valueOf();
  }
}

// 字符串兼容数字排序(过滤掉空值)
export const createSorter = (dataIndex, isNumeric = false) => {
  return (a, b) => {
    if (!a[dataIndex] || !b[dataIndex]) return 0;
    return isNumeric ? a[dataIndex] - b[dataIndex] : a[dataIndex].localeCompare(b[dataIndex]);
  };
}

// 使用示例
// {
//   dataIndex: 'userName',
//   title: '用户名',
//   sorter: createSorter('userName'),
//   ellipsis: true,
//   width: 200,
// },
// {
//   dataIndex: 'cityType',
//   title: '城市类型',
// 数字排序，需要在后面加上true
//   sorter: createSorter('cityType', true),
//   ellipsis: true,
//   width: 200,
// }
// 数组对象转对象
export const toObject = (data) => {
  return data.reduce((obj, item) => {
    obj[item.id] = item;
    return obj;
  }, {})
}

// 单个属性组合成下拉框数组
export const getSelectOptions = (data, key) => {
  const selectOptions = [];

  if (!Array.isArray(data)) return [];

  for (let item of data) {
    const value = item[key];

    if (!selectOptions.includes(value)) {
      selectOptions.push(value);
    }
  }

  return selectOptions;
}

// 找到数组中某个属性值对应的值 ,应该只适用数组,不适合数组对象,没试过
export const queryList = (list, queryFields) => {

  // 过滤数据
  const filtered = list.filter(item => {
    return Object.keys(queryFields).every(key => {
      return item[key] === queryFields[key]
    });
  });

  // 提取字段
  const result = filtered.map(item => {
    return item[Object.keys(queryFields)[0]];
  });

  // return result.toString();//汉字
  return parseInt(result.toString());//数字
}

// 用法
// const entName = queryList(contractList, {
//   contractNo: uploadFormPosition.getFieldValue("contractNo")
// });

// // 也可以查询其他字段
// const ids = queryList(users, {
//   name: 'John'
// }, 'id');

// 根据name值，提交对应id（通常应用于编辑或新增）
export const getAttributeFromList = (list, attributeName, attributeValue, returnAttribute) => {
  const item = list.find(item => item[attributeName] === attributeValue);
  return item ? item[returnAttribute] : null;
}

// 使用方法
// let attributeName = 'name'; // 你要查找的属性名
// let attributeValue = postData.cityName; // 你要查找的属性值
// let returnAttribute = 'id'; // 你想要返回的属性
// postData.cityId = getAttributeFromList(provinceList, attributeName, attributeValue, returnAttribute);

// 根据对应的属性值，返回对应的对象
// 列表、属性名和属性值
export const findItemInList = (list, propName, propValue) => {
  return list.find(item => item[propName] === propValue);
}

// 使用方法
// onChange={(value) => {
//   const findItem = findItemInList(contractList, 'id', value);
//   formAddEdit.setFieldsValue({ receivableBankNo: findItem.contractNo});
//   formAddEdit.setFieldsValue({ receivableBankName: findItem.contractName });
// }}


// 定义字段
//  baseStatus 0 已发布 1 未发布 ,其它0皆不正常


// 查询过滤null undefined '' 的值
// 工具函数
export const filterQueryObject = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
          acc[key] = value;
      }
      return acc;
  }, {});
};












