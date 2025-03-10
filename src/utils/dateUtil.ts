//  如果日期对象存在，函数就会返回格式化后的日期，否则返回空字符串 
import moment, { Moment } from "moment";

export const xDateFormat = (date: moment.MomentInput, format: string) => {
  if (!date) {
    return null;
  }
  let _moment: Moment;
  if ((typeof (date) == "object")) {
    let _temp: any = date;
    // 兼容未知的 datapicker返回的结果
    _moment = moment(_temp.$d);
  } else {
    _moment = moment(date);
  }
  console.debug(_moment);

  return _moment.format(format);
}