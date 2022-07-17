import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/home';
import DashboardPage from './pages/dashboard';
import Layout from './components/layout';
import CreateWidgetPage from './pages/create-widget';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/dashboard/:dashboardId" element={<DashboardPage />} />
        <Route path="/create-widget" element={<CreateWidgetPage />} />
      </Route>
    </Routes>
  );
}

export default App;
