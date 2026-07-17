const apis = {
  queryByPage: "tax/socialFund/queryByPage",
  // uploadSocialFund: "tax/socialFund/uploadSocialFund",
  uploadSocialFund: "tax/entuser/socialfund/batch/upload",
  downSocialFund: "tax/socialFund/downSocialFund",
  queryInfo: "tax/socialFund/queryInfo",
  publish: "tax/socialFund/publish",
  deleteById: "tax/socialFund/deleteById",
  // 薪酬
  queryBatchByPage: "tax/salary/queryBatchByPage",
  // uploadSalary: "tax/salary/uploadSalary",
  uploadSalary: "tax/entuser/salary/batch/upload",
  deleteBatch: "tax/salary/deleteBatch",
  publishBatch: "tax/salary/publish",
  queryBatchInfoByPage: "tax/salary/queryBatchInfoByPage",
  deleteSalaryInfo: "tax/salary/deleteSalaryInfo",
  querySalaryInfo: "tax/salary/querySalaryInfo",
  getEntContractList: "system/entContract/getEntContractList",
};

export default apis;
