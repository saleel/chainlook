import React from 'react';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <div className="header wrapper">
        <h1 className="logo">ChainLook</h1>
      </div>

      <div className="main wrapper">
        <Outlet />
      </div>

      <div className="footer wrapper">
        Copyright &copy;2022 ChainLook
      </div>
    </>
  );
}
