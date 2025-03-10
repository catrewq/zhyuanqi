import React from 'react';
import { Route, Routes } from 'react-router-dom';
import List from './List';
import SecSupAdd from './SecAdd';
import SecSupList from './SecList';
import SecSupView from './SecView';
import './index.less';

export const supplierList = () => {
  return (
    <div className='Supplier'>
      <List />
    </div>
  );
}

export const secSupList = () => {
  return (
    <div className='Supplier'>
      <SecSupList />
    </div>
  );
}

export const secSupAdd = () => {
  return (
    <div className='Supplier'>
      <SecSupAdd />
    </div>
  );
}

export const secSupView = () => {
  return (
    <div className='Supplier'>
      <SecSupView />
    </div>
  );
}


/**
 * @deprecated v1.4 之后不直接使用
 * @returns
 */
export default function Supplier() {
  return (
    <div className="Supplier">
      <Routes>
        <Route path="list" element={supplierList()} />
        <Route path="sec/list" element={secSupList()} />
        <Route path="sec/add" element={secSupAdd()} />
        <Route path="sec/view" element={secSupView()} />
      </Routes>
    </div>
  );
}
