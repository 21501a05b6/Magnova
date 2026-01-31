import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = ({ children }) => {
  return (
    <div className="App">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
};
