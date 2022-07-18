import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/home-page';
import DashboardPage from './pages/dashboard-page';
import Layout from './components/layout';
import NewWidgetPage from './pages/new-widget-page';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/dashboard/:dashboardId" element={<DashboardPage />} />
        <Route path="/widget/new" element={<NewWidgetPage />} />
      </Route>
    </Routes>
  );
}

export default App;
