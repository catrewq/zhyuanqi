
import React from 'react';

import PicData, { children as PicDataChildren } from "../pages/pic/index";
import Page404 from "../pages/error/404";
import { TabRouteConfig } from './RouteFunc';

export const hiddenSilderBtn = false;
export const printTabChangeLog = false;

/**
 * @deprecated v1.4.1 兼容 v1.0.6 历史菜单URI
 */
export const useOldURI = false;

const useTabRouter = false;

const TabRoute: TabRouteConfig[] = [

    { path: useOldURI ? "pic/*" : "pic/*", title: "巡检单", element: <PicData />, isTabRouter: useTabRouter, children: PicDataChildren },
    // { path: useOldURI ? "branch/*" : "cust/manager/*", title: "客户管理", element: <CustomerManager />, isTabRouter: useTabRouter, children: CustomerChildren },

    // { path: useOldURI ? "employee/*" : "employee/*", title: "员工管理", element: <Employee />, isTabRouter: useTabRouter, children: EmployeeChildren },

    // { path: useOldURI ? "dispatch/*" : "old/dispatch/*", title: "派接单管理", element: <OldPages />, isTabRouter: useTabRouter, children: dispatch_children },
    // { path: useOldURI ? "staff/*" : "old/staff/*", title: "花名册", element: <OldPages />, isTabRouter: useTabRouter, children: roster_children },
    // { path: useOldURI ? "esign/*" : "old/esign/*", title: "电子签管理", element: <OldPages />, isTabRouter: useTabRouter, children: esign_children },
    // { path: useOldURI ? "payable/*" : "old/payable/*", title: "工资条", element: <OldPages />, isTabRouter: useTabRouter, children: salary_children },
    // { path: useOldURI ? "staff/*" : "server/staff/*", title: "服务办理", element: <ServicePage />, isTabRouter: useTabRouter, children: serve_children },
    // { path: useOldURI ? "finance/*" : "finance/*", title: "财务管理", element: <Finance />, isTabRouter: useTabRouter, children: finance_children },
    // { path: useOldURI ? "system/*" : "system/*", title: "系统管理", element: <SystemManager />, isTabRouter: useTabRouter, children: SystemChildren },

    { path: "*", title: "未找到页面", element: <Page404 />, isTabRouter: useTabRouter }
];


export default TabRoute;