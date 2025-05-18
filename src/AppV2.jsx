import { useState, useEffect } from 'react';
import './index.css';
const KEY = '1b5b6c9ae6d14334be272534250205';

function App() {
  const [city, setCity] = useState('Voronezh');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка данных о погоде при первом рендере
  useEffect(() => {
    // Сначала загружаем данные по городу по умолчанию
    fetchWeatherData(city);

    // Затем пытаемся получить геолокацию
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherData(`${latitude},${longitude}`);
        },
        () => {
          // Если геолокация недоступна, продолжаем использовать город по умолчанию
          console.log('Геолокация недоступна, используем город по умолчанию');
        },
      );
    }
  }, []);

  // Функция для загрузки данных о погоде
  async function fetchWeatherData(query) {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${KEY}&q=${query}`,
      );
      const data = await res.json();
      console.log(data);
      if (data.error) {
        setError(data.error.message);
        setWeatherData(null);
      } else {
        setWeatherData(data);
        setError(null);
      }
    } catch (err) {
      setWeatherData(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Обработчик изменения города
  function handleCityChange(e) {
    const newCity = e.target.value;
    setCity(newCity);
  }

  // Обработчик отправки формы
  function handleSubmit(e) {
    e.preventDefault();
    if (city.trim()) {
      fetchWeatherData(city);
    }
  }

  function renderError() {
    return <p className='error-message'>{error}</p>;
  }

  function renderLoading() {
    return <div className='loading'>Загрузка...</div>;
  }

  function renderWeather() {
    return (
      <div className='weather-card'>
        <h2>
          {weatherData?.location?.name}, {weatherData?.location?.country}
        </h2>
        <div className='weather-main'>
          <img
            src={weatherData?.current?.condition?.icon}
            alt='Иконка погоды'
            className='weather-icon'
          />
          <p className='temperature'>{weatherData?.current?.temp_c}°C</p>
        </div>
        <p className='condition'>{weatherData?.current?.condition.text}</p>
        <div className='weather-details'>
          <p>Влажность: {weatherData?.current?.humidity}%</p>
          <p>Ветер: {weatherData?.current?.wind_kph} км/ч</p>
        </div>
      </div>
    );
  }

  return (
    <div className='app'>
      <div className='widget-container'>
        <h1 className='app-title'>Погода</h1>
        <form onSubmit={handleSubmit} className='search-container'>
          <input
            value={city}
            placeholder='Введите название города'
            className='search-input'
            onChange={handleCityChange}
          />
          <button type='submit' className='search-button'>
            Поиск
          </button>
        </form>

        {loading && renderLoading()}
        {error && renderError()}
        {!loading && !error && weatherData && renderWeather()}
      </div>
    </div>
  );
}

export default App;
