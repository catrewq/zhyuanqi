import { Spin } from 'antd';
import Cookies from 'js-cookie';
import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { menuData } from "./mock/mockMenu";
import Launcher from "./pages/launcher";
import { pics as PicPage } from "./pages/pic/index";
import "./styles/App.less";
import MyContext from "./utils/context";

const Container = React.lazy(() => import("./layouts/Container"));

const App = () => {

  const isPic = window.location.pathname.startsWith("/pic/pics");
  //const [isPic, setIsPic] = useState();

  const [logged, setLogged] = useState(false);
  const [menu, setMenu] = useState(menuData.data);
  const [account, setAccount] = useState({});
  const [loading, setLoading] = useState(true); // 增加加载状态

  const getMenu = () => {
    setMenu(menuData.data);
  }


  useEffect(() => {
    // 组件挂载时从 localStorage 中读取数据
    const storedMenu = localStorage.getItem('menu');
    const storedLogged = localStorage.getItem('logged');

    if (storedMenu) {
      setMenu(JSON.parse(storedMenu));
    }

    if (storedLogged) {
      setLogged(JSON.parse(storedLogged));
    }

    // 初始化完成后更新加载状态
    setLoading(false);
  }, []);

  useEffect(() => {
    if (menu.length > 0) {
      let token = Cookies.get('token');
      let sessionId = Cookies.get('sessionId');
      console.log(token);
      console.log(sessionId);
      console.log(menu);
      if (sessionId && token) {
        getMenu();
        setLogged(true);
      } else {
        setLogged(false); // 确保 logged 状态正确更新
      }
    }
  }, [menu]);


  // 当 menu 或 logged 状态变化时，将其存储到 localStorage 中
  useEffect(() => {
    localStorage.setItem('menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem('logged', JSON.stringify(logged));
  }, [logged]);

  function getPicCompenont() {
    return (<Routes>
      <Route path="/pic/pics" element={<div className='x-Data-Frame-Old'> < PicPage /> </div>} />
    </Routes>);
  }

  return (
    <BrowserRouter basename="/">
      {loading ? (
        <div className="spin-wrapper">
          <Spin />
        </div>
      ) : (isPic ? (getPicCompenont()) :
        (
          !logged ? (
            <Launcher />
          ) : (
            <Suspense
              fallback={
                <div className="spin-wrapper">
                  <Spin />
                </div>
              }
            >
              <MyContext.Provider value={{ menu, setMenu, account, setAccount, logged, setLogged }}>
                <Container />
              </MyContext.Provider>
            </Suspense>
          )
        ))}
      {/* <Suspense
        fallback={
          <div className="spin-wrapper">
            <Spin />
          </div>
        }
      >
        <MyContext.Provider value={{ menu, setMenu, account, setAccount, logged, setLogged }}>
          <Container />
        </MyContext.Provider>
      </Suspense> */}
    </BrowserRouter>
  );
};

export default App;"// test timestamp marker - safe to remove"  
"// �ű�SubmitSelf����"  
"// [�ű�����] SubmitSelf ��֤" 
