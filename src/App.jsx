import { useState, useEffect } from 'react';
import './index.css';
const KEY = '1b5b6c9ae6d14334be272534250205';

function App() {
  const [city, setCity] = useState('London');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState('day');

  // Function to load weather data
  async function fetchWeatherData(query) {
    setLoading(true);
    try {
      // Get current weather
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${KEY}&q=${query}&days=3&aqi=yes&alerts=yes`
      );
      const data = await res.json();
      
      if (data.error) {
        setError(data.error.message);
        setWeatherData(null);
        setForecast(null);
      } else {
        setWeatherData(data);
        setForecast(data.forecast.forecastday);
        setError(null);
        
        // Set time of day based on current time
        const isDay = data.current.is_day;
        setTimeOfDay(isDay ? 'day' : 'night');
      }
    } catch (err) {
      setWeatherData(null);
      setForecast(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Load data on first render
  useEffect(() => {
    fetchWeatherData(city);
    
    // Try to get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherData(`${latitude},${longitude}`);
        },
        () => {
          console.log('Geolocation unavailable, using default city');
        }
      );
    }
  }, []);

  // Handle city input change
  function handleCityChange(e) {
    setCity(e.target.value);
  }

  // Handle form submission
  function handleSubmit(e) {
    e.preventDefault();
    if (city.trim()) {
      fetchWeatherData(city);
    }
  }

  // Format date
  function formatDate(dateString) {
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  // Format time
  function formatTime(timeString) {
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  // Render error message
  function renderError() {
    return <p className="error-message">{error}</p>;
  }

  // Render loading state
  function renderLoading() {
    return <div className="loading">Loading</div>;
  }

  // Render current weather
  function renderWeather() {
    return (
      <div className="weather-card">
        <div className="location-info">
          <h2>{weatherData?.location?.name}, {weatherData?.location?.country}</h2>
          <p className="date">{formatDate(weatherData?.location?.localtime)}</p>
          <p className="time">{formatTime(weatherData?.location?.localtime)}</p>
        </div>
        
        <div className="current-weather">
          <div className="temp-container">
            <p className="temperature">{weatherData?.current?.temp_c}°</p>
            <p className="feels-like">Feels like {weatherData?.current?.feelslike_c}°</p>
          </div>
          <div className="condition-container">
            <img
              src={weatherData?.current?.condition?.icon}
              alt="Weather icon"
              className="weather-icon"
            />
            <p className="condition">{weatherData?.current?.condition.text}</p>
          </div>
        </div>
        
        <div className="weather-details">
          <div className="detail-item">
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{weatherData?.current?.humidity}%</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Wind</span>
            <span className="detail-value">{weatherData?.current?.wind_kph} km/h</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">UV Index</span>
            <span className="detail-value">{weatherData?.current?.uv}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Pressure</span>
            <span className="detail-value">{weatherData?.current?.pressure_mb} mb</span>
          </div>
        </div>
        
        {renderForecast()}
      </div>
    );
  }

  // Render forecast
  function renderForecast() {
    if (!forecast) return null;
    
    return (
      <div className="forecast-container">
        <h3>3-Day Forecast</h3>
        <div className="forecast-items">
          {forecast.map((day, index) => (
            <div key={index} className="forecast-item">
              <p className="forecast-date">{formatDate(day.date)}</p>
              <img 
                src={day.day.condition.icon} 
                alt={day.day.condition.text} 
                className="forecast-icon" 
              />
              <div className="forecast-temps">
                <span className="max-temp">{day.day.maxtemp_c}°</span>
                <span className="min-temp">{day.day.mintemp_c}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${timeOfDay}`}>
      <div className="widget-container">
        <h1 className="app-title">Weather</h1>
        <form onSubmit={handleSubmit} className="search-container">
          <input
            value={city}
            placeholder="Enter city name"
            className="search-input"
            onChange={handleCityChange}
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {loading && renderLoading()}
        {error && renderError()}
        {!loading && !error && weatherData && renderWeather()}
      </div>
    </div>
  );
}