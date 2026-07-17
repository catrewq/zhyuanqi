import { Tabs } from "antd";
import React, { useState } from "react";
import { useTabLocation, useTabNavigate, XTabNavProps } from "src/utils/navigateUtil";
import FixHeader from "./FixHeader";
import TabRoute from "./MainRoute2";
import { TabRouteConfig } from "./RouteFunc";
import { Tab } from "./TabsMenu";
import { checkPassPath, getCurrentCrumbs, getNewTabItem, getUniqueItems } from "./TabsMenuCheckUtils";
import TabsMenuContext, { changeArgs } from "./TabsMenuContext";

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

interface RefProps {
    config: TabRouteConfig[];
    changeCallback: (tabs: Tab[] | undefined) => void,
}

// 子组件
export const TabsMenuRef = React.forwardRef((refProp: { props: RefProps }, ref) => {

    const { state, props } = useTabLocation();
    const navigate = useTabNavigate();

    const path: string = (props ? props.xPath : "") as string;
    const config = refProp.props.config;

    const [nextTabPath, setNextTabPath] = useState("");

    // path = combinedPath(path, page.currentTabPath);
    const [activeKey, setActiveKey] = useState(path);

    const initItems = checkPassPath(path, [], config, undefined, undefined, undefined);
    const initCrumbs = getCurrentCrumbs(initItems, path);

    const [items, setItems] = useState(initItems);

    const [page, setTabPage] = useState(
        {
            tabFirstRender: true,
            lastTabPath: "",
            currentTabPath: path,
            currentCrumbs: initCrumbs,
        }
    )

    const [porps, setProps] = useState({ xPath: path } as XTabNavProps);

    const changeCallback = refProp.props?.changeCallback;

    // 当组件挂载后，将这个组件的实例传递给父组件
    React.useImperativeHandle(ref, () => ({
        addTabMenuBySider: (path: string, callback: (items: Tab[] | undefined) => void) => {
            // 直接调用才能修改参数
            return handleMenuTabAdd(path, callback);
        }
    }));

    const handleMenuTabChange = (args: changeArgs, callback: (refresh: boolean) => void) => {

        // 新增页签或者切换页签或者 关闭页签
        const refresh = (args.items.length !== items.length) || (args.path !== page.currentTabPath);

        if (args.props.xRefesh === undefined) {
            args.props.xRefesh = refresh;
        }
        if (!args.path) {
            return;
        }

        const { currentPath, pSubPath, subPath }: { currentPath: string; pSubPath: string | undefined; subPath: string | undefined; } = getPropsByPath(args.path);
        const path = currentPath.toLocaleLowerCase() + (pSubPath ? ("/p::" + pSubPath) : "") + (subPath ? ("/s::" + subPath) : "");
        const closePath = args.props?.xClosePage;

        const _props = args.props;
        const uniqueItems: Tab[] = getUniqueItems(args.items, closePath);

        // 如果和现有状态不符，则刷新状态
        if (refresh) {
            console.debug("menu tab change = " + path);

            // 获取面包屑
            const crumbs: string[] = args.crumbs ? args.crumbs : getCurrentCrumbs(uniqueItems, path);

            setTabPage({
                tabFirstRender: false,
                lastTabPath: page.currentTabPath,
                currentTabPath: path,
                currentCrumbs: crumbs,
            });

            setProps(_props);

            setItems(uniqueItems);
            setActiveKey(path);
        } else {
            const refresh2 = uniqueItems.length !== items.length;

            if (refresh2) {
                //openTabs = uniqueItems;
                setItems(uniqueItems);
                setActiveKey(args.path);
            }
            if (callback !== undefined) {
                callback(refresh2);
            }

            return;
        }

        if (callback !== undefined) {
            callback(refresh);
        }

        //navigate(path)

    };

    const handleMenuTabAdd = (path: string, callback: (items: Tab[] | undefined) => void) => {

        let checkSuccess = false;
        let _path = path.toLowerCase();

        for (let index = 0; index < TabRoute.length; index++) {
            const element = TabRoute[index];
            const checkPath = element.path.toLowerCase();
            if (!element.isTabRouter) {
                continue;
            }

            if (checkPath === _path) {
                checkSuccess = true;
                break;
            }
            let pathStart = checkPath.replace("*", "");
            if (_path.startsWith(pathStart)) {
                checkSuccess = true;

                break;
            }
        }


        if (checkSuccess) {
            console.debug("menu tab redirect = " + _path);
            const uniqueItems = checkPassPath(_path, items, config, undefined, undefined, undefined);
            const currentCrumbs = getCurrentCrumbs(uniqueItems, _path);

            if (uniqueItems) {
                //this.setStats();
                setItems(uniqueItems);
            }

            const { currentPath, pSubPath, subPath }: { currentPath: string; pSubPath: string | undefined; subPath: string | undefined; } = getPropsByPath(_path);

            setProps({ xPath: currentPath, xPaPath: pSubPath, xSubPath: subPath, xState: { state: { xPath: currentPath } }, xRefesh: false });

            setTabPage({
                tabFirstRender: false,
                lastTabPath: page.currentTabPath,
                currentTabPath: _path,
                currentCrumbs: currentCrumbs,
            });

            setActiveKey(_path);

            if (callback) {
                callback(uniqueItems);
            }

        } else {
            // navigate(path);
        }

    };

    const handleCheckIsOpenTab = (checkPath: string): boolean => {
        const checkRet = items.filter((item) => item.key === checkPath);
        return checkRet && checkRet.length > 0;
    }

    const onTabClick = (key: string) => {
        if (key === activeKey) {

        }
        else {
            console.debug("change Path = " + key);
            const currentCrumbs = getCurrentCrumbs(items, key);

            const { currentPath, pSubPath, subPath }: { currentPath: string; pSubPath: string | undefined; subPath: string | undefined; } = getPropsByPath(key);

            setProps({ xPath: currentPath, xPaPath: pSubPath, xSubPath: subPath, xState: { state: { xPath: currentPath } }, xRefesh: false });

            setTabPage({
                tabFirstRender: false,
                lastTabPath: page.currentTabPath,
                currentTabPath: key,
                currentCrumbs: currentCrumbs,
            });

            setActiveKey(key);
        }
    }

    const onEdit = (
        targetKey: React.MouseEvent | React.KeyboardEvent | string,
        action: 'add' | 'remove',
    ) => {
        if (action === 'add') {
            //add("bd/supplier/cityAccount");
        } else {
            remove(targetKey);
        }
    };


    const remove = (targetKey: TargetKey) => {
        //removeTab(path, items, targetKey as string, changeCallback, xState);
        let newActiveKey = activeKey;
        let lastIndex = -1;

        items.forEach((item, i) => {
            if (item.key === targetKey) {
                lastIndex = i - 1;
            }
        });

        // 如果现在已经时最后一页，则不允许删除
        if (items.length === 1) {
            return;
        }

        const newPanes = items.filter((item) => item.key !== targetKey);
        if (newPanes.length && newActiveKey === targetKey) {
            if (lastIndex >= 0) {
                newActiveKey = newPanes[lastIndex]?.key;
            } else {
                newActiveKey = newPanes[0].key;
            }
        }

        if (newPanes.length === 0) {
            // TODO 跳转登录首页
        }

        setItems(newPanes);
        if (newActiveKey) {
            const currentCrumbs = getCurrentCrumbs(newPanes, newActiveKey);
            const { currentPath, pSubPath, subPath }: { currentPath: string; pSubPath: string | undefined; subPath: string | undefined; } = getPropsByPath(newActiveKey);

            setProps({ xPath: currentPath, xPaPath: pSubPath, xSubPath: subPath, xState: { state: { xPath: currentPath } }, xRefesh: false });

            setTabPage({
                tabFirstRender: false,
                lastTabPath: page.currentTabPath,
                currentTabPath: newActiveKey,
                currentCrumbs: currentCrumbs,
            });

            setActiveKey(newActiveKey);

            if (changeCallback) {
                changeCallback(newPanes);
            }
        } else {

        }

    }

    const add = (newKey: string) => {
        const newActiveKey = newKey;
        const newTab: Tab | undefined = getNewTabItem(newKey, newKey, config);
        if (newTab) {
            setItems([...items, newTab]);
            setActiveKey(newActiveKey);
        }
    };

    const handleGetCurrentProps = () => {
        return porps;
    }

    const getTab = () => {
        return items;
    }

    const setTab = (tabs: Tab[]) => {
        setItems(tabs);
    }

    return (
        <TabsMenuContext.Provider
            value={{
                //openTabs: items,
                isFirstRender: page.tabFirstRender,
                last: page.lastTabPath,
                current: page.currentTabPath,
                next: nextTabPath,
                getTabs: getTab,
                setTabs: setTab,
                changeFunc: handleMenuTabChange,
                addFunc: handleMenuTabAdd,
                checkIsOpen: handleCheckIsOpenTab,
                props: handleGetCurrentProps
            }}
        >
            <div>
                <FixHeader></FixHeader>
                <Tabs hideAdd id='tabs' type="editable-card" activeKey={activeKey} onTabClick={onTabClick} onEdit={onEdit} items={items}  >

                </Tabs>
            </div>
        </TabsMenuContext.Provider>
    );

});

function getPropsByPath(key: string) {
    let _currentPath = key;
    let _subPath: string | undefined;
    let _pSubPath: string | undefined;

    const subPathIndex = _currentPath.lastIndexOf("/s::");
    if (subPathIndex > 0) {
        _subPath = _currentPath.substring(subPathIndex + 4, _currentPath.length);
        _currentPath = _currentPath.substring(0, subPathIndex);
    }

    const subPathIndex2 = _currentPath.lastIndexOf("/p::");
    if (subPathIndex2 > 0) {
        _pSubPath = _currentPath.substring(subPathIndex2 + 4, _currentPath.length);
        _currentPath = _currentPath.substring(0, subPathIndex2);
    }

    const currentPath = _currentPath;
    const subPath: string | undefined = _subPath;
    const pSubPath: string | undefined = _pSubPath;
    return { currentPath, pSubPath, subPath };
}

function combinedPath(path: string, currentPath: string) {
    if (path === "" || path === undefined) {
        path = currentPath;
    }
    else if (path !== undefined && path.startsWith("../")) {
        let split = currentPath.lastIndexOf("/");
        if (split > 0) {
            let _path = currentPath.substring(0, split + 1);
            path = _path + path.replace("../", "");
        } else {
            //
        }
    }
    return path.toLowerCase();
}