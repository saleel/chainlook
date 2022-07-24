import React from 'react';
import { Link } from 'react-router-dom';

const popularDashboard = [
  {
    title: 'Uniswap v3',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Uniswap_Logo_and_Wordmark.svg/640px-Uniswap_Logo_and_Wordmark.svg.png',
    id: 'bafkreihrtacvuegqtfegyradaugnfwlqkk5hr2jxgv3e6sj5f6rnu5dyqi',
  },
  {
    title: 'Dashboard with IPFS and Tableland data',
    image: 'https://tableland.xyz/_nuxt/img/logo-black.4b9c4b1.svg',
    id: 'bafkreienmpke565i56qtiphdwljfzaye7nbyfjv5xipooxkhnkjte3whni',
  },
];

function HomePage() {
  return (
    <div className="page home-page">

      <div className="intro mb-5">
        ChainLook is a decentralized blockchain analytics platform based on TheGraph and IPFS.
        <br />
        <br />

        You can create beautiful widgets and dashboards for tokens, NFTs, dApps based on data from subgraphs. The configuration JSONs
        for widgets and dashboards are stored in IPFS
        <br />

        <br />
        Additionally, widgets can be build based on data from IPFS (json), Tableland, OrbitDB (in progress). In a way
        ChainLook is a general purpose visualization tool for decentralized data.

        <br />
        <br />

        Start by browsing popular dashboards below, or by <Link to="/widget/new">creating your own Widget</Link> from existing samples.

      </div>

      <div className="popular-dashboards">
        <h3 className="section-title">Popular Dashboards:</h3>

        <div className="columns">
          {popularDashboard.map((d) => (
            <Link to={`/dashboard/${d.id}`} key={d.id} className="column is-12-mobile is-6-tablet is-3-desktop">
              <div className="popular-dashboard">
                <div className="popular-dashboard-image">
                  <img src={d.image} alt={d.title} />
                </div>
                <div className="popular-dashboard-title">{d.title}</div>
              </div>
            </Link>
          ))}
        </div>

      </div>

    </div>
  );
}

export default HomePage;
