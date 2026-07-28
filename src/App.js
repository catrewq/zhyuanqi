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
  const [loading, setLoading] = useState(true); // å¢åŠ åŠ è½½çŠ¶æ€

  const getMenu = () => {
    setMenu(menuData.data);
  }


  useEffect(() => {
    // ç»„ä»¶æŒ‚è½½æ—¶ä» localStorage ä¸­è¯»å–æ•°æ®
    const storedMenu = localStorage.getItem('menu');
    const storedLogged = localStorage.getItem('logged');

    if (storedMenu) {
      setMenu(JSON.parse(storedMenu));
    }

    if (storedLogged) {
      setLogged(JSON.parse(storedLogged));
    }

    // åˆå§‹åŒ–å®Œæˆåæ›´æ–°åŠ è½½çŠ¶æ€
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
        setLogged(false); // ç¡®ä¿ logged çŠ¶æ€æ­£ç¡®æ›´æ–°
      }
    }
  }, [menu]);


  // å½“ menu æˆ– logged çŠ¶æ€å˜åŒ–æ—¶ï¼Œå°†å…¶å­˜å‚¨åˆ° localStorage ä¸­
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
"// ½Å±¾SubmitSelf²âÊÔ"  
"// [½Å±¾Á÷³Ì] SubmitSelf ÑéÖ¤" 
<<<<<<< HEAD
"// DEVÌØÓĞ¸Ä¶¯ - ³åÍ»²âÊÔ"  
=======
"// MASTERÌØÓĞ¸Ä¶¯ - ³åÍ»²âÊÔ"  
>>>>>>> 94d06f5 (conflict-test: masteræ”¹åŠ¨-åˆå…¥ä¼šå†²çª)
