import { Layout } from "antd";
import { useRef } from "react";
import { Routes, useNavigate } from "react-router-dom";

import React from "react";
import "./Layout.less";
import TabRoute, { printTabChangeLog, hiddenSilderBtn as silderConfig } from "./MainRoute2";
import MainRoute from "./MainRoute_old";

// import { useTabNavigate } from "src/utils/navigateUtil";
import ContainerSettingContext from "./ContainerSettingContext";
import RouteFunc from "./RouteFunc";
import SiderMenuRef from "./SiderMenuRef";
import { Tab } from "./TabsMenu";

const { Content, Footer, Sider } = Layout;

interface RefProps {
  callback: (tabs: Tab[] | undefined) => void,

}

function Container() {
  const navigate = useNavigate();

  const hiddenSilderBtn = silderConfig;
  const printLog = printTabChangeLog;
  const useOldRoute = false;

  // 子组件
  const TabsMenuComponent = React.forwardRef((refProp: { props: RefProps }, ref) => {

    return (<Content className="pagetabs">
      <Routes>
        {RouteFunc({ config: TabRoute, changeCallback: refProp.props.callback, ref: ref })}
      </Routes>
    </Content>);
  });

  const tabsRef: any = useRef(null);
  const siderRef: any = useRef(null);

  const handleSiderRefClick = (path: string, callback: (items: Tab[] | undefined) => void) => {
    if (tabsRef.current) {
      tabsRef.current.addTabMenuBySider(path, callback);
    }
    else {
      navigate(path);
    }

  };

  const handleMenuTabChange = (tabs: Tab[] | undefined) => {
    if (tabsRef.current) {
      siderRef.current.refreshMenuByTabChange(tabs);
    }
  };

  /**
   * @deprecated v1.4.1前兼容历史页面路由方式
   * @param useOldRoute
   * @returns
   */
  const MixRoute = (e: { old: boolean }) => {

    if (e.old) {
      return (<MainRoute />)
    }

    return (<TabsMenuComponent props={{ callback: handleMenuTabChange }} ref={tabsRef} />);
  }

  return (
    <Layout className="wrapper">
      <ContainerSettingContext.Provider
        value={{
          hiddenSilderBtn: hiddenSilderBtn,
          useOldRoute: useOldRoute
        }}
      >
        {/* <FixHeader crumbs={page.currentCrumbs}></FixHeader> */}
        <Layout className="main-container">
          <div className="sider-menu-container">
            <SiderMenuRef props={{ callback: handleSiderRefClick }} ref={siderRef} />
          </div>

          <MixRoute old={useOldRoute} />

        </Layout>
      </ContainerSettingContext.Provider>
    </Layout>
  );
}

export default Container;