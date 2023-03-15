import React from 'react';
import { IoHammer, IoPlay } from 'react-icons/io5';
import ReactModal from 'react-modal';
import { Link } from 'react-router-dom';
import ElementList from '../components/element-list';
import Modal from '../components/modal';
import API from '../data/api';
import usePromise from '../hooks/use-promise';

const featuredDashboards = [
  {
    id: 'uniswap-v3-ethereum',
    slug: 'uniswap-v3',
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
  const [isIntroModalOpen, setIsIntroModalOpen] = React.useState(false);

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
        <Link to='/widgets/new' className='button mt-5 mr-4'>
          <IoHammer size={15} className="mr-2" />
          Create your first widget
        </Link>
        
        <button type='button' className='button mt-5' onClick={() => setIsIntroModalOpen(true)}>
          <IoPlay size={15} className="mr-2" />
          Watch demo (3 mins)
        </button>

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

      <ReactModal
        style={{
          content: {
            padding: 0,
            border: 0,
            borderRadius: 0,
            background: 'transparent',
            inset: 40
          },
        }}
        isOpen={isIntroModalOpen}
        onRequestClose={() => setIsIntroModalOpen(false)}
      >
        <div style={{ padding: '0 0 0 0', position: 'relative', width: '100%', height: '100%' }}>
          <iframe
            src='https://player.vimeo.com/video/807224317?h=9f3346f637&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&autoplay=1'
            allow='autoplay; fullscreen; picture-in-picture'
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            title='ChainLook Demo'
          ></iframe>
        </div>
        <script src='https://player.vimeo.com/api/player.js'></script>
      </ReactModal>
    </div>
  );
}

export default HomePage;
