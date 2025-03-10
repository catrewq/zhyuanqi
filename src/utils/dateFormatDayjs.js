import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

// 没有添加字符串和数组格式转化，可以直接写dayjs

// import { DatePicker } from 'antd';
// import dayjs from 'dayjs';
// const checkDate = "2024-07-08";
// const formattedDate = dayjs(checkDate);
// <DatePicker defaultValue={formattedDate} onChange={(date) => handleDateChange(date, record)} />

// export const dateFormat = (date, format) => {
//   if (!date) {
//     return '';
//   }
//   const formats = ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DD', 'YYYY-MM', 'YYYYMM'];
//   const parsedDate = dayjs(date, formats);
//   return parsedDate.isValid() ? parsedDate.format(format) : '';
// };

// export const dateFormat = (date, format) => {
//   if (!date) {
//     return '';
//   }
//   const formats = ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DD', 'YYYY-MM', 'YYYYMM'];
//   const parsedDate = dayjs(date, formats);
//   return parsedDate.isValid() ? parsedDate.format(format) : '';
// };

// 需要注意使用条件 ，不确定对，需要条件多覆盖测试
export const dateFormat = (date, format) => {
  // console.log(date, '初始');
  if (!date) {
    return '';
  }

  // 没有值直接返回null，避免转化空日期为0
  if (date === null || date === undefined || date === 0) {
    return null; // 直接返回 null
  }

  // 添加排除掉date日期本身是 "202407" 或者 202407 满足提交条件
  const dateString = String(date); // 确保 date 是字符串格式
  if (/^\d{6}$/.test(dateString) || /^\d{8}$/.test(dateString)) {
    // console.log(dateString, '数字');
    return dateString;
  }

  const formats = ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DD', 'YYYY-MM', 'YYYYMM'];
  const parsedDate = dayjs(date, formats);
  return parsedDate.isValid() ? parsedDate.format(format) : '';
};







// export const dateFormat = (date, format) => {
//   if (!date) {
//     return '';
//   }

//   // 如果 date 是数字，将其转换为 Date 对象
//   if (typeof date === 'number') {
//     date = new Date(date);
//   }

//   // 如果 date 是字符串，尝试解析为 Date 对象
//   if (typeof date === 'string') {
//     const parsedDate = dayjs(date, ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DD', 'YYYY-MM', 'YYYYMM']);
//     if (parsedDate.isValid()) {
//       date = parsedDate.toDate();
//     }
//   }

//   // 如果 date 是 Date 对象，则使用 dayjs 格式化
//   if (date instanceof Date) {
//     const parsedDate = dayjs(date);
//     return parsedDate.isValid() ? parsedDate.format(format) : '';
//   }

//   // 其他情况，直接返回空字符串
//   return '';
// };

//bug
// 日期报错
// 显示（日期格式不统一，比如选择的是MM格式，但是后端传过来的
// 可能是数字或字符串，做的dateFomat只处理了  const formats = ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DD', 'YYYY-MM', 'YYYYMM'];
// 提交
// 从后端传过来的本来就有值，直接dateFomat处理日期会显示错误，需要判断是否是日期格式，可能是字符串或数字

// 过滤有空数组[]和空字段的值和过滤数组里的空值 -不确定对
export const filterEmptyValues = (obj) => {
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item != null && item !== '')
      .map(item => (typeof item === 'object' ? filterEmptyValues(item) : item));
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v != null && v !== '' && (!Array.isArray(v) || v.length > 0))
        .map(([k, v]) => [k, filterEmptyValues(v)])
    );
  }
  return obj;
};


// export const formatCollectStartDate = (date, format) => {
//   if (date instanceof Date) {
//     // 如果是 Date 对象，格式化为 YYYYMMDD
//     return Number(dateFormat(date, format));
//   } else if (typeof date === 'string' && !isNaN(Date.parse(date))) {
//     // 如果是有效的日期字符串，转换为 Date 对象后格式化
//     return Number(dateFormat(new Date(date), format));
//   } else if (date && date.$d instanceof Date) {
//     // 如果是 M 对象，使用其内部的 Date 对象
//     return Number(dateFormat(date, format));
//   } else {
//     // 否则，直接返回原有值
//     return date;
//   }
// }

//需要注意使用条件 ，不确定对，需要条件多覆盖测试
export const getMoment = (value) => {
  if (!value) return null;

  // 判断是否为数字
  if (typeof value === 'number' || /^\d+$/.test(value)) {
    // 将数字转换为字符串，按 'YYYYMM' 格式解析
    return dayjs(String(value), 'YYYYMM');
  }

  // 其他情况按默认处理
  return dayjs(value);
}

