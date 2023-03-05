import React from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { IoMoonOutline, IoPersonCircleOutline, IoSettingsOutline, IoSunny } from 'react-icons/io5';
import { Link, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';
import Store from '../data/store';

export default function Layout() {
  const { openConnectModal } = useConnectModal();

  const { isAuthenticated, user } = React.useContext(AuthContext);

  const [theme, setTheme] = React.useState(Store.getTheme() || 'light');

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  function toggleTheme() {
    if (theme === 'light') {
      setTheme('dark');
      Store.setTheme('dark');
    } else {
      setTheme('light');
      Store.setTheme('light');
    }
  }

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

          <button className='menu-item' onClick={toggleTheme}>
            {theme === 'light' ? <IoMoonOutline size={20} /> : <IoSunny size={20} />}
          </button>
        </div>
      </div>

      <div className='main wrapper'>
        <hr />
        <Outlet />
      </div>

      <div className='footer wrapper'>
        Disclaimer: ChainLook doesn&lsquo;t guarantee accuracy of the data.
      </div>
    </>
  );
}
