import React from 'react';
import { Outlet } from 'react-router-dom';
import AIFloatingButton from '../ai/AIFloatingButton';

const Layout: React.FC = () => {
  return (
    <>
      <Outlet />
      <AIFloatingButton />
    </>
  );
};

export default Layout;