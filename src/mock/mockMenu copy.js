export const menuData = {
  success: true,
  rtnCode: 200,
  rtnMessage: "请求成功",
  data: {
    menu: [
      {
        id: 350,
        parentId: 0,
        name: "社保/公积金比例",
        menuKey: "socialFundRate",
        type: 1,
        children: [

          {
            id: 351,
            parentId: 350,
            name: "社保/公积金比例",
            menuKey: "socialFundRateList",
            type: 2,
            path: "socialFundRate/List",
            buttons: []
          },
        ]
      }, {
        id: 360,
        parentId: 0,
        name: "社保/公积金组",
        menuKey: "socialFundGroup",
        type: 1,
        children: [

          {
            id: 361,
            parentId: 360,
            name: "社保/公积金组",
            menuKey: "socialFundGroupList",
            type: 2,
            path: "socialFundGroup/List",
            buttons: []
          },
        ]
      }, {
        id: 370,
        parentId: 0,
        name: "社保/公积金套餐",
        menuKey: "socialFundPackage",
        type: 1,
        children: [

          {
            id: 371,
            parentId: 370,
            name: "社保/公积金套餐",
            menuKey: "socialFundPackageList",
            type: 2,
            path: "socialFundPackage/List",
            buttons: []
          },
        ]
      },
      {
        id: 314,
        parentId: 0,
        name: "员工管理",
        type: 1,
        menuKey: "staff",
        sort: "1",
        children: [
          {
            id: 315,
            parentId: 314,
            name: "花名册",
            type: 2,
            path: "staff/roster",
            menuKey: "roster",
            sort: "2"
          }
        ]
      },
      {
        id: 306,
        parentId: 0,
        name: "数据导入",
        type: 1,
        menuKey: "data",
        sort: "13",
        children: [
          {
            id: 308,
            parentId: 306,
            name: "社保公积金",
            type: 2,
            path: "data/social",
            menuKey: "social",
            sort: "3"
          }
        ]
      },
      {
        id: 309,
        parentId: 0,
        name: "分公司管理",
        type: 1,
        menuKey: "branch",
        sort: "14",
        children: [
          {
            id: 310,
            parentId: 309,
            name: "商务合同",
            type: 2,
            path: "branch/businessContract",
            menuKey: "businessContract",
            sort: "2"
          },
          {
            id: 311,
            parentId: 309,
            name: "分公司",
            type: 2,
            path: "branch/branchList",
            menuKey: "branchList",
            sort: "3"
          }
        ]
      },
      {
        id: 312,
        parentId: 0,
        name: "客户管理",
        type: 1,
        menuKey: "customer",
        sort: "15",
        children: [
          {
            id: 313,
            parentId: 312,
            name: "客户",
            type: 2,
            path: "customer/customerList",
            menuKey: "customerList",
            sort: "2"
          }
        ]
      },
      {
        id: 322,
        parentId: 0,
        name: "导入模板管理",
        type: 1,
        menuKey: "template",
        sort: "16",
        children: [
          {
            id: 323,
            parentId: 322,
            name: "导入模板管理",
            type: 2,
            path: "template/salary",
            menuKey: "salary",
            sort: "1"
          }
        ]
      },
      {
        id: 326,
        parentId: 0,
        name: "招聘管理",
        type: 1,
        menuKey: "recruit",
        sort: "17",
        children: [
          {
            id: 327,
            parentId: 326,
            name: "招聘岗位",
            type: 2,
            path: "recruit/position",
            menuKey: "position",
            sort: "1"
          },
          {
            id: 328,
            parentId: 326,
            name: "简历库",
            type: 2,
            path: "recruit/resumeLib",
            menuKey: "resumeLib",
            sort: "2"
          }
        ]
      },
      {
        id: 301,
        parentId: 0,
        name: "电子签管理",
        type: 1,
        menuKey: "esign",
        sort: "2",
        children: [
          {
            id: 317,
            parentId: 301,
            name: "签约模板",
            type: 2,
            path: "esign/eTemplate",
            menuKey: "eTemplate",
            sort: "2"
          },
          {
            id: 318,
            parentId: 301,
            name: "签约管理",
            type: 2,
            path: "esign/eTask",
            menuKey: "eTask",
            sort: "3"
          },
          {
            id: 329,
            parentId: 301,
            name: "签约人员查询",
            type: 2,
            path: "esign/user",
            menuKey: "eTaskUser",
            sort: "4"
          }
        ]
      },
      {
        id: 319,
        parentId: 0,
        name: "应收账单",
        type: 1,
        menuKey: "receivable",
        sort: "7",
        children: [
          {
            id: 321,
            parentId: 319,
            name: "应收账单",
            type: 2,
            path: "receivable/socialfund",
            menuKey: "bill",
            sort: "1"
          }
        ]
      },
      {
        id: 320,
        parentId: 0,
        name: "服务办理",
        type: 1,
        menuKey: "payable",
        sort: "8",
        children: [
          {
            id: 307,
            parentId: 320,
            name: "工资条",
            type: 2,
            path: "payable/salary",
            menuKey: "salary",
            sort: "10"
          },
          {
            id: 324,
            parentId: 320,
            name: "应付账单",
            type: 2,
            path: "payable/bill",
            menuKey: "bill",
            sort: "2"
          }
        ]
      },
      {
        id: 330,
        parentId: 0,
        name: "账号创建",
        menuKey: "manager",
        type: 1,
        children: [
          {
            id: 331,
            parentId: 330,
            name: "账号创建",
            menuKey: "account",
            type: 2,
            path: "manager/account",
            buttons: []
          },
          // {
          //   id: 332,
          //   parentId: 330,
          //   name: "修改密码",
          //   menuKey: "resetPassword",
          //   type: 2,
          //   path: "manager/resetPassword",
          //   buttons: []
          // }
        ]
      },
      // {
      //   id: 330,
      //   parentId: 0,
      //   name: "城市管理",
      //   menuKey: "city",
      //   type: 1,
      //   path:"city/list",
      // },
      {
        id: 331,
        parentId: 0,
        name: "基础数据维护",
        menuKey: "baseStatus",
        type: 1,
        children: [
          {
            id: 331,
            parentId: 330,
            name: "城市维护",
            menuKey: "city",
            type: 2,
            path: "baseStatus/city",
            buttons: []
          },
          {
            id: 332,
            parentId: 330,
            name: "城市人员类别",
            menuKey: "cityPersonType",
            type: 2,
            path: "baseStatus/cityPersonType",
            buttons: []
          },
        ]
      },
      {
        id: 334,
        parentId: 0,
        name: "系统管理",
        menuKey: "systemManage",
        type: 1,
        children: [
          // {
          //   id: 335,
          //   parentId: 334,
          //   name: "组织架构管理",
          //   menuKey: "orifginStrut",
          //   type: 2,
          //   path: "systemManage/orifginStrut",
          //   buttons: []
          // },
          // {
          //   id: 336,
          //   parentId: 334,
          //   name: "角色管理",
          //   menuKey: "roles",
          //   type: 2,
          //   path: "systemManage/roles",
          //   buttons: []
          // },
          // {
          //   id: 337,
          //   parentId: 334,
          //   name: "组织架构管理",
          //   menuKey: "tree",
          //   type: 2,
          //   path: "systemManage/tree",
          //   buttons: []
          // },
          // {
          //   id: 338,
          //   parentId: 334,
          //   name: "树形Plus",
          //   menuKey: "trees",
          //   type: 2,
          //   path: "systemManage/trees",
          //   buttons: []
          // },
          {
            id: 339,
            parentId: 334,
            name: "组织架构管理",
            menuKey: "org",
            type: 2,
            path: "systemManage/org",
            buttons: []
          },
          {
            id: 338,
            parentId: 334,
            name: "角色管理",
            menuKey: "roleManage",
            type: 2,
            path: "systemManage/roleManage",
            buttons: []
          },

        ]
      },
      {
        id: 340,
        parentId: 0,
        name: "组织架构用户查询",
        menuKey: "systemManageList",
        type: 1,
        children: [

          {
            id: 341,
            parentId: 340,
            name: "角色管理",
            menuKey: "userList",
            type: 2,
            path: "systemManageList/userList",
            buttons: []
          },
        ]
      },
      {
        id: 342,
        parentId: 0,
        name: "参保账户",
        menuKey: "insuredAccountPage",
        type: 1,
        children: [

          {
            id: 343,
            parentId: 342,
            name: "参保账户维护",
            menuKey: "insuredAccount",
            type: 2,
            path: "insuredAccountPage/insuredAccount",
            buttons: []
          },
        ]
      },
      {
        id: 345,
        parentId: 0,
        name: "商务合同",
        menuKey: "contractList",
        type: 1,
        children: [

          {
            id: 346,
            parentId: 345,
            name: "商务合同查看",
            menuKey: "contractListCheck",
            type: 2,
            path: "contractList/contractListCheck",
            buttons: []
          },
        ]
      },
      {
        id: 346,
        parentId: 0,
        name: "应收账单模板管理",
        menuKey: "receiveTemplateList",
        type: 1,
        children: [
          {
            id: 347,
            parentId: 345,
            name: "应收账单模板管理查看",
            menuKey: "receiveTemplate",
            type: 2,
            path: "receiveTemplateList/receiveTemplate",
            buttons: []
          },
        ]
      },
      {
        id: 348,
        parentId: 0,
        name: "派接单管理",
        menuKey: "dispatchOrderList",
        type: 1,
        children: [
          {
            id: 349,
            parentId: 348,
            name: "派接单管理查看",
            menuKey: "dispatchOrder",
            type: 2,
            path: "dispatchOrderList/dispatchOrder",
            buttons: []
          },
          // {
          //   id: 350,
          //   parentId: 348,
          //   name: "穿梭框",
          //   menuKey: "transfer",
          //   type: 2,
          //   path: "dispatchOrderList/transfer",
          //   buttons: []
          // },
        ]
      },
      {
        id: 350,
        parentId: 0,
        name: "员工合同管理",
        menuKey: "employContractManagement",
        type: 1,
        children: [
          {
            id: 351,
            parentId: 350,
            name: "员工合同管理查看",
            menuKey: "employContract",
            type: 2,
            path: "employContractManagement/employContract",
            buttons: []
          },
        ]
      },
      {
        id: 352,
        parentId: 0,
        name: "离职人员查询",
        menuKey: "dimissionEmploy",
        type: 1,
        children: [
          {
            id: 353,
            parentId: 352,
            name: "离职人员",
            menuKey: "dimission",
            path: "dimissionEmploy/dimission",
            buttons: []
          },
        ]
      },
      {
        id: 354,
        parentId: 0,
        name: "入职人员查询",
        menuKey: "entryEmploy",
        type: 1,
        children: [
          {
            id: 355,
            parentId: 354,
            name: "入职人员",
            menuKey: "entry",
            path: "entryEmploy/entry",
            buttons: []
          },
        ]
      },
      {
        id: 356,
        parentId: 0,
        name: "批量申报",
        type: 1,
        menuKey: "reportEntry",
        sort: "8",
        children: [
          {
            id: 357,
            parentId: 356,
            name: "批量申报离职",
            type: 2,
            path: "reportEntry/salary",
            menuKey: "salary",
            sort: "10"
          },
          {
            id: 324,
            parentId: 320,
            name: "批量申报入职",
            type: 2,
            path: "reportEntry/bill",
            menuKey: "bill",
            sort: "2"
          }
        ]
      },
      {
        id: 358,
        parentId: 0,
        name: "申报离职",
        type: 1,
        menuKey: "declareDimission",
        sort: "8",
        children: [
          {
            id: 359,
            parentId: 358,
            name: "申报离职",
            type: 2,
            path: "declareDimission/declare",
            menuKey: "declare",
            sort: "10"
          }
        ]
      },
      {
        id: 360,
        parentId: 0,
        name: "确认离职",
        type: 1,
        menuKey: "confirmDimission",
        sort: "8",
        children: [
          {
            id: 361,
            parentId: 360,
            name: "确认离职",
            type: 2,
            path: "confirmDimission/confirm",
            menuKey: "confirm",
            sort: "10"
          }
        ]
      },
      {
        id: 362,
        parentId: 0,
        name: "变更个人订单",
        type: 1,
        menuKey: "changePersonalOrder",
        sort: "8",
        children: [
          {
            id: 363,
            parentId: 362,
            name: "变更订单",
            type: 2,
            path: "changePersonalOrder/changePersonal",
            menuKey: "changePersonal",
            sort: "10"
          }
        ]
      },
      {
        id: 364,
        parentId: 0,
        name: "订单费用",
        type: 1,
        menuKey: "personalFeeList",
        sort: "8",
        children: [
          {
            id: 365,
            parentId: 364,
            name: "订单费用查询",
            type: 2,
            path: "personalFeeList/personalFee",
            menuKey: "personalFee",
            sort: "10"
          },
          {
            id: 366,
            parentId: 364,
            name: "动态表单demo",
            type: 2,
            path: "personalFeeList/mockDemo",
            menuKey: "mockDemo",
            sort: "10"
          }
        ]
      },
      // 后期英文名需要修改
      // {
      //   id: 367,
      //   parentId: 0,
      //   name: "应收账单",
      //   type: 1,
      //   menuKey: "receivableOnceFee",
      //   sort: "8",
      //   children: [
      //     {
      //       id: 368,
      //       parentId: 367,
      //       name: "应收帐单一次性费用查询",
      //       type: 2,
      //       path: "receivableOnceFee/List",
      //       menuKey: "list",
      //       sort: "10"
      //     },
      //     {
      //       id: 369,
      //       parentId: 368,
      //       name: "应收账单一次性费用添加",
      //       type: 2,
      //       path: "receivableOnceFee/Add",
      //       menuKey: "Add",
      //       sort: "2"
      //     }
      //   ]
      // },
      {
        id: 370,
        parentId: 0,
        name: "供应商账单",
        type: 1,
        menuKey: "supplierBill",
        sort: "8",
        children: [
          {
            id: 371,
            parentId: 370,
            name: "供应商账单一次性费用查询",
            type: 2,
            path: "supplierBill/supOneTimeChargeList",
            menuKey: "supOneTimeChargeList",
            sort: "10"
          },
          {
            id: 372,
            parentId: 370,
            name: "供应商账单一次性费用添加",
            type: 2,
            path: "supplierBill/supOneTimeChargeAdd",
            menuKey: "supOneTimeChargeAdd",
            sort: "2"
          },
          {
            id: 373,
            parentId: 370,
            name: "账单生成与重算",
            type: 2,
            path: "supplierBill/supplierBillGen",
            menuKey: "supplierBillGen",
            sort: "2"
          },
          {
            id: 374,
            parentId: 370,
            name: "账单锁定解锁",
            type: 2,
            path: "supplierBill/supplierBillLock",
            menuKey: "supplierBillLock",
            sort: "2"
          },
          {
            id: 375,
            parentId: 370,
            name: "账单打印",
            type: 2,
            path: "supplierBill/supplierBillExport",
            menuKey: "supplierBillExport",
            sort: "2"           
          }

        ]
      },
      {
        id: 372,
        parentId: 0,
        name: "客户报价单查看",
        type: 1,
        menuKey: "payer",
        sort: "8",
        children: [
          {
            id: 373,
            parentId: 372,
            name: "客户报价单",
            type: 2,
            path: "payer/list",
            menuKey: "list",
            sort: "10"
          }
        ]
      },
      {
        id: 373,
        parentId: 0,
        name: "付款方查看",
        type: 1,
        menuKey: "quotebill",
        sort: "8",
        children: [
          {
            id: 374,
            parentId: 373,
            name: "付款方",
            type: 2,
            path: "quotebill/list",
            menuKey: "list",
            sort: "10"
          }
        ]
      },
      {
        id: 377,
        parentId: 0,
        name: "应收账单",
        type: 1,
        menuKey: "customBill",
        sort: "8",
        children: [
          {
            id: 376,
            parentId: 377,
            name: "应收账单一次性费用查询",
            type: 2,
            path: "customBill/custOneTimeChargeList",
            menuKey: "custOneTimeChargeList",
            sort: "10"
          },
          {
            id: 377,
            parentId: 377,
            name: "应收账单一次性费用添加",
            type: 2,
            path: "customBill/custOneTimeChargeAdd",
            menuKey: "custOneTimeChargeAdd",
            sort: "10"
          },
          {
            id: 378,
            parentId: 377,
            name: "账单生成与重算",
            type: 2,
            path: "customBill/customBillGen",
            menuKey: "customBillGen",
            sort: "10"
          },
          {
            id: 379,
            parentId: 377,
            name: "账单锁定解锁",
            type: 2,
            path: "customBill/customBillLock",
            menuKey: "customBillLock",
            sort: "10"
          },
          // {
          //   id: 380,
          //   parentId: 377,
          //   name: "账单打印",
          //   type: 2,
          //   path: "customBill/customBillExport",
          //   menuKey: "customBillExport",
          //   sort: "10"
          // },
          {
            id: 381,
            parentId: 377,
            name: "账单打印",
            type: 2,
            path: "customBill/customBillExport",
            menuKey: "customBillExport",
            sort: "10"
          },
        ]
      },
      // 开始1.5 从340开始
      {
        id: 340,
        parentId: 0,
        name: "户籍类型维护",
        menuKey: "registeredResidence",
        type: 1,
        children: [
          {
            id: 341,
            parentId: 340,
            name: "户籍类型列表",
            menuKey: "list",
            type: 2,
            path: "registeredResidence/list",
            buttons: []
          },
        ]
      },
      {
        id: 345,
        parentId: 0,
        name: "应收账单模板管理优化",
        type: 1,
        menuKey: "ReceiveTemplateListSecound",
        sort: "8",
        children: [
          {
            id: 346,
            parentId: 345,
            name: "应收账单模板管理优化查看",
            type: 2,
            path: "receiveTemplateListSecound/receiveTemplate",
            menuKey: "receiveTemplate",
            sort: "10"
          },
        ]
      },
      {
        id: 342,
        parentId: 0,
        name: "供应商管理",
        menuKey: "supplier",
        type: 1,
        children: [
          {
            id: 343,
            parentId: 342,
            name: "供应商管理列表",
            menuKey: "list",
            type: 2,
            path: "supplier/list",
            buttons: []
          },
          {
            id: 344,
            parentId: 342,
            name: "供应商城市账户管理列表",
            menuKey: "sec",
            type: 2,
            path: "supplier/sec",
            buttons: []
          },
        ]
      },
    ],
  },
}

