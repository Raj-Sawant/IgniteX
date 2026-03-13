import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Thermometer, Clock } from 'lucide-react';

interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
  time: string;
}

export const LiveWeatherCard: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching weather for a sample off-road location (e.g., Moab, Utah)
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=38.5733&longitude=-109.5498&current_weather=true');
        const data = await res.json();
        setWeather(data.current_weather);
      } catch (error) {
        console.error("Failed to fetch weather", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const getWeatherDescription = (code: number) => {
    if (code <= 3) return 'Clear / Partly Cloudy';
    if (code <= 48) return 'Fog / Overcast';
    if (code <= 67) return 'Rain Events';
    if (code <= 77) return 'Snow Events';
    return 'Storm Conditions';
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-5 shadow-lg shadow-black/20 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-1.5 bg-zinc-800 rounded-lg">
          <Clock className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">Live Weather & Time Context</h3>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center p-8 space-x-2">
            <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500/50"></div>
            <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500/50 delay-75"></div>
            <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500/50 delay-150"></div>
        </div>
      ) : weather ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
            <div className="p-2 bg-zinc-900 rounded-md text-yellow-400">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Time & Temp (Moab, UT)</p>
              <p className="text-sm text-zinc-200 font-medium">
                {new Date(weather.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {weather.temperature}°C
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
            <div className="p-2 bg-zinc-900 rounded-md text-emerald-400">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Weather Event</p>
              <p className="text-sm text-zinc-200 font-medium">{getWeatherDescription(weather.weathercode)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
            <div className="p-2 bg-zinc-900 rounded-md text-amber-400">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Wind Speed</p>
              <p className="text-sm text-zinc-200 font-medium">{weather.windspeed} km/h</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-zinc-500 text-sm p-4">Unable to load weather data.</div>
      )}
    </div>
  );
};
