import { ConnectButton, useConnectModal, useAccountModal } from '@rainbow-me/rainbowkit';
import React from 'react';
import { IoPersonCircleOutline, IoSettings, IoSettingsOutline } from 'react-icons/io5';
import { Link, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';

export default function Layout() {
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();

  const { isAuthenticated, user } = React.useContext(AuthContext);

  return (
    <>
      <div className='header wrapper'>
        <h1 className='logo'>
          <Link to='/'>ChainLook</Link>
        </h1>

        <div className='menu'>
          <Link to='/widgets/new'>
            <div className='menu-item'>New Widget</div>
          </Link>

          <Link to='/dashboards/new'>
            <div className='menu-item'>New Dashboard</div>
          </Link>

          {!isAuthenticated ? (
            <button type='button' className='menu-item' onClick={openConnectModal}>
              Sign In
            </button>
          ) : (
            <Link to={`/users/${user!.username}`}>
              <div className='menu-item'>
                <IoPersonCircleOutline size={20} />
              </div>
            </Link>
          )}

          <Link to='/settings'>
            <div className='menu-item'>
              <IoSettingsOutline size={20} />
            </div>
          </Link>
        </div>
      </div>

      <div className='main wrapper'>
        <hr />
        <Outlet />
      </div>

      <div className='footer wrapper'>
        Disclaimer: ChainLook don&lsquo;t guarantee accuracy of the data.
      </div>
    </>
  );
}
