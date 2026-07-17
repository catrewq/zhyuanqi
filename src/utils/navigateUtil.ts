import { useContext } from "react";
import { NavigateOptions, To, useLocation, useNavigate } from "react-router-dom";
import TabRoute from "src/layouts/MainRoute2";
import { TabRouteConfig } from "src/layouts/RouteFunc";
import { Tab } from "src/layouts/TabsMenu";
import { checkPassPath } from "src/layouts/TabsMenuCheckUtils";
import TabsMenuContext from "src/layouts/TabsMenuContext";

export interface NavOption extends NavigateOptions {
    /**
     * 是否新增页面（查询对应详情等）
     */
    add?: boolean // 新增页面
    /**
     * 子路径
     */
    subPath?: string | number// 子路径
    /**
     * 子标签
     */
    subTitle?: string// 子标签
}

export interface NavFunc {
    (to: To, options?: NavOption): void;
    //(delta: number): void;
}

export interface XTabNavProps {
    xPath: string;
    xSubPath?: string;
    xPaPath?: string;
    xTitle?: string;
    xRefesh?: boolean;
    xClosePage?: string;

    xState?: any;
}

export interface Location<State = any> {
    state: State;
    props: XTabNavProps;
    key: string;
}

export function useTabLocation(): Location {
    const context = useContext(TabsMenuContext);
    const location = useLocation();

    const tabConfigs = TabRoute.filter(item => {
        return item.isTabRouter === true
    });

    function handleCheckTabLoc() {
        const props: XTabNavProps = context.props();
        const currentPath: string = context.current;
        let pathMode = 1;

        let pathName = location.pathname;
        let subPath = null;
        let pSubPath = null;

        // 解析 props 中的路径参数
        if (props && props.xPath) {
            pathName = "/tab/" + props.xPath;
        }

        if (pathName.startsWith("/tab/")) {
            pathName = pathName.replace("/tab/", "");
            let lastIndex = pathName.lastIndexOf("/s::");
            if (lastIndex > 0) {
                subPath = pathName.substring(lastIndex + 4, pathName.length);
                pathName = pathName.substring(0, lastIndex);
            }

            let lastIndex2 = pathName.lastIndexOf("/p::");
            if (lastIndex2 > 0) {
                pSubPath = pathName.substring(lastIndex2 + 4, pathName.length);
                pathName = pathName.substring(0, lastIndex2);
            }

            if (!checkIsTabRouter(pathName, undefined, tabConfigs)) {
                pathMode = 1;
            }
            else {
                pathMode = 0;
            }
        }
        else {
            pathMode = 1;
        }

        // tab页签数据重组
        if (pathMode === 0) {

            let xState: any = props ? (props.xState) : (location.state?.xState);
            if (subPath) {
                if (props) {
                    props.xSubPath = subPath;
                }
                else if (xState) {
                    xState.subPath = subPath;
                }
            }
            if (pSubPath) {
                if (props) {
                    props.xPaPath = pSubPath;
                }
                else if (xState) {
                    xState.pSubPath = pSubPath;
                }
            }


            // 路径为tab页签，但是没有任何参数，浏览器输入导致
            if (!location.state) {
                return { key: location.key, pathName: pathName, state: xState, props: props };
            }

            if (props) {
                props.xState = xState;
            // 兼容历史方案
                if (location.state) {
                    props.xState = { ...location.state, ...xState };
                    props.xPath = location.state.xPath;
                    props.xTitle = location.state.xTitle;
                }

                // 不刷新则path维持当前path
                if (props.xRefesh === false) {
                    props.xPath = currentPath;
                }

            }

            return { key: location.key, pathName: location.state.xPath, state: xState, props: props };
        } else {
            return { ...location, props: props };
        }

    }

    return handleCheckTabLoc();
}

export function useTabNavigate(): NavFunc {
    const navigate = useNavigate();
    const context = useContext(TabsMenuContext);

    const tabConfigs = TabRoute.filter(item => {
        return item.isTabRouter === true
    });

    function handleCheckTabNav(to: To, options?: NavOption) {
        if (options?.subPath !== undefined) {
            if (typeof (options?.subPath) != 'number'
                && typeof (options?.subPath) != 'string') {
                throw new Error("Options subPath only support number or string type");
            }
        }

        const lastPath = context?.last;
        let currentPath = context.current;
        const isFirstRender = context.isFirstRender;
        let subPath: string | undefined;
        let pSubPath: string | undefined;
        //const props: XTabNavProps = context.props();

        // if (context && props) {
        //     subPath = props.xSubPath;
        //     pSubPath = props.xPaPath;
        //     currentPath = props.xPath; //
        // }
        
        // 从路径中拆分子路径：id

        let subPathIndex = currentPath.lastIndexOf("/s::");
        if (subPathIndex > 0) {
            subPath = currentPath.substring(subPathIndex + 4, currentPath.length);
            currentPath = currentPath.substring(0, subPathIndex);
        }

        let subPathIndex2 = currentPath.lastIndexOf("/p::");
        if (subPathIndex2 > 0) {
            pSubPath = currentPath.substring(subPathIndex2 + 4, currentPath.length);
            currentPath = currentPath.substring(0, subPathIndex2);
        }


        let pathMode = 1; // 0 普通路由 10 tab跳转  11 tab 关闭并跳转 12 tab 新增 

        let truePath: string | undefined = undefined;
        let parentPath: string | undefined = undefined;
        let newTab: boolean;

        if (typeof to == 'string') {
            truePath = checkIsTabRouter(to, currentPath, tabConfigs);
            if (truePath !== undefined) {
                // 路径存在，则跳转tab页面
                // 分析参数，如果参数中有 add 则无条件新增页签
                if (options && options.add) {
                    if (!options.subPath) {
                        console.warn("新增跳转必须配置 subPath");
                        pathMode = 10;
                    }
                    else {
                        if (subPath !== undefined && subPath !== "") {
                            pathMode = 13; // 既有s 也有p
                        } else {
                            pathMode = 12;
                        }
                    }
                }
                else if (subPath !== undefined && subPath !== "") {
                    if (pSubPath) {
                        subPath = "{s::" + subPath + ",p::" + pSubPath + "}";
                    }

                    pathMode = 14;
                }
                else {
                    pathMode = 10;
                }
            }
            else {
                pathMode = 0;
                newTab = false;
            }

        } else if (typeof to == 'number') {
            // 如果使用的 -1 则传递关闭页面参数
            if (to === -1) {
                // 获取parent 页面路径
                parentPath = checkParentRouter(currentPath, tabConfigs);

                pathMode = 11;// 关闭本页面
                newTab = false;
            }
            else {
                // 其他情况使用正常跳转（tab页也可以正常跳转）
                pathMode = 0;
                newTab = false;
            }

        } else {
            pathMode = 0;
            newTab = false;
        }

        let checkedTabs = context?.getTabs();

        // 如果尚未初始化
        if (!context || checkedTabs.length === 0) {
            navigate("/tab/" + truePath, { state: { xPath: truePath, xState: options?.state, xTitle: options?.subTitle } });
        }
        else if (truePath !== undefined && isFirstRender) {
            navigate("/tab/" + truePath, { state: { xPath: truePath, xState: options?.state, xTitle: options?.subTitle } });
        }
        // tab 页签存在，进行跳转
        else if (pathMode === 10 && truePath !== undefined) {
            checkedTabs = checkTabs(truePath, checkedTabs, undefined, undefined, options?.subTitle);

            const crumbs: string[] = getCurrentCrumbs(checkedTabs, truePath);
            const porps: XTabNavProps = { xPath: truePath, xState: options?.state, xTitle: options?.subTitle };
            context.changeFunc({ path: truePath, crumbs: crumbs, items: checkedTabs, props: porps, reset: false },
                (refresh) => {
                    //navigate("/tab/" + truePath, { state: { xPath: truePath, xState: options?.state, xTitle: options?.subTitle } });
                }
            );

            //navigate("/tab/" + truePath, { state: { xPath: truePath, xState: options?.state, xTitle: options?.subTitle } });
        }
        // 关闭页签
        else if (pathMode === 11 && currentPath !== undefined && parentPath !== undefined) {
            let passPath: string;

            if (pSubPath) {
                passPath = gePasstUri(currentPath, pSubPath);
            }
            else {
                passPath = parentPath;
            }
            checkedTabs = checkTabs(passPath, checkedTabs, subPath, pSubPath, options?.subTitle);

            const closePath = gePasstUri(currentPath, subPath, pSubPath);

            const crumbs: string[] = getCurrentCrumbs(checkedTabs, passPath);
            const porps: XTabNavProps = { xPath: passPath, xState: options?.state, xTitle: options?.subTitle, xClosePage: closePath };
            context.changeFunc({ path: passPath, crumbs: crumbs, items: checkedTabs, props: porps, reset: false },
                (refresh) => {
                    //navigate("/tab/" + passPath, { state: { xPath: passPath, closePage: closePath } });
                }
            );

            //navigate("/tab/" + passPath, { state: { xPath: passPath, closePage: closePath } });
        }
        else if (pathMode === 12 && truePath !== undefined && options && options.subPath !== undefined) {
            const passPath = gePasstUri(truePath, options.subPath);
            checkedTabs = checkTabs(passPath, checkedTabs, options.subPath as string, undefined, options?.subTitle);

            const crumbs: string[] = getCurrentCrumbs(checkedTabs, passPath);
            const porps: XTabNavProps = {
                xPath: passPath, xState: options?.state,
                xTitle: options?.subTitle,
                xSubPath: options.subPath as string
            };
            context.changeFunc({ path: passPath, crumbs: crumbs, items: checkedTabs, props: porps, reset: false },
                (refresh) => {
                    //navigate("/tab/" + passPath, { state: { xPath: passPath, xState: options?.state, xSubPath: options.subPath, xTitle: options?.subTitle } });
                }
            );

            //navigate("/tab/" + passPath, { state: { xPath: passPath, xState: options?.state, xSubPath: options.subPath, xTitle: options?.subTitle } });
        }
        else if (pathMode === 13 && truePath !== undefined && subPath !== undefined && options && options.subPath !== undefined) {
            const passPath = gePasstUri(truePath, options.subPath, subPath);
            checkedTabs = checkTabs(passPath, checkedTabs, options.subPath as string, subPath, options?.subTitle);

            const crumbs: string[] = getCurrentCrumbs(checkedTabs, passPath);
            const porps: XTabNavProps = {
                xPath: passPath, xState: options?.state,
                xTitle: options?.subTitle,
                xSubPath: options.subPath as string,
                xPaPath: subPath
            };
            context.changeFunc({ path: passPath, crumbs: crumbs, items: checkedTabs, props: porps, reset: false },
                (refresh) => {
                    //navigate("/tab/" + passPath, { state: { xPath: passPath, xState: options?.state, xSubPath: options.subPath, xPaPath: subPath, xTitle: options?.subTitle } });
                }
            );

            //navigate("/tab/" + passPath, { state: { xPath: passPath, xState: options?.state, xSubPath: options.subPath, xPaPath: subPath, xTitle: options?.subTitle } });
        }
        else if (pathMode === 14 && truePath !== undefined && subPath !== undefined && options && options.subPath !== undefined) {
            const passPath = gePasstUri(truePath, undefined, subPath);
            checkedTabs = checkTabs(passPath, checkedTabs, undefined, subPath, options?.subTitle);

            const crumbs: string[] = getCurrentCrumbs(checkedTabs, passPath);
            const porps: XTabNavProps = {
                xPath: passPath, xState: options?.state,
                xTitle: options?.subTitle,
                xSubPath: undefined,
                xPaPath: subPath
            };
            context.changeFunc({ path: passPath, crumbs: crumbs, items: checkedTabs, props: porps, reset: false },
                (refresh) => {
                    //navigate("/tab/" + passPath, { state: { xPath: passPath, xState: options?.state, xSubPath: options.subPath, xPaPath: subPath, xTitle: options?.subTitle } });
                }
            );

            // navigate("/tab/" + passPath, { state: { xPath: passPath, xState: options?.state, xSubPath: subPath, xTitle: options?.subTitle } });
        }
        else if (typeof to == 'number') {
            if (to === -1 && lastPath) {
                let _lastPath = lastPath;

                let subPathIndex = _lastPath.lastIndexOf("/s::");
                if (subPathIndex > 0) {
                    subPath = _lastPath.substring(subPathIndex + 4, _lastPath.length);
                    _lastPath = _lastPath.substring(0, subPathIndex);
                }

                let subPathIndex2 = lastPath.lastIndexOf("/p::");
                if (subPathIndex2 > 0) {
                    pSubPath = _lastPath.substring(subPathIndex2 + 4, _lastPath.length);
                    _lastPath = _lastPath.substring(0, subPathIndex2);
                }

                const passPath = gePasstUri(_lastPath, subPath, pSubPath);
                checkedTabs = checkTabs(passPath, checkedTabs, subPath, pSubPath, options?.subTitle);

                const crumbs: string[] = getCurrentCrumbs(checkedTabs, passPath);
                const porps: XTabNavProps = {
                    xPath: passPath, 
                    xState: {},
                    // xTitle: options?.subTitle,
                    xSubPath: subPath,
                    xPaPath: pSubPath
                };
                context.changeFunc({ path: passPath, crumbs: crumbs, items: checkedTabs, props: porps, reset: false },
                    (refresh) => {
                        //navigate("/tab/" + passPath, { state: { xPath: passPath, xState: options?.state, xSubPath: options.subPath, xPaPath: subPath, xTitle: options?.subTitle } });
                    }
                );
            }
            else {
                navigate(to);

            }

        }
        else {
            navigate(to, options);
        }

        function gePasstUri(path: string, s?: string | number, p?: string) {
            let temp = path;
            if (p && p.length > 0) {
                temp = `${temp}/p::${p}`;
            }
            if (s && typeof (s) == 'number') {
                temp = `${temp}/s::${s.toString()}`;
            }
            else if (s && typeof (s) == 'string' && s.length > 0) {
                temp = `${temp}/s::${s}`;
            }

            return temp;
        }

    }

    return handleCheckTabNav;


    function checkTabs(truePath: string, checkedTabs: Tab[], s?: string, p?: string, t?: string) {
        const newTab = context.checkIsOpen(truePath);
        if (!newTab && truePath) {
            let temp = checkPassPath(truePath, checkedTabs, tabConfigs, s, p, t);
            if (temp && temp.length > 0) {
                checkedTabs = temp;
            }
        }
        return checkedTabs;
    }
}


function checkIsTabRouter(path: string, current: string | undefined, configs: TabRouteConfig[]): string | undefined {
    let check = path.toLowerCase();
    if (check.startsWith("/")) {
        check = check.substring(1, check.length);
    }

    for (let index = 0; index < configs.length; index++) {
        const parent = configs[index];

        if (parent.path.toLowerCase() === check) {
            return parent.path.toLowerCase();
        }

        if (parent.children === undefined || parent.children.length === 0) {
            continue;
        }

        let pathStart = parent.path.replace("*", "").toLowerCase();

        // 根据当前页面位置进行路由，必须以../开头
        if (check.startsWith("../") && current !== undefined) {
            // 回退一个路径
            let uri = check.substring(2, check.length).toLowerCase();
            const splitInt = current.lastIndexOf("/");

            let trueCheckPath = current.substring(0, splitInt) + uri;
            // 目前只测两层，不进行递归
            if (trueCheckPath.startsWith(pathStart)) {
                for (let index = 0; index < parent.children.length; index++) {
                    const child = parent.children[index];
                    const childURL = pathStart + child.path.toLowerCase();
                    if (childURL === trueCheckPath) {
                        return trueCheckPath;
                    }

                }
            }
        }
        // 根据当前页面位置进行路由，必须以./开头
        else if (check.startsWith("./") && current !== undefined) {
            let uri = check.substring(1, check.length).toLowerCase();
            // 使用当前路径
            // const splitInt = current.lastIndexOf("/");

            let trueCheckPath = current + uri;
            // 目前只测两层，不进行递归
            if (trueCheckPath.startsWith(pathStart)) {
                for (let index = 0; index < parent.children.length; index++) {
                    const child = parent.children[index];
                    const childURL = pathStart + child.path.toLowerCase();
                    if (childURL === trueCheckPath) {
                        return trueCheckPath;
                    }

                }
            }
        }
        else {
            // 目前只测两层，不进行递归
            if (check.startsWith(pathStart)) {
                let uri = check.substring(pathStart.length, check.length).toLowerCase();

                for (let index = 0; index < parent.children.length; index++) {
                    const child = parent.children[index];
                    if (child.path.toLowerCase() === uri) {
                        return check;
                    }

                }
            }
        }

    }

    return undefined;

}


function checkParentRouter(current: string, configs: TabRouteConfig[]): string | undefined {
    //const check = current.toLowerCase();

    for (let index = 0; index < configs.length; index++) {
        const parent = configs[index];

        if (parent.path.toLowerCase() === current) {
            return parent.path.toLowerCase();
        }

        if (parent.children === undefined || parent.children.length === 0) {
            continue;
        }

        let pathStart = parent.path.replace("*", "").toLowerCase();

        // 根据当前页面位置进行路由，必须以../开头
        // 目前只测两层，不进行递归
        if (current.startsWith(pathStart)) {
            for (let index = 0; index < parent.children.length; index++) {
                const child = parent.children[index];
                const childURL = pathStart + child.path.toLowerCase();
                if (childURL === current && child.parentPath) {
                    return pathStart + child.parentPath.toLowerCase();
                }

            }
        }

    }

    return undefined;

}

/**
 * 获取当前页面面包屑数据
 * @param items 
 * @param activeKey 
 * @returns 
 */
export function getCurrentCrumbs(items: Tab[], activeKey: string): string[] {
    if (!items) {
        return [];
    }

    const activeTab = items.filter(i => {
        return i.key === activeKey;
    });

    let crumbs: string[] = [];
    if (activeTab && activeTab.length > 0) {
        crumbs = activeTab[0].crumbs ? activeTab[0].crumbs : [];
    }
    return crumbs;
}
