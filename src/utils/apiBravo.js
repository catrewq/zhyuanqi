const apis = {
  group: '/tax/basedata/socialfund/group',
  package: '/tax/basedata/socialfund/package',
  rate: '/tax/basedata/socialfund/rate',
  newRate: '/tax/basedata/socialfund/package/rate/effect',//有效社保公积金列表
  supplier: '/tax/basedata/supplier',
  supplierSec: '/tax/basedata/supplier/city/account',
  supplierTmp: '/tax/basedata/supplier/bill/template',
  city: '/system/city',
  cityPersonType: '/tax/basedata/city/person/type',
  contract: '/tax/ent/contract',
  authContract: '/tax/ent/contract/auth', // 查询权限范围下的合同
  groupProductEntry: '/tax/basedata/socialfund/group/product/entry',
  order: '/tax/bill/personal/order',//个人订单列表
  rptOrder: '/tax/bill/personal/order/rpt/confirm',//待确认列表

  customer: '/tax/ent/customer',
  entrySf: '/tax/bill/personal/order/log/entry/sf', //变更记录 社保公积金
  entryNs:'/tax/bill/personal/order/log/entry/ns' ,//非社保公积金 变更记录
  dispatchOrder: '/tax/bill/dispatch/order',
  dispatchOrderPre: '/tax/bill/dispatch/order/preserver',
  contracttmp: '/tax/person/contract/tmp/dynamic/fields/',
  account: '/tax/basedata/socialfund/account',
  price: '/tax/ent/quote/price',

  effect: '/tax/basedata/socialfund/package/rate/effect',
  billTmp: '/tax/basedata/customer/bill/template',
  orderDetailCust: '/tax/bill/personal/detail/cust/monthly',
  orderDetailSup: '/tax/bill/personal/detail/sup/monthly',
  orderDetailSalary: '/tax/bill/personal/detail/salary/monthly',
  orderConfirmDetail: '/tax/bill/personal/order/confirm/sup/prepare',
  billPersonalOrderConfirmSupSave: '/tax/bill/personal/order/confirm/sup/save',
  billPersonalOrderEntryConfirmSup:
    '/tax/bill/personal/order/entry/confirm/sup',

  personEntrySupCfmBillSave: '/tax/bill/personal/order/entry/confirm/sup/save',
  personEntryPreCfmBillSave: '/tax/bill/personal/order/entry/confirm/pre/save',
  personalPostCfmBill: '/tax/bill/personal/order/change/confirm/post/save',
  personalPreCfmBill: '/tax/bill/personal/order/change/confirm/pre/save',

  billPersonalOrderConfirmPrepare: '/tax/bill/personal/order/confirm/prepare',
  fee: '/tax/basedata/supplier/fee',
  personalOrderChange: '/tax/bill/personal/order/change',
  orderConfirmPrepare: '/tax/bill/personal/order/change/confirm/prepare',
  orderConfirm: '/tax/bill/personal/order/change/confirm/pre',
  orderConfirmPost: '/tax/bill/personal/order/change/confirm/post',
  customBillMonthUnchecked: '/tax/receive/custom/bill/month/unchecked',
  customBillGenerate: '/tax/receive/custom/bill/generate',
  socialfundGroupEntryNormal: '/tax/basedata/socialfund/group/entry/normal/',
  customBillTemplateFeeAcc: '/tax/basedata/customer/bill/template/fee/acc',

  personalOrderLogInfo: '/tax/bill/personal/order/log/info/',
  customerBill: '/tax/bill/receive/customer/bill',//客户账单
  supplierBill: '/tax/bill/receive/supplier/bill',//供应商账单
  residence: '/tax/basedata/residence/type',//户籍类型列表
  packageCustomer: '/tax/basedata/socialfund/package/customer',//参保账户/
  EmployContract: "/tax/person/contract",//新建员工列表
  staffInfo: '/tax/staff/info',//员工信息查询
  commercialInsurance: '/tax/finance/commercial/insurance', //商保列表
  amountCalc: '/tax/bill/personal/order/entry/amount/calc'
};

export default apis;
