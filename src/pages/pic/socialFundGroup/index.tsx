import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Add from './Add';
import List from './List';
import View from './View';
import './index.less';

export const socialFundGroupList = () => {
  return (
    <div className="SocialFundGroup">
      <List />
    </div>
  );
}

export const socialFundGroupAdd = () => {
  return (
    <div className="SocialFundGroup">
      <Add />
    </div>
  );
}

export const socialFundGroupView = () => {
  return (
    <div className="SocialFundGroup">
      <View />
    </div>
  );
}

/**
 * @deprecated v1.4 之后不直接使用
 * @returns
 */
export default function SocialFundGroup() {
  return (
    <div className="SocialFundGroup">
      <Routes>
        <Route path="list" element={<List />} />
        <Route path="add" element={<Add />} />
        <Route path="view" element={<View />} />
      </Routes>
    </div>
  );
}
