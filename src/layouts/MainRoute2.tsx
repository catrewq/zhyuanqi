
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

    { path: "*", title: "未找到页面", element: <Page404 />, isTabRouter: useTabRouter }
];


export default TabRoute;