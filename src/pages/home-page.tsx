import React from 'react';
import { Link } from 'react-router-dom';
import ElementList from '../components/element-list';
import API from '../data/api';
import usePromise from '../hooks/use-promise';

const featuredDashboards = [
  {
    id: 'uniswap-v3-ethereum',
    slug: 'uniswap-v3-ethereum',
    title: 'Uniswap v3',
    user: { id: '', username: 'saleel', address: '' },
  },
  {
    id: 'saddle-finance',
    slug: 'saddle-finance',
    title: 'Saddle Finance',
    user: { id: '', username: 'saleel', address: '' },
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
