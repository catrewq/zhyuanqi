
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import PicData from "../pages/pic/index";


import Page404 from "../pages/error/404";


const MainRoute = () => {

    return (<Routes>
        <Route path="picData/*" element={<div className='x-Data-Frame-Old'><PicData /></div>} />

        <Route path="*" element={<Page404 />} />
    </Routes>)

}

export default MainRoute;