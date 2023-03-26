import React from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import {
  IoBookOutline,
  IoMoonOutline,
  IoPersonCircleOutline,
  IoSettingsOutline,
  IoSunny,
} from 'react-icons/io5';
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
          <Link className='menu-item' to='/widgets/new'>
            New Widget
          </Link>

          <Link className='menu-item' to='/dashboards/new'>
            New Dashboard
          </Link>

          {!isAuthenticated ? (
            <button type='button' className='menu-item' onClick={openConnectModal}>
              Sign In
            </button>
          ) : (
            <Link className='menu-item' to={`/users/${user!.username}`}>
              <IoPersonCircleOutline size={20} />
            </Link>
          )}

          <Link className='menu-item' to='/docs'>
            <IoBookOutline size={20} />
          </Link>

          <Link className='menu-item' to='/settings'>
            <IoSettingsOutline size={20} />
          </Link>

          <button className='menu-item' onClick={toggleTheme}>
            {theme === 'light' ? <IoMoonOutline size={20} /> : <IoSunny size={20} />}
          </button>
        </div>
      </div>

      <div className='main wrapper'>
        <hr className='mt-2' />
        <Outlet />
      </div>

      <div className='footer wrapper'>
        Disclaimer: ChainLook doesn&lsquo;t guarantee accuracy of the data.
      </div>
    </>
  );
}
