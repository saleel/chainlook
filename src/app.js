import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/home-page';
import DashboardPage from './pages/dashboard-page';
import Layout from './components/layout';
import NewWidgetPage from './pages/new-widget-page';
import WidgetPage from './pages/widget-page';

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<Layout />}>
        <Route index element={<HomePage />} />

        <Route path="widget">
          <Route path=":widgetId" element={<WidgetPage />} />
          <Route path="new" element={<NewWidgetPage />} />
        </Route>

        <Route path="dashboard">
          <Route path=":dashboardId" element={<DashboardPage />} />
        </Route>

      </Route>
    </Routes>
  );
}

export default App;
