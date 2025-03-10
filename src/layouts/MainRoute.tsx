
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import PicData from "../pages/pic/index";


import Page404 from "../pages/error/404";

// import Workbench from 'src/pages/notuse/workbench';

const MainRoute = () => {

    return (<Routes>
        {/* <Route path="/" element={<Workbench />} /> */}
        <Route path="picData/*" element={<div className='x-Data-Frame-Old'><PicData /></div>} />

        <Route path="*" element={<Page404 />} />
    </Routes>)

}

export default MainRoute;