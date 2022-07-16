import React from "react";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <div className="header">
        <h1>Graph Analytics</h1>
      </div>

      <div className="main">
        <Outlet />
      </div>

      <div className="footer">
        Copyright &copy;2022 Graph Analytics
      </div>
    </>
  )
}
