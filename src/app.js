import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/home.js';
import DashboardPage from './pages/dashboard';
import Layout from './components/layout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/dashboard/:dashboardId" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

export default App;
