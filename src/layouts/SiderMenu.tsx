import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Menu } from "antd";
import { SubMenuType } from "antd/es/menu/interface";
import Sider from "antd/lib/layout/Sider";
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ReactSVG } from "react-svg";
import icon from "../assets/images/icon_task.svg";
import ContainerContext from "../utils/context";
import ContainerSettingContext from "./ContainerSettingContext";
import TabRoute from "./MainRoute2";
import { Tab } from "./TabsMenu";

// const icons = {
//   system: Task,
//   task: Task,
// };

interface item extends SubMenuType {

}

// interface MenuType {
//   name: string
//   menuKey: string
//   parentId: string
//   item: MenuType[]
// }

interface CustInfo {
  //props?: any,
  key: string;
  keyPath: string[];
  item: any;
  domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}

const SiderMenu = (callback: any) => {
  //const { message } = useContext(MessageContext);
  const context = useContext(ContainerContext);
  const context2 = useContext(ContainerSettingContext);
  //const context3 = useContext(TabsMenuContext);

  const hiddenSilderBtn = context2.hiddenSilderBtn;
  const useOldRoute = context2.useOldRoute;

  //const printLog = printTabChangeLog;

  const [menuList, setMenuList] = useState(context.menu);

  //const navigate = useNavigate();
  const location = useLocation();

  const _temp: string[] = [];
  const [selectedKeys, setSelectedKeys] = useState(_temp);

  const _temp1: string[] = [];
  const [openKeys, setOpenKeys] = useState(_temp1);

  const _temp2: item[] = [];
  const [items, setItems] = useState(_temp2);
  const [isCollapsed, setIsCollapsedIs] = useState(false);

  const tabConfigs = TabRoute.filter(item => {
    return item.isTabRouter === true
  })

  //const sys_currentMenuTabKey = sessionStorage.getItem("sys_currentMenuTabKey");

  const handleOpenChange = (openKeys: string[]) => {
    setOpenKeys(openKeys);
  };

  const handleClick = (info: CustInfo) => {
    let path: string = info.item.props.path;
    path = path.toLocaleLowerCase();

    if (path) {
      // const openTabs = context3.openTabs;
      // let temp = checkPassPath(path, openTabs, tabConfigs, undefined, undefined, undefined);

      callback.addTabMenu(path, (tabs: Tab[] | undefined) => {
        const arr = tabs?.map(e => {
          return { ...e };
        })

        if (arr && arr.length > 0) {
          const newMenu: any[] = items.map(m => {

            if (m.children) {
              for (let index = 0; index < m.children.length; index++) {
                let element: any = m.children[index];
                const check = arr.find(tab => {
                  return tab.key.toLowerCase() === element.path.toLowerCase();
                })
                if (element) {
                  element.className = (check) ? "sub-menu-checked" : "sub-menu-unchecked";
                }
              }

            }

            return m;
          });

          setItems(newMenu);

        }
      });
    }

  };

  // useEffect(() => {
  //   const arr = context3.getTabs()?.map(e => {
  //     return { ...e };
  //   })

  //   if (arr && arr.length > 0) {
  //     const newMenu: any[] = items.map(m => {

  //       if (m.children) {
  //         for (let index = 0; index < m.children.length; index++) {
  //           let element: any = m.children[index];
  //           const check = arr.find(tab => {
  //             return tab.key.toLowerCase() === element.path.toLowerCase();
  //           })
  //           if (element) {
  //             element.className = (check) ? "sub-menu-checked" : "sub-menu-unchecked";
  //           }
  //         }

  //       }

  //       return m;
  //     });

  //     setItems(newMenu);

  //   }
  // }, [context3.openTabs])


  useEffect(() => {
    if (menuList.length) {
      let arr = [...menuList];
      for (const item of arr) {
        item.icon = <ReactSVG className="icon" src={icon} />;
      }

      const newMenu: any[] = menuList.map(m => {
        const newItem: any = {
          ...m,
          label: m.name,
          key: m.menuKey,
          children: []
        };
        if (m.children) {
          newItem.children = m.children.map(
            (child) => ({
              ...child,
              label: child.name,
              key: child.menuKey,
            })
          );
        }
        return newItem;
      });
      setItems(newMenu);
    }
    // eslint-disable-next-line
  }, [menuList]);

  useEffect(() => {
    if (useOldRoute) {
      let selectedKeys = [];
      selectedKeys = location.pathname.split("/").slice(1);
      setSelectedKeys(selectedKeys);
      setOpenKeys([location.pathname.split("/")[1]]);
    }

  }, [location.pathname]);

  const handleButtonClick = (): void => {
    //console.debug("click" + isCollapsed)
    setIsCollapsedIs(!isCollapsed);

    
  }


  return (
    <Sider className="sider-menu" theme="light" width={240} collapsed={isCollapsed} collapsedWidth={64}>
      <div className="z-sider-menu-container">
        <div className="z-sider-menu-left">
          <Menu
            items={items}
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            onClick={handleClick}
            inlineCollapsed={isCollapsed}
          >
          </Menu>
        </div>

        <div className={(hiddenSilderBtn) ? "" : "z-sider-menu-right"} hidden={hiddenSilderBtn}>
          {/* <img alt="缩进" src={image} className="z-sider-menu-slider" onClick={handleButtonClick} > */}
          <Button className="z-sider-menu-slide-btn" onClick={handleButtonClick} icon={(!isCollapsed) ? <LeftOutlined /> : <RightOutlined />} hidden={hiddenSilderBtn}>
            {/* <div hidden={isCollapsed}>
                      <LeftOutlined onClick={handleButtonClick} />
                    </div>
                    <div hidden={!isCollapsed}>
                      <RightOutlined onClick={handleButtonClick} />
                    </div> */}
          </Button>
        </div>

      </div>
    </Sider>
  );
};

export default SiderMenu;