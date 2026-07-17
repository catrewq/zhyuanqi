export enum SearchName {
  IS_NULL = "search_IS_Null",
  NOT_NULL = "search_NOT_NULL",
  GT = "search_GT",
  LT = "search_LT",
  EQ = "search_EQ",
  NE = "search_NE",
  GTE = "search_GTE",
  LTE = "search_LTE",
  LIKE = "search_LIKE",
  BETWEEN = "search_BETWEEN",
  IN = "search_IN",
  NOT_IN = "search_NOT_IN",

  // 以下为自定义
  //     IS_NULL("IS_NULL", " is null ", 0),
  //     NOT_NULL("NOT_NULL", " is not null ", 0),
  //     GT("GT", " > ", 1),
  //     LT("LT", " < ", 1),
  //     EQ("EQ", " = ", 1),
  //     NE("NE", " != ", 1),
  //     GTE("GTE", " >= ", 1),
  //     LTE("LTE", " <= ", 1),
  //     LIKE("LIKE", " LIKE ", 1),
  //     BETWEEN("BETWEEN", " BETWEEN ", 2),
  //     IN("IN", " IN ", 3),
  //     NOT_IN("NOT_IN", " not IN ", 3),
  //   使用为 return SearchName.EQ+"_id" // search_EQ_id
}
