import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';

const root = ReactDOM.createRoot(document.getElementById('root'));
const config = {
  locale: zhCN,
  input: { autoComplete: 'off' },
};
root.render(
  <React.StrictMode>
    <ConfigProvider {...config} autoInsertSpaceInButton={false}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
