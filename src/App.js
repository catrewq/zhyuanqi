import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter } from 'react-router-dom';
import axios from "./utils/axios";
import MyContext from "./utils/context";
import { Spin } from "antd";
import Launcher from "./pages/launcher";
import "./styles/App.less";
import { menuData } from "./mock/mockMenu";
const Container = React.lazy(() => import("./layouts/Container"));

const App = () => {
  const [logged, setLogged] = useState(false);
  const [menu, setMenu] = useState([]);
  const [account, setAccount] = useState({});

  async function getMenu() {
    setMenu(menuData.data);
    setAccount(menuData.data.account);
  }


  useEffect(() => {
    if (menu.length) {
      setLogged(true);
    }
  }, [menu, account]);

  useEffect(() => {
    let token = sessionStorage.getItem("token");
    let sessionId = sessionStorage.getItem("sessionId");
    if (sessionId && token) {
      getMenu();
    }
  }, []);



  return (
    <BrowserRouter basename="/">
      {/* {!logged ? (
        <Launcher />
      ) : (
        <Suspense
          fallback={
            <div className="spin-wrapper">
              <Spin />
            </div>
          }
        >
          <MyContext.Provider value={{ menu, account }}>
            <Container />
          </MyContext.Provider>
        </Suspense>
      )} */}


      <Suspense
        fallback={
          <div className="spin-wrapper">
            <Spin />
          </div>
        }
      >
        <MyContext.Provider value={{ menu, account }}>
          <Container />
        </MyContext.Provider>
      </Suspense>

    </BrowserRouter>
  );
};

export default App;


