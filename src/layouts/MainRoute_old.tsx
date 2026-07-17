
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PicData from "../pages/pic/index";
// import InsuredAccountPage from "../pages/baseDataManager/insAccount/InsAccountList";
// import Workbench from "../pages/oldversion/workbench/index";

const MainRoute = () => {

    return (<Routes>
        {/* <Route path="/" element={<div className='x-Data-Frame-Old'><Workbench /></div>} /> */}
        <Route path="picData/*" element={<div className='x-Data-Frame-Old'><PicData /></div>} />
        {/* <Route path="insuredAccountPage/*" element={<div className='x-Data-Frame-Old'><InsuredAccountPage /></div>} /> */}
    </Routes>)

}

export default MainRoute;