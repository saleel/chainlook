import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home-page";
import DashboardPage from "./pages/dashboard-page";
import Layout from "./components/layout";
import WidgetEditPage from "./pages/edit-widget-page";
import NewWidgetPage from "./pages/new-widget-page";
import WidgetPage from "./pages/widget-page";
import NewDashboardPage from "./pages/new-dashboard-page";
import { AuthContextProvider } from "./context/auth-context";

function App() {
  return (
    <AuthContextProvider>
      <Routes>
        <Route exact path="/" element={<Layout />}>
          <Route index element={<HomePage />} />

          <Route path="widgets">
            <Route path="new" element={<NewWidgetPage />} />
            <Route path=":widgetId/edit" element={<WidgetEditPage />} />
            <Route path=":widgetId" element={<WidgetPage />} />
          </Route>

          <Route path="dashboard">
            <Route path=":id" element={<DashboardPage />} />
            <Route path=":protocol/:id" element={<DashboardPage />} />
            <Route path="new" element={<NewDashboardPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthContextProvider>
  );
}

export default App;
