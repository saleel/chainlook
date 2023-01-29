import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import React from "react";
import { Link, Outlet } from "react-router-dom";
import { AuthContext } from "../context/auth-context";

export default function Layout() {
  const { openConnectModal } = useConnectModal();

  return (
    <>
      <div className="header wrapper">
        <h1 className="logo">
          <Link to="/">ChainLook</Link>
        </h1>

        <div className="menu">
          <Link to="/widgets/new">
            <div className="menu-item">New Widget</div>
          </Link>
          <Link to="/dashboard/new">
            <div className="menu-item">New Dashboard</div>
          </Link>
          <button type="button" className="menu-item" onClick={openConnectModal}>
            Sign In
          </button>
        </div>
      </div>

      <div className="main wrapper">
        <hr />
        <Outlet />
      </div>

      <div className="footer wrapper">
        Disclaimer: ChainLook don&lsquo;t guarantee accuracy of the data.
        Project still in alpha stage and schema might change.
      </div>
    </>
  );
}
