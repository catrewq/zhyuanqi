import React from 'react';
import { Route, Routes } from 'react-router-dom';
import List from './list';
import Pics from './pics';
// 注释

import './index.less';


import { TabRouteConfig } from 'src/layouts/RouteFunc';

const CLASS_NAME = "BaseData";


const PICS_LIST = "pics"
const PIC_LIST = "list";

export const children: TabRouteConfig[] = (
  [
    { path: PICS_LIST, title: "商品照片展示", element: pics(), isTabRouter: false, className: CLASS_NAME },
    { path: PIC_LIST, title: "巡检单列表", element: list(), isTabRouter: false, className: CLASS_NAME },
    // 注释
    //{ path: PI_LIST, title: "商品", element: pi(), isTabRouter: false, className: CLASS_NAME },


  ]
)


function pics() {
  return <Pics />;
}


function list() {
  return <List />;
}



/**
 * 基础数据管理
 *
 * @returns
 */
const PicData = () => {
  return (
    <div className="BaseData">
      <Routes>
        <Route path={PICS_LIST} element={pics()} />
        <Route path={PIC_LIST} element={list()} />
      </Routes>
    </div>
  );
}

export default PicData;



