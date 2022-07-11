import React from "react";
import { useParams } from "react-router-dom";
import Widget from "../components/widget";

function Dashboard() {
  const { dashboardId } = useParams();
  
  return (
    <div className="dashboard-page">
      This is dashboard page {dashboardId}

      <Widget />
    </div>
  )
}

export default Dashboard;
