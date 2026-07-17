import React from "react";
import { TabRouteConfig } from "./RouteFunc";
import { Tab } from "./TabsMenu";

export function checkPassPath(path: string, items: Tab[], config: TabRouteConfig[], subPath?: string | number, parentPath?: string, subTitle?: string) {
    let _path = path;

    if (subPath !== undefined && subPath !== "") {
        if (typeof subPath == 'number') {
            _path = _path.substring(0, _path.length - subPath.toString().length - 4);
        }
        else {
            _path = _path.substring(0, _path.length - subPath.length - 4);
        }
    }

    if (parentPath !== undefined && parentPath !== "") {
        _path = _path.substring(0, _path.length - parentPath.length - 4);
    }

    //if (!hasPath) {
    const newItem = getNewTabItem(_path, path, config, subTitle);
    if (newItem !== undefined) {
        console.debug("add Path = " + path);
        const arg = [...items, newItem];

        return getUniqueItems(arg, undefined);
    }
    //}

    return [];
}


/**
 * 获取config里路径对应的子页面
 * 
 * @param path 路径
 * @returns
 */
export function getNewTabItem(checkPath: string, truePath: string, config: TabRouteConfig[], subTitle?: string): Tab | undefined {
    if (!checkPath) {
        return undefined;
    }

    for (let index = 0; index < config.length; index++) {
        const element = config[index];

        if (element.path.toLowerCase() === checkPath) {
            return {
                key: truePath,
                label: element.title + (subTitle ? subTitle : ""),
                forceRender: false,
                children: (
                    <div className="z-tab-panel-frame" >
                        <div className={element.className}>
                            {element.element}
                        </div>
                    </div>
                ),
                crumbs: [element.title]
            }
        }

        //let parentTitle = element.title;
        let pathStart = element.path.replace("*", "");

        if (checkPath.startsWith(pathStart.toLowerCase())) {
            let pathEnd = checkPath.substring(pathStart.length, checkPath.length);
            let _c1: TabRouteConfig | null = null;

            if (element.children) {
                let _config = element.children.filter(e => {
                    return e.path.toLowerCase() === pathEnd.toLowerCase();
                });

                if (_config && _config.length > 0) {
                    _c1 = _config[0];
                }

            }

            if (_c1) {
                return {
                    key: truePath,
                    label: _c1.title + (subTitle ? subTitle : ""),
                    forceRender: false,
                    children: (
                        <div className="z-tab-panel-frame" >
                            <div className={_c1.className}>
                                {_c1.element}
                            </div>
                        </div>
                    ),
                    parentPath: _c1.parentPath,
                    crumbs: [element.title, _c1.title]
                };
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
    // 不计算面包屑
    return [] as string[];

    // if (!items) {
    //     return [];
    // }

    // const activeTab = items.filter(i => {
    //     return i.key === activeKey;
    // });

    // let crumbs: string[] = [];
    // if (activeTab && activeTab.length > 0) {
    //     crumbs = activeTab[0].crumbs ? activeTab[0].crumbs : [];
    // }
    // return crumbs;
}

export function getUniqueItems(items: Tab[], closePath: string | undefined) {
    let uniqueItems: Tab[] = [];
    let j = 0;
    for (let index = 0; index < items.length; index++) {
        const element = items[index];
        // 去除关闭的页面
        if (closePath && closePath === element.key) {
            continue;
        }

        let x = uniqueItems.filter(e => {
            return e.key === element.key;
        }).length;

        if (x > 0) {
            continue;
        }

        uniqueItems[j] = element;
        j++;
    }

    return uniqueItems;
}
