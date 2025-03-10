import { Tabs } from 'antd';
import React, { useContext, useState } from 'react';
import { useTabLocation, useTabNavigate, XTabNavProps } from 'src/utils/navigateUtil';
import FixHeader from './FixHeader';
import TabRoute from './MainRoute2';
import { TabRouteConfig } from './RouteFunc';
import { checkPassPath, getCurrentCrumbs, getNewTabItem, getUniqueItems } from "./TabsMenuCheckUtils";
import TabsMenuContext, { changeArgs, items as tabItems } from './TabsMenuContext';


type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

/**
 * 配置属性
 */
export interface MenuTabsProp {
  config: TabRouteConfig[];
}

export interface Tab {
  key: string;
  label: React.ReactNode;
  closable?: boolean;
  children: any
  parentPath?: string;
  forceRender?: boolean;
  crumbs?: string[];
}

const TabsMenu = (config: MenuTabsProp) => {
  //const context = useContext(TabsMenuContext);
  const { state, props } = useTabLocation();
  const navigate = useTabNavigate();

  // const currentPath = context.current.toLowerCase();
  // const lastPath = last.toLowerCase();

  let path: string = (props ? props.xPath : "") as string;
  const subPath: string | undefined = props ? props.xSubPath : undefined; // 子路径
  const parentPath: string | undefined = props ? props.xPaPath : undefined; // 子路径
  const subTitle: string | undefined = props ? props.xTitle : undefined; // 附加标题

  const refreshItem: boolean = props && props.xRefesh ? true : false;
  const closeTab: string | undefined = props ? props.xClosePage : undefined;

  const xState = state && state.xState ? state.xState : {};
  const [page, setTabPage] = useState(
    {
      tabFirstRender: true,
      lastTabPath: "",
      currentTabPath: "",
      currentCrumbs: [] as Array<string>,
      props: {} as XTabNavProps,
    }
  )
  const [nextTabPath, setNextTabPath] = useState("");
  //let crumbs: string[] = ["1", "2"];

  path = combinedPath(path, page.currentTabPath);
  const [activeKey, setActiveKey] = useState(path);

  const [items, setItems] = useState(tabItems);

  // useEffect(() => {
  //   setItems(context.openTabs);
  // }, [context.openTabs])

  // if (closeTab) {
  //   removeTab(path, items, closeTab, changeCallback, xState);
  // }
  // else {
  //   let hasPath = false;

  //   if (items) {
  //     const _items = context.getTrueTabs();
  //     const check = _items.filter(e => {
  //       return e.key.toLowerCase() === path;
  //     });
  //     if (check && check.length > 0) {
  //       hasPath = true;
  //     }
  //   }

  //   if (hasPath && path !== activeKey) {
  //     // if (changeCallback !== undefined) {
  //     //   const crumbs: string[] = getCurrentCrumbs(items, path);

  //     //   const _props: XTabNavProps = { xPath: path, xState: { ...xState }, xRefesh: false };
  //     //   changeCallback({ path: path, crumbs: crumbs, items: items, props: _props },
  //     //     (refresh) => {
  //     //       setActiveKey(path);
  //     //     }
  //     //   );
  //     // }
  //   }
  //   else {
  //     // 刷新页面-重载tab
  //     if (refreshItem && hasPath) {
  //       initialItems = context.getTrueTabs();

  //       if (initialItems.length !== items.length) {
  //         if (changeCallback !== undefined) {
  //           const crumbs: string[] = getCurrentCrumbs(initialItems, path);

  //           const _props: XTabNavProps = { xPath: path, xState: { ...xState }, xRefesh: false };
  //           changeCallback({ path: path, crumbs: crumbs, items: initialItems, props: _props },
  //             (refresh) => {
  //               setItems(initialItems);
  //             }
  //           );
  //         }
  //       }
  //       else {
  //         //
  //       }
  //     }
  //     else if (!hasPath) {
  //       const _Items = context.getTrueTabs();
  //       let temp = checkPassPath(path, _Items, config, subPath, parentPath, subTitle);

  //       // 如果返回值，则说明path为新路径，这个逻辑下需要跳转
  //       if (temp.length > 0) {
  //         context.isFirstRender = false;
  //         if (changeCallback !== undefined) {
  //           const crumbs: string[] = getCurrentCrumbs(temp, path);
  //           const _props: XTabNavProps = { xPath: path, xState: { ...xState }, xRefesh: false };
  //           changeCallback({ path: path, crumbs: crumbs, items: temp, props: _props },
  //             (refresh) => {
  //               if (refresh) {
  //                 console.debug("refresh items redirect = " + path);
  //                 //setActiveKey(path);
  //                 //navigate("/tab/" + path, { state: { xPath: path, refreshItem: true, xState: xState } });
  //               }
  //             }
  //           );
  //         }

  //       }

  //     }

  //   }

  // }


  const handleMenuTabChange = (args: changeArgs, callback: (refresh: boolean) => void) => {

    // 新增页签或者切换页签或者 关闭页签
    const refresh = (args.items.length !== items.length) || (args.path !== page.currentTabPath);
    if (args.props.xRefesh === undefined) {
      args.props.xRefesh = refresh;
    }
    if (args.path) {
      args.path = args.path.toLocaleLowerCase();
    }

    let uniqueItems: Tab[] = getUniqueItems(args.items, args.props?.xClosePage);

    // 如果和现有状态不符，则刷新状态
    if (refresh) {
      console.debug("menu tab change = " + args.path);

      // 获取面包屑
      const crumbs: string[] = args.crumbs ? args.crumbs : getCurrentCrumbs(uniqueItems, args.path);

      setTabPage({
        tabFirstRender: false,
        lastTabPath: page.currentTabPath,
        currentTabPath: args.path,
        currentCrumbs: crumbs,
        props: args.props
      });
      // page = {
      //   tabFirstRender: false,
      //   lastTabPath: page.currentTabPath,
      //   currentTabPath: args.path,
      //   currentCrumbs: crumbs,
      //   props: args.props
      // }

      //openTabs = uniqueItems; 

      setItems(uniqueItems);
    } else {
      const refresh2 = uniqueItems.length !== items.length;

      if (refresh2) {
        //openTabs = uniqueItems;
        setItems(uniqueItems);
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

  const handleMenuTabAdd = (path: string, callback: (openTabs: Tab[]) => void) => {

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

      const currentCrumbs = getCurrentCrumbs(items, _path);

      setTabPage({
        tabFirstRender: false,
        lastTabPath: page.currentTabPath,
        currentTabPath: _path,
        currentCrumbs: currentCrumbs,
        props: { xPath: _path, xState: {}, xRefesh: page.tabFirstRender }
      });

      console.debug("menu tab redirect = " + _path);

      let temp = checkPassPath(path, items, config.config, undefined, undefined, undefined);
      temp = temp ? temp : items;

      let uniqueItems: Tab[] = [];
      let j = 0;
      for (let index = 0; index < temp.length; index++) {
        const element = temp[index];

        let x = uniqueItems.filter(e => {
          return e.key === element.key;
        }).length;

        if (x > 0) {
          continue;
        }

        uniqueItems[j] = element;
        j++;
      }

      const newLocal = _path;
      // 初始化或当前不再tab页签下，则跳转到tab路由下
      if (page.tabFirstRender) {
        //openTabs = uniqueItems;
        setItems(uniqueItems);
        //navigate(newLocal, { state: { xPath: _path, refreshItem: true } });
      } else {
        //openTabs = uniqueItems;
        setItems(uniqueItems);
        //navigate(newLocal, { state: { xPath: _path } });
      }

      if (callback) {
        callback(uniqueItems);
      }

    } else {
      navigate(path);
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

      // if (changeCallback !== undefined) {
      //   const _props: XTabNavProps = { xPath: key, xState: { ...xState }, xRefesh: false };
      //   changeCallback({ path: key, items: items, props: _props, reset: false },
      //     (refresh) => { }
      //   );
      // }
      setActiveKey(key);
    }
  }

  const onEdit = (
    targetKey: React.MouseEvent | React.KeyboardEvent | string,
    action: 'add' | 'remove',
  ) => {
    if (action === 'add') {
      add("bd/supplier/cityAccount");
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
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }

    if (newPanes.length === 0) {
      // TODO 跳转登录首页
    }

    setItems(newPanes);
    setActiveKey(newActiveKey);

    // if (changeCallback !== undefined) {
    //   console.debug("remove Path = " + path);
    //   //const state = { xPath: newActiveKey, refreshItem: true, xState: xState };
    //   const _props: XTabNavProps = { xPath: newActiveKey, xState: { ...xState }, xRefesh: false };
    //   changeCallback({ path: newActiveKey, items: newPanes, props: _props, reset: true },
    //     (refresh) => {
    //       console.debug("refresh items redirect = " + path);
    //       //navigate("/tab/" + newActiveKey, { state: state });
    //     }
    //   );

    // };
  }

  const add = (newKey: string) => {
    const newActiveKey = newKey;
    const newTab: Tab | undefined = getNewTabItem(newKey, newKey, config.config);
    if (newTab) {
      setItems([...items, newTab]);
      setActiveKey(newActiveKey);
    }
  };

  return (
    <Tabs hideAdd={false} id='tabs' type="editable-card" activeKey={activeKey} onTabClick={onTabClick} onEdit={onEdit} items={items}  >
    </Tabs>
  );


};

export default TabsMenu;

function removeTab(path: string, items: Tab[], closeTab: string, changeCallback: (key: changeArgs, callback: (refresh: boolean) => void) => void, xState: any) {
  let newActiveKey = path;
  let lastIndex = -1;

  items.forEach((item, i) => {
    if (item.key === closeTab) {
      lastIndex = i - 1;
    }
  });

  // 如果现在已经时最后一页，则不允许删除
  if (items.length > 1) {

    const newPanes = items.filter((item) => item.key !== closeTab);
    if (newPanes.length && newActiveKey === closeTab) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }

    if (newPanes.length === 0) {
      // TODO 跳转登录首页
    }

    if (changeCallback !== undefined) {
      console.debug("remove Path = " + closeTab);
      //const state = { xPath: newActiveKey, refreshItem: true, xState: xState };
      const _props: XTabNavProps = { xPath: newActiveKey, xState: { ...xState }, xRefesh: true, xClosePage: closeTab };
      changeCallback({ path: newActiveKey, items: newPanes, props: _props, reset: true },
        (refresh) => {
          console.debug("refresh items redirect = " + path);
        }
      );
    }
  }

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