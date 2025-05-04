import React from 'react';
import DashboardPersonalizable from '../components/dashboard/DashboardPersonalizable';
import { ThemeProvider } from '../components/ui/ThemeContext';
import '../styles/dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="dashboard-page content-fixed" style={{ width: '100%', boxSizing: 'border-box' }}>
        <DashboardPersonalizable />
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;
