// import React from 'react';
// import { Route, Routes } from 'react-router-dom';
// import CityList from './pics';
// import ResidenceList from './list';

// import './index.less';
// // import InsAccountList from './insAccount/InsAccountList';
// //import { supplierList as oldSupplierList } from './supplierSecTier';

// import { TabRouteConfig } from 'src/layouts/RouteFunc';

// const CLASS_NAME = "BaseData";


// const CITY_LIST = "citylist"
// const RESIDENCE_LIST = "residencelist";



// export const children: TabRouteConfig[] = (
//   [
//     { path: CITY_LIST, title: "商品照片展示", element: cityList(), isTabRouter: false, className: CLASS_NAME },
//     { path: RESIDENCE_LIST, title: "巡检单列表", element: residenceList(), isTabRouter: false, className: CLASS_NAME },


//   ]
// )


// function cityList() {
//   return <CityList />;
// }


// // function insAccountList() {
// //   return <InsAccountList />;
// // }

// function residenceList() {
//   return <ResidenceList />;
// }



// /**
//  * 基础数据管理
//  *
//  * @returns
//  */
// const PicData = () => {
//   return (
//     <div className="BaseData">
//       <Routes>
//         <Route path={CITY_LIST} element={cityList()} />
//         <Route path={RESIDENCE_LIST} element={residenceList()} />

//       </Routes>
//     </div>
//   );
// }

// export default PicData;

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Pics from './pics';
import List from './list';

import './index.less';
// import InsAccountList from './insAccount/InsAccountList';
//import { supplierList as oldSupplierList } from './supplierSecTier';

import { TabRouteConfig } from 'src/layouts/RouteFunc';

const CLASS_NAME = "BaseData";


const PICS_LIST = "pics"
const PIC_LIST = "list";



export const children: TabRouteConfig[] = (
  [
    { path: PICS_LIST, title: "商品照片展示", element: pics(), isTabRouter: false, className: CLASS_NAME },
    { path: PIC_LIST, title: "巡检单列表", element: list(), isTabRouter: false, className: CLASS_NAME },


  ]
)


function pics() {
  return <Pics />;
}


// function insAccountList() {
//   return <InsAccountList />;
// }

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

