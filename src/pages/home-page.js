import React from 'react';
import { Link } from 'react-router-dom';

const popularDashboard = [
  {
    title: 'Uniswap v3',
    id: 'bafkreifxglc7dz4gouevtv52jxxtqzjz5u6pjb4gyx5qvjo773lbhft6my',
  },
  {
    title: 'Dashboard with IPFS and Tableland data',
    id: 'bafkreienmpke565i56qtiphdwljfzaye7nbyfjv5xipooxkhnkjte3whni',
  },
];

function HomePage() {
  return (
    <div className="page home-page">

      <div className="intro mb-5">
        ChainLook is a decentralized blockchain analytics tool based on TheGraph and IPFS.
        <br />
        <br />

        You can create beautiful widgets and dashboards based on data from subgraphs. The configuration JSONs
        for widgets and dashboards are stored in IPFS
        <br />

        <br />
        Additionally, widgets can be build based on data from IPFS (json), Tableland, OrbitDB (in progress). In a way
        ChainLook is a general purpose visualization tool for decentralized data.

        <br />
        <br />

        Start by browsing popular dashboards below, or by <a href="/widget/new">creating your own Widget</a> from existing samples.
      </div>

      <div className="popular-dashboards">
        <h3 className="section-title">Popular Dashboards:</h3>
        {popularDashboard.map((d) => (
          <Link key={d.id} className="link" to={`/dashboard/${d.id}`}>{d.title}</Link>
        ))}
      </div>

    </div>
  );
}

export default HomePage;
