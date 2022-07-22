import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <div className="header wrapper">
        <Link to="/">
          <h1 className="logo">ChainLook</h1>
        </Link>

        <div className="menu">
          <Link to="/widget/new">
            <div className="menu-item">
              New Widget
            </div>
          </Link>
          <Link to="/dashboard/new">
            <div className="menu-item">
              New Dashboard
            </div>
          </Link>
        </div>
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
