import React from 'react';
import { Link } from 'react-router-dom';
import ElementList from '../components/element-list';
import API from '../data/api';
import Dashboard from '../domain/dashboard';
import usePromise from '../hooks/use-promise';

const featuredDashboards = [
  {
    id: 'saleel:uniswap-v3',
    slug: 'saleel:uniswap-v3',
    title: 'Uniswap v3',
    // image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Uniswap_Logo_and_Wordmark.svg/640px-Uniswap_Logo_and_Wordmark.svg.png',
  },
  {
    id: 'saleel:aave',
    slug: 'saleel:aave-v3',
    title: 'Aave',
    // image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Uniswap_Logo_and_Wordmark.svg/640px-Uniswap_Logo_and_Wordmark.svg.png',
  },
  {
    id: 'saleel:lido',
    slug: 'saleel:lido',
    title: 'Lido',
    // image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Uniswap_Logo_and_Wordmark.svg/640px-Uniswap_Logo_and_Wordmark.svg.png',
  },
  {
    id: 'saleel:rocketpool',
    slug: 'saleel:rocketpool',
    title: 'Rocketpool',
    // image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Uniswap_Logo_and_Wordmark.svg/640px-Uniswap_Logo_and_Wordmark.svg.png',
  },
];

function HomePage() {
  React.useEffect(() => {
    document.title = 'ChainLook - Blockchain analytics platform for subgraphs';
  }, []);

  const [recentDashboards, { isFetching: isFetchingDashboards }] = usePromise(
    () => API.getRecentDashboards(),
    {
      defaultValue: [],
    },
  );

  const [recentWidgets, { isFetching: isFetchingWidgets }] = usePromise(
    () => API.getRecentWidgets(),
    {
      defaultValue: [],
    },
  );

  return (
    <div className='page home-page'>
      <div className='intro mb-5'>
        ChainLook is a blockchain analytics platform based on{' '}
        <a href='https://thegraph.com/docs/en/'>subgraphs</a> (TheGraph).
        <br />
        <br />
        Create awesome <strong>widgets</strong> like line-chart, pie-chart, table, from subgraphs
        data using simple configuration. Use the drag-and-drop editor to build beautiful{' '}
        <strong>dashboards</strong> from your widgets, and share with others.
        <br />
        <Link to='/widgets/new' className='button mt-5'>
          Create your first widget
        </Link>
      </div>

      <hr />

      <div className='columns is-multiline'>
        <div className='column mb-5'>
          <ElementList
            title={`Featured dashboards`}
            elements={featuredDashboards}
            type='dashboard'
          />
        </div>

        <div className='column mb-5'>
          <ElementList
            loading={isFetchingDashboards}
            title={`Recent dashboards`}
            elements={recentDashboards}
            type='dashboard'
          />
        </div>

        <div className='column mb-5'>
          <ElementList
            loading={isFetchingWidgets}
            title={`Recent widgets`}
            elements={recentWidgets}
            type='widget'
          />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
