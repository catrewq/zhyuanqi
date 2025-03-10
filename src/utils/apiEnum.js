// 不解析ts的enum,因为ts的enum是双向的,而js的enum是单向的,
// 所以ts的enum在js中是一个对象, 而js的enum在ts中是一个数组
const SearchName = {
  IS_NULL: "search_IS_Null",
  NOT_NULL: "search_NOT_NULL",
  GT: "search_GT",
  LT: "search_LT",
  EQ: "search_EQ",
  GTE: "search_GTE",
  LTE: "search_LTE",
  LIKE: "search_LIKE",
  BETWEEN: "search_BETWEEN",
  IN: "search_IN",
  NOT_IN: "search_NOT_IN",
};

export default SearchName;
