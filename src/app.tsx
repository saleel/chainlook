import '@rainbow-me/rainbowkit/styles.css';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/dashboard-page';
import Layout from './components/layout';
import { AuthContextProvider } from './context/auth-context';
import WidgetEmbedPage from './pages/widget-embed-page';
import HomePage from './pages/home-page';

const WidgetEditPage = React.lazy(() => import('./pages/edit-widget-page'));
const NewWidgetPage = React.lazy(() => import('./pages/new-widget-page'));
const WidgetPage = React.lazy(() => import('./pages/widget-page'));
const NewDashboardPage = React.lazy(() => import('./pages/new-dashboard-page'));
const EditDashboardPage = React.lazy(() => import('./pages/edit-dashboard-page'));
const UserPage = React.lazy(() => import('./pages/user-page'));
const SettingsPage = React.lazy(() => import('./pages/settings-page'));
const DocsPage = React.lazy(() => import('./pages/docs-page'));

function withSuspense(Component: React.FC) {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Component />
    </React.Suspense>
  );
}

function App() {
  return (
    <AuthContextProvider>
      <Routes>
        {/* @ts-ignore */}
        <Route exact path='/' element={<Layout />}>
          <Route index element={<HomePage />} />

          <Route path='widgets'>
            <Route path='new' element={withSuspense(NewWidgetPage)} />
            <Route path=':widgetId/edit' element={withSuspense(WidgetEditPage)} />
            <Route path=':widgetId' element={withSuspense(WidgetPage)} />
          </Route>

          <Route path='dashboards'>
            <Route path=':id' element={withSuspense(DashboardPage)} />
            <Route path=':id/edit' element={withSuspense(EditDashboardPage)} />
            <Route path='new' element={withSuspense(NewDashboardPage)} />
          </Route>

          <Route path='users'>
            <Route path=':username' element={withSuspense(UserPage)} />
          </Route>

          <Route path='settings' element={withSuspense(SettingsPage)} />
          <Route path='docs' element={withSuspense(DocsPage)} />
        </Route>

        <Route path='widgets/:widgetId/embed' element={<WidgetEmbedPage />} />
      </Routes>
    </AuthContextProvider>
  );
}

export default App;
