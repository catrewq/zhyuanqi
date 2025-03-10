const insTypeList = [
  {
    label: '养老保险',
    value: 0,
  },
  {
    label: '医疗保险',
    value: 1,
  },
  {
    label: '失业保险',
    value: 2,
  },
  {
    label: '工伤保险',
    value: 3,
  },
  {
    label: '生育保险',
    value: 4,
  },
  {
    label: '大病保险',
    value: 5,
  },
  {
    label: '残疾保障金',
    value: 11,
  },
  {
    label: '工会费',
    value: 12,
  },
  {
    label: '采暖费',
    value: 13,
  },
  {
    label: '补充养老保险',
    value: 20,
  },
  {
    label: '补充医疗保险',
    value: 21,
  },
  {
    label: '补充工伤保险',
    value: 22,
  },
  {
    label: '住房公积金',
    value: 30,
  },
  {
    label: '补充住房公积金',
    value: 31,
  },
];

const roundTypeList = [
  {
    label: '四舍五入',
    value: 0,
  },
  {
    label: '向上进位',
    value: 1,
  },
  {
    label: '截位进取',
    value: 2,
  },
  {
    label: '先四舍五入再向上进位',
    value: 11,
  },
  {
    label: '先截位进取再向上进位',
    value: 12,
  },
];

const precisionList = [
  {
    label: '零位小数',
    value: 0,
  },
  {
    label: '一位小数',
    value: 1,
  },
  {
    label: '二位小数',
    value: 2,
  },
  {
    label: '精确值',
    value: 10,
  },
];

const ctbFreqList = [
  {
    label: '月',
    // value: 0, 
    value:10,
  },
  {
    label: '年（不足一年按年）',
    // value: 1,
    value:20,
  },
  {
    label: '年（不足一年按月）',
    // value: 2,
    value:21,
  },
];

const accountTypes = [
  { label: '大户', value: 1 },
  { label: '单立户', value: 2 },
  { label: '供应商', value: 3 },

];

export { insTypeList, roundTypeList, precisionList, ctbFreqList ,accountTypes };
