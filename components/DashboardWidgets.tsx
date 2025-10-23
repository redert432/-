import React from 'react';
import Clock from './Clock';
import Weather from './Weather';

interface DashboardWidgetsProps {
  location: { latitude: number; longitude: number } | null;
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ location }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 fade-in">
        <Clock />
        <Weather location={location} />
    </div>
  );
};

export default DashboardWidgets;