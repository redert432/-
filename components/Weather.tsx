import React, { useState, useEffect } from 'react';

interface WeatherProps {
  location: { latitude: number; longitude: number } | null;
}

const getWeatherIcon = (description: string): string => {
    const desc = description.toLowerCase();
    if (desc.includes('sunny') || desc.includes('clear')) return '☀️';
    if (desc.includes('partly cloudy')) return '🌤️';
    if (desc.includes('cloudy')) return '☁️';
    if (desc.includes('overcast')) return '🌥️';
    if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
    if (desc.includes('rain') || desc.includes('showers')) return '🌦️';
    if (desc.includes('thunder')) return '⛈️';
    if (desc.includes('snow')) return '❄️';
    return '🌍';
};


const Weather: React.FC<WeatherProps> = ({ location }) => {
  const [weather, setWeather] = useState<{ city: string; temp: number; icon: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
        setLoading(true);
        const url = location 
            ? `https://wttr.in/${location.latitude},${location.longitude}?format=j1`
            : 'https://wttr.in/Riyadh?format=j1';
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Weather data not available');
            }
            const data = await response.json();
            
            const current = data.current_condition[0];
            const area = data.nearest_area[0];
            
            setWeather({
                city: area.areaName[0].value,
                temp: parseInt(current.temp_C, 10),
                icon: getWeatherIcon(current.weatherDesc[0].value),
            });
        } catch (error) {
            console.error("Failed to fetch weather:", error);
            setWeather(null);
        } finally {
            setLoading(false);
        }
    };

    fetchWeather();
  }, [location]);

  if (loading) {
    return (
       <div className="text-center p-4 rounded-lg bg-[rgba(var(--color-bg-muted),0.3)] border border-[rgba(var(--color-border),0.2)] w-full sm:w-auto min-w-[200px]">
          <p className="text-[rgb(var(--color-text-muted))]">جاري جلب الطقس...</p>
       </div>
    );
  }

  if (!weather) {
     return (
       <div className="text-center p-4 rounded-lg bg-[rgba(var(--color-bg-muted),0.3)] border border-[rgba(var(--color-border),0.2)] w-full sm:w-auto min-w-[200px]">
          <p className="text-sm text-[rgb(var(--color-text-muted))]">خدمة الطقس غير متاحة حالياً.</p>
       </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-[rgba(var(--color-bg-muted),0.3)] border border-[rgba(var(--color-border),0.2)] w-full sm:w-auto">
      <div className="text-4xl">{weather.icon}</div>
      <div>
        <p className="text-2xl font-bold text-[rgb(var(--color-text-main))]">{weather.temp}°C</p>
        <p className="text-sm text-[rgb(var(--color-text-muted))]">{weather.city}</p>
      </div>
    </div>
  );
};

export default Weather;