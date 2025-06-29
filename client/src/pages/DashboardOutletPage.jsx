// src/pages/DashboardOutletPage.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // For notifications
import 'react-toastify/dist/ReactToastify.css';   // Styles for toastify

const DashboardOutletPage = () => {
  return (
    <div className="w-full">
      {/* 
        This component acts as a layout shell for all nested dashboard routes.
        You could add a secondary dashboard-specific navigation bar here,
        a common title section, or a sidebar if your dashboard design requires it.
      */}
      {/* <h2 className="text-2xl font-orbitron text-gray-400 mb-4">Dashboard</h2> */}
      <Outlet />
      {/* ToastContainer can be placed here or in AppLayout for app-wide notifications */}
      {/* If placing here, it's scoped to dashboard pages */}
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" // Or "light", "colored"
      />
    </div>
  );
};

export default DashboardOutletPage;