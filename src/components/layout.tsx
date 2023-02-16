import { ConnectButton, useConnectModal, useAccountModal } from "@rainbow-me/rainbowkit";
import React from "react";
import { Link, Outlet } from "react-router-dom";
import { AuthContext } from "../context/auth-context";

export default function Layout() {
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();

  const { isAuthenticated, user } = React.useContext(AuthContext);


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

          <Link to="/dashboards/new">
            <div className="menu-item">New Dashboard</div>
          </Link>

          {!isAuthenticated ? (
            <button
              type="button"
              className="menu-item"
              onClick={openConnectModal}
            >
              Sign In
            </button>
          ) : (
            <button
              type="button"
              className="menu-item"
              onClick={openAccountModal}
            >
              {user?.username}
            </button>
          )}
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
