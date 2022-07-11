import React from "react";
import { useParams } from "react-router-dom";

function Dashboard() {

  const { dashboardId } = useParams();
  
  return (
    <div>
      This is dashboard page {dashboardId}
    </div>
  )
}

export default Dashboard;
