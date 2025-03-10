import React from "react";
import { Route } from "react-router-dom";
import { Tab } from "./TabsMenu";
import { TabsMenuRef } from "./TabsMenuRef";

export interface TabRoute {
    path: string;
    element: React.ReactNode;
    func?: React.SetStateAction<string>;
}

export interface TabRouteConfig {
    path: string;
    title: string;
    element: React.ReactNode;
    isTabRouter: boolean;
    parentPath?: string;
    children?: TabRouteConfig[];
    redirect?: string;
    className?: string;
    func?: (key: React.SetStateAction<string>) => {};
}

export function checkIsTabRouter(path: TabRouteConfig) {
    return path.isTabRouter;
}

interface RefProps {
    config: TabRouteConfig[];
    changeCallback: (tabs: Tab[] | undefined) => void,
    //addTabFunc: TabMenuAddFunc;
    ref: React.ForwardedRef<any>;
}

const RouteFunc = (props: RefProps) => {
    const tabConfigs = props.config.filter(item => {
        return item.isTabRouter === true
    })

    const normalArr = props.config.filter(item => {
        return item.isTabRouter !== true
    }).map(
        (item: TabRouteConfig) => {
            return (
                <Route
                    path={item.path}
                    element={item.element}
                // key={item.path}
                >
                    {/* 递归调用，因为可能存在多级的路由 */}
                    {/* {item?.children && RouteFunc(item.children)} */}
                </Route>
            );
        }
    );

    const combined = [...normalArr,
    (
        <Route key="tabsMenus" path="/tab/*" element={<TabsMenuRef ref={props.ref} props={{ config: tabConfigs, changeCallback: props.changeCallback }} />} />
    )
    ]

    return combined;

}

export default RouteFunc;