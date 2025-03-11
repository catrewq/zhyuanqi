export const apis = {
  City: {
    List: "/system/city",
    provice: "/system/provice",
  },
  CityPersonType: {
    List: "/tax/basedata/city/person/type",
    //  这里为了不搞混，暂时先复写一下，后续在减构代码
    CityList: "/system/city",
  },
  ContractListCheck: {
    List: "/tax/ent/contract",
    AuthList: "/tax/ent/contract/auth",
    preserver: "/tax/ent/contract/person/preserver",
    contractserver:"tax/ent/contract/person/contractserver"
  },
  DisPatchOrder: {
    List: "/tax/bill/dispatch/order",
    CityList: "/system/city",
    ContractList: "/tax/ent/contract",
    //前道后道都是同一个接口传参不同，前道10后道11接单/合同专员12,供应商客服13
    CustomerList: "/system/user/role/setting/person",
    BillTemplate: "/tax/basedata/customer/bill/template",
    package_Customer: "/tax/basedata/socialfund/package/customer",
    QuotePrice: "/tax/ent/quote/price",
    SocialfundGroup: "/tax/basedata/socialfund/group",
    //baseStatuas 0正常，
    ContractTempalte: "/tax/ent/contract/template"
  },
  EmployContract: {
    List: "/tax/person/contract",
  },
  declareDimission: {
    //  这里为了不搞混，暂时先复写一下，后续在减构代码
    List: '/tax/bill/personal/dimission/apply',
    SocialfundGroup: '/tax/basedata/socialfund/group',
    dynamicFileds: '/tax/person/contract/tmp/dynamic/fields',
    orderList: '/tax/bill/personal/order',//个人订单列表
  },
  confirmDimission: {
    //这里的列表查的是个人订单的
    List: '/tax/bill/personal/dimission/apply',//申请离职列表
    postList: '/tax/bill/personal/dimission/confirm/post',//后道列表
    preList: '/tax/bill/personal/dimission/confirm/pre',//前道列表
    confirmPrepare: '/tax/bill/personal/order/confirm/prepare',//确认离职单准备接口前后道综合准备接口
    custMonthlyList: '/tax/bill/personal/detail/cust/monthly',//费用查看月
  },
  changePersonalOrder: {
    List: '/tax/bill/personal/order/change',//变更列表详情\
    order: '/tax/bill/personal/order',
    orderChangePrepare: '/tax/bill/personal/order/change/prepare',//变更单准备接口
    orderChangeSave: '/tax/bill/personal/order/change/save',//变更单保存接口
    generateMonthData: '/tax/bill/personal/order/change/generate/calc/data',
    amountCalc: '/tax/bill/personal/order/entry/amount/calc'
  },
  reportEntry: {
    orderList: '/tax/bill/personal/order',//批量入职
    dimissionList: '/tax/bill/personal/dimission',//批量离职
  },
  orderFeeList: {
    List: '/tax/dynamtic/rpt'
  },
  receivableOnceFee: {
    List: '/tax/bill/receive/customer/bill/entry',//应收管理-一次性费用查询
    billList: '/tax/bill/receive/customer/bill',//应收管理-账单查询（一次性费用添加）
    prepareSave: '/tax/receive/customer/bill/onetime/prepare/save',//一次性费用添加-验证数据
    customerUncheckedMonth: '/tax/receive/customer/bill/month/unchecked',//一次性费用添加-客户未核对月
  },
  supplierBill: {
    billList: '/tax/bill/receive/supplier/bill',//应付管理-供应商账单查询
    
  },
  receiveTemplate: {
    List: '/tax/basedata/customer/bill/template'
  },
  customerList: {
    List: '/tax/ent/customer'
  },
  payer: {
    List: '/tax/ent/quote/price',//报价单列表
  },
  quotebill: {
    List: '/tax/ent/payer',
  },
  entryEmploy: {
    List: '/tax/bill/personal/order/rpt/entry',//入职报表
  },
  dimissionEmploy: {
    List: '/tax/bill/personal/order/rpt/dimission',//离职报表
  },
  residence: {
    // List: '/tax/basedata/residence/type'//户籍类型列表
    List: '/bill/inspection'
    // List: '/fxiaoke/bill/inspection'
    
  },
  supplierContract: {
    List: "/tax/erp/sup/contract"
  },
  commercialInsurance: {
    List: "/tax/finance/commercial/insurance"
  },
  commercialInsuranceScheme: {
    List: "/tax/finance/commercial/insurance/scheme"
  },
  queryList: {
    // 存放查询列表里的接口
    typeList: '/tax/ent/invoice/type',//项目类别
    monthUnchecked: '/tax/receive/customer/bill/month/uncheck',//账单年月
    contributeType: '/tax/basedata/bill/contribute/type',//收费类型 -项目类别
    contributeTypeList: '/tax/basedata/bill/contribute',//收费明细 -项目名称
    billTmp: '/tax/basedata/customer/bill/template',
    fee: '/tax/basedata/supplier/fee',
    group: '/tax/basedata/socialfund/group',
    effect: '/tax/basedata/socialfund/package/rate/effect',
    price: '/tax/ent/quote/price',
    supplier: '/tax/basedata/supplier',
    supplierTmp: '/tax/basedata/supplier/bill/template',//供应商账单模板
    getEntByPage: 'system/taxCenterController/getTaxCenterByPage',//erp企业分公司
    subent: '/tax/contract/template/subent',//erp企业分公司
  },

};

