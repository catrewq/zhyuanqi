import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Add from './Add';
import List from './List';
import View from './View';
import './index.less';

export const socialFundRateList = () => {
  return (
    <div className="SocialFundRate">
      <List />
    </div>
  );
}

export const socialFundRateAdd = () => {
  return (
    <div className="SocialFundRate">
      <Add />
    </div>
  );
}

export const socialFundRateView = () => {
  return (
    <div className="SocialFundRate">
      <View />
    </div>
  );
}

/**
 * @deprecated v1.4 之后不直接使用
 * @returns
 */
export default function SocialFundRate() {
  return (
    <div className="SocialFundRate">
      <Routes>
        <Route path="list" element={<List />} />
        <Route path="add" element={<Add />} />
        <Route path="view" element={<View />} />
      </Routes>
    </div>
  );
}
