import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

const decodeHtml = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

const HomePage = () => {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState({
    temperature: 'N/A',
    feels_like: 'N/A',
    humidity: 'N/A',
    pressure: 'N/A',
    wind_speed: 'N/A',
    wind_deg: 'N/A',
    visibility: 'N/A',
    sunrise: 'N/A',
    sunset: 'N/A',
    description: 'N/A',
  });
  const [aqiData, setAqiData] = useState('N/A');
  const [newsLinks, setNewsLinks] = useState([]);
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [communityPosts, setCommunityPosts] = useState('No posts available');

  const getAQIScale = (aqi) => {
    switch (aqi) {
      case 1:
        return { label: 'Good', color: 'green' };
      case 2:
        return { label: 'Fair', color: 'yellow' };
      case 3:
        return { label: 'Moderate', color: 'orange' };
      case 4:
        return { label: 'Poor', color: 'red' };
      case 5:
        return { label: 'Very Poor', color: 'purple' };
      default:
        return { label: 'Unknown', color: 'gray' };
    }
  };

  const handleSearch = async () => {
    try {
      console.log(`Searching for location: ${location}`);
      const [city, state] = location.split(',').map(part => part.trim());

      if (!city || !state) {
        console.error('Invalid location format. Please enter in the format "City, State".');
        setWeatherData({
          temperature: 'N/A',
          feels_like: 'N/A',
          humidity: 'N/A',
          pressure: 'N/A',
          wind_speed: 'N/A',
          wind_deg: 'N/A',
          visibility: 'N/A',
          sunrise: 'N/A',
          sunset: 'N/A',
          description: 'N/A',
        });
        setAqiData('N/A');
        setNewsLinks([]);
        setYoutubeLinks([]);
        setCommunityPosts('No posts available');
        return;
      }

      // Fetch weather data
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},${state}&appid=1a59833386b06e184dc780149c3571ea&units=metric`
      );
      console.log('Weather data:', weatherResponse.data);

      const { coord, main, weather, wind, visibility, sys } = weatherResponse.data;
      const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString();
      const sunset = new Date(sys.sunset * 1000).toLocaleTimeString();
      const windSpeedKPH = (wind.speed * 3.6).toFixed(2); 

      setWeatherData({
        temperature: main.temp,
        feels_like: main.feels_like,
        humidity: main.humidity,
        pressure: main.pressure,
        wind_speed: windSpeedKPH,
        wind_deg: wind.deg,
        visibility,
        sunrise,
        sunset,
        description: weather[0].description,
      });

      // Fetch AQI data
      const aqiResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coord.lat}&lon=${coord.lon}&appid=1a59833386b06e184dc780149c3571ea`
      );
      console.log('AQI data:', aqiResponse.data);

      const aqi = aqiResponse.data.list[0].main.aqi;
      setAqiData(aqi);

      // Fetch news data
      const newsResponse = await axios.get(
        `https://newsapi.org/v2/everything?q=${city} ${state} weather&apiKey=22f8fc1e558e410fabdeffac7981d369`
      );
      console.log('News data:', newsResponse.data);
      const topArticles = newsResponse.data.articles.slice(0, 3);
      setNewsLinks(topArticles.map(article => ({
        title: decodeHtml(article.title), 
        url: article.url,
        thumbnail: article.urlToImage || 'https://via.placeholder.com/300x200'
      })));

      // Fetch YouTube Videos
      const youtubeResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${city} ${state} weather&key=AIzaSyCTW6fuXQKglPPuBCUZdbnuelhEJ1C9lhg`
      );
      console.log('YouTube data:', youtubeResponse.data);

      const topVideos = youtubeResponse.data.items.slice(0, 3);
      setYoutubeLinks(topVideos.map(video => ({
        title: decodeHtml(video.snippet.title),
        url: `https://www.youtube.com/embed/${video.id.videoId}`,
        thumbnail: video.snippet.thumbnails.high.url
      })));

      // Update community posts
      setCommunityPosts('Recent community discussion about ' + location);

    } catch (error) {
      console.error('Error fetching data:', error);
      setWeatherData({
        temperature: 'N/A',
        feels_like: 'N/A',
        humidity: 'N/A',
        pressure: 'N/A',
        wind_speed: 'N/A',
        wind_deg: 'N/A',
        visibility: 'N/A',
        sunrise: 'N/A',
        sunset: 'N/A',
        description: 'N/A',
      });
      setAqiData('N/A');
      setNewsLinks([]);
      setYoutubeLinks([]);
      setCommunityPosts('No posts available');
    }
  };

  const renderWeatherInfo = () => {
    if (!weatherData.temperature) return null;

    return (
      <div className="grid grid-cols-3 gap-4 my-8">
        <div className="text-center bg-white p-4 rounded shadow-lg">
          <h3 className="text-lg font-semibold">Temperature</h3>
          <p className="text-2xl">{weatherData.temperature}°C</p>
        </div>
        <div className="text-center bg-white p-4 rounded shadow-lg">
          <h3 className="text-lg font-semibold">Feels Like</h3>
          <p className="text-2xl">{weatherData.feels_like}°C</p>
        </div>
        <div className="text-center bg-white p-4 rounded shadow-lg">
          <h3 className="text-lg font-semibold">Humidity</h3>
          <p className="text-2xl">{weatherData.humidity}%</p>
        </div>
        <div className="text-center bg-white p-4 rounded shadow-lg">
          <h3 className="text-lg font-semibold">Wind Speed</h3>
          <p className="text-2xl">{weatherData.wind_speed} KPH</p>
        </div>
        <div className="text-center bg-white p-4 rounded shadow-lg">
          <h3 className="text-lg font-semibold">Visibility</h3>
          <p className="text-2xl">{weatherData.visibility / 1000} km</p>
        </div>
        <div className="text-center bg-white p-4 rounded shadow-lg">
          <h3 className="text-lg font-semibold">Pressure</h3>
          <p className="text-2xl">{weatherData.pressure} hPa</p>
        </div>
        <div className="text-center bg-white p-4 rounded shadow-lg">
          <h3 className="text-lg font-semibold">Sunrise</h3>
          <p className="text-2xl">{weatherData.sunrise}</p>
        </div>
        <div className="text-center bg-white p-4 rounded shadow-lg">
          <h3 className="text-lg font-semibold">Sunset</h3>
          <p className="text-2xl">{weatherData.sunset}</p>
        </div>
        {aqiData && (
          <div className="text-center bg-white p-4 rounded shadow-lg">
            <h3 className="text-lg font-semibold">AQI</h3>
            <p className="text-2xl" style={{ color: getAQIScale(aqiData).color }}>
              {aqiData} ({getAQIScale(aqiData).label})
            </p>
          </div>
        )}
      </div>
    );
  };

  const getLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get city and state
        const reverseGeocodeResponse = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=3e2854e566e542ff8c1972c4cbd35e3a`
        );
        const { county, state } = reverseGeocodeResponse.data.results[0].components;
        console.log(reverseGeocodeResponse.data.results[0].components);
        if (county && state) {
          setLocation(`${county}, ${state}`);
          handleSearch();
        } else {
          console.error('Unable to determine city and state from coordinates.');
        }
      }, (error) => {
        console.error('Error getting location:', error);
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    getLocation();
  }, []);


  const renderCharts = () => {
    if (!weatherData.temperature) return null;

    const temperatureData = {
      labels: ['Temperature', 'Feels Like'],
      datasets: [
        {
          label: 'Temperature (°C)',
          data: [weatherData.temperature, weatherData.feels_like],
          backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
          borderWidth: 1,
        },
      ],
    };

    const humidityData = {
      labels: ['Humidity', 'Pressure', 'Wind Speed'],
      datasets: [
        {
          label: 'Humidity (%) / Pressure (hPa) / Wind Speed (m/s)',
          data: [weatherData.humidity, weatherData.pressure, weatherData.wind_speed],
          backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
          borderWidth: 1,
        },
      ],
    };

    return (
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-white p-4 rounded shadow-lg">
          <h3 className="text-lg font-semibold text-center mb-4">Temperature Chart</h3>
          <Bar data={temperatureData} />
        </div>
        <div className="bg-white p-4 rounded shadow-lg">
          <h3 className="text-lg font-semibold text-center mb-4">Humidity, Pressure & Wind Speed Chart</h3>
          <Line data={humidityData} />
        </div>
      </div>
    );
  };

  const renderNewsLinks = () => {
    return newsLinks.length > 0 ? (
      <div className="my-8">
        <h3 className="text-lg font-semibold mb-4">Latest News</h3>
        <div className="grid grid-cols-3 gap-4">
          {newsLinks.map((news, index) => (
            <div key={index} className="bg-white p-4 rounded shadow-lg">
              <img src={news.thumbnail} alt="News thumbnail" className="w-full h-48 object-cover mb-4" />
              <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-500">
                {news.title}
              </a>
            </div>
          ))}
        </div>
      </div>
    ) : null;
  };

  const renderYouTubeLinks = () => {
    return youtubeLinks.length > 0 ? (
      <div className="my-8">
        <h3 className="text-lg font-semibold mb-4">YouTube Videos</h3>
        <div className="grid grid-cols-3 gap-4">
          {youtubeLinks.map((video, index) => (
            <div key={index} className="bg-white p-4 rounded shadow-lg">
              <img src={video.thumbnail} alt="Video thumbnail" className="w-full h-48 object-cover mb-4" />
              <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-500">
                {video.title}
              </a>
            </div>
          ))}
        </div>
      </div>
    ) : null;
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100">
      <div className="flex justify-center mb-8">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location (e.g., City, State)"
          className="p-2 border rounded w-64"
        />
        <button onClick={handleSearch} className="p-2 bg-blue-500 text-white rounded ml-2">
          Search
        </button>
      </div>
      {renderWeatherInfo()}
      {renderCharts()}
      {renderNewsLinks()}
      {renderYouTubeLinks()}
    </div>
  );
};

export default HomePage;
