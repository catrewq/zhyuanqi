import React from 'react';
import { Route, Routes } from 'react-router-dom';
import List from './List';
import CityAccAdd from './cityAccAdd';
import CityAccList from './cityAccList';
import CityAccView from './cityAccView';
import CityContract from './cityContract';
import './index.less';

export const supplierList = () => {
  return (
    <div className='Supplier'>
      <List />
    </div>
  );
}

export const supAccList = () => {
  return (
    <div className='Supplier'>
      <CityAccList />
    </div>
  );
}

export const supAccAdd = () => {
  return (
    <div className='Supplier'>
      <CityAccAdd />
    </div>
  );
}

export const supAccView = () => {
  return (
    <div className='Supplier'>
      <CityAccView />
    </div>
  );
}

export const supContract = () => {
  return (
    <div className='Supplier'>
      <CityContract />
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
        <Route path="sec/list" element={supAccList()} />
        <Route path="sec/add" element={supAccAdd()} />
        <Route path="sec/view" element={supAccView()} />
        <Route path="sec/contract" element={supContract()} />
      </Routes>
    </div>
  );
}
