import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './Login';
import './index.less';
import ResetPassword from "./resetPassword";
import React from 'react';

export default function Launcher() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');

  useEffect(() => {
    let token: any = sessionStorage.getItem('sessionId');
    setToken(token);
    if (!token) {
      navigate('/');
    }

    // eslint-disable-next-line
  }, []);

  return (
    <div className="Launcher">
      {!token ? (
        <Routes>
          <Route index element={<Login />} />
          <Route path="resetPassword" element={<ResetPassword />} />
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
        </Routes>
      ) : (
        <div className="spin-wrapper">
          <Spin />
        </div>
      )}
    </div>
  );
}
