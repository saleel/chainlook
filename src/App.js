import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/home.js';
import DashboardPage from './pages/dashboard';

function App() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<HomePage />} />
      </Route>
      <Route path="/dashboard/:dashboardId">
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

export default App;
