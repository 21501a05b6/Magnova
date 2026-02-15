import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = ({ children }) => {
  return (
    <div className="App min-h-screen bg-neutral-50/30">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="px-6 py-8 md:px-8 bg-neutral-50/30 min-h-screen">{children}</div>
      </div>
    </div>
  );
};
