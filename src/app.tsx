import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/home-page';
import DashboardPage from './pages/dashboard-page';
import Layout from './components/layout';
// import WidgetEditPage from './pages/widget-edit-page';
import NewWidgetPage from './pages/new-widget-page';
import WidgetPage from './pages/widget-page';
import NewDashboardPage from './pages/new-dashboard-page';

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<Layout />}>
        <Route index element={<HomePage />} />

        <Route path="widget">
          <Route path="new" element={<NewWidgetPage />} />
          <Route path=":widgetId" element={<WidgetPage />} />
          {/* <Route path=":widgetId/edit" element={<WidgetEditPage />} /> */}
        </Route>

        <Route path="dashboard">
          <Route path=":id" element={<DashboardPage />} />
          <Route path=":protocol/:id" element={<DashboardPage />} />
          <Route path="new" element={<NewDashboardPage />} />
        </Route>

      </Route>
    </Routes>
  );
}

export default App;
