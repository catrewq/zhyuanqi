import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Add from './Add';
import List from './List';
import Set from './Set';
import View from './View';
import './index.less';

export const socialFundPackageList = () => {
  return (
    <div className="SocialFundPackage">
      <List />
    </div>
  );
}

export const socialFundPackageAdd = () => {
  return (
    <div className="SocialFundPackage">
      <Add />
    </div>
  );
}

export const socialFundPackageSet = () => {
  return (
    <div className="SocialFundPackage">
      <Set />
    </div>
  );
}

export const socialFundPackageView = () => {
  return (
    <div className="SocialFundPackage">
      <View />
    </div>
  );
}

/**
 * @deprecated v1.4 之后不直接使用
 * @returns
 */
export default function SocialFundPackage() {
  return (
    <div className="SocialFundPackage">
      <Routes>
        <Route path="list" element={<List />} />
        <Route path="add" element={<Add />} />
        {/* 设置下挂客户合同 */}
        <Route path="set" element={<Set />} />
        <Route path="view" element={<View />} />
      </Routes>
    </div>
  );
}
