import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { FaHome, FaUsers, FaChartLine, FaMapMarkerAlt, FaSignOutAlt, FaLeaf, FaTrophy, FaCar, FaBolt, FaTrash, FaUserCircle } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CarbonTracker = () => {
  const navigate = useNavigate();
  const [transportationData, setTransportationData] = useState([{ distance: '', mode: '' }]);
  const [electricityData, setElectricityData] = useState({ previousUsage: '', todayUsage: '' });
  const [wasteData, setWasteData] = useState({ dryWaste: '', wetWaste: '' });
  const [totalEmissions, setTotalEmissions] = useState({ transportation: 0, electricity: 0, waste: 0 });
  const [historicalData, setHistoricalData] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userCity, setUserCity] = useState('');
  const [userName, setUserName] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('jwtToken');
  const [recordDate, setRecordDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  

  useEffect(() => {
    if (!userId || !token) {
      navigate('/authpage');
    } else {
      fetchUserData();
      fetchDashboardData();
    }
  }, [navigate, userId, token]);

  const fetchUserData = async () => {
    console.log(userId);
    try {
      const response = await axios.get(`http://localhost:3000/carbonTrack/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setUserEmail(response.data.email);
      setUserCity(response.data.city);
      setUserName(response.data.name);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/carbonTrack/user/${userId}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setHistoricalData(response.data);
      updateChartData(response.data);
      updateTotalEmissions(response.data[0]); // Assuming the first item is the most recent
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/carbonTrack/leaderBoard/${userCity}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      // Normalize backend field `totalCarbon` to `totalCarbonFootprint` expected by frontend
    const normalizedData = response.data.map(user => ({
      ...user,
      totalCarbonFootprint: user.totalCarbon // adapt to expected key
    }));

    setLeaderboardData(normalizedData);
      
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  };


  const updateChartData = (data) => {
    const labels = data.map(item => item.date).reverse();
    const carbonFootprints = data.map(item => item.totalCarbonFootprint).reverse();

    setChartData({
      labels,
      datasets: [
        {
          label: 'Total Carbon Footprint',
          data: carbonFootprints,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    });
  };

  const updateTotalEmissions = (latestData) => {
    // This is a placeholder. You might need to adjust this based on how your backend provides category-specific data
    setTotalEmissions({
      transportation: latestData.totalCarbonFootprint * 0.5, // Example: 40% of total
      electricity: latestData.totalCarbonFootprint * 0.3, // Example: 30% of total
      waste: latestData.totalCarbonFootprint * 0.2 // Example: 30% of total
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('jwtToken');
    navigate('/authpage');
  };

  const handleTransportationChange = (index, e) => {
    const updatedTransportationData = [...transportationData];
    updatedTransportationData[index][e.target.name] = e.target.value;
    setTransportationData(updatedTransportationData);
  };

  const handleAddTransportation = () => {
    setTransportationData([...transportationData, { distance: '', mode: '' }]);
  };

  const handleElectricityChange = (e) => {
    setElectricityData({
      ...electricityData,
      [e.target.name]: e.target.value,
    });
  };

  const handleWasteChange = (e) => {
    setWasteData({
      ...wasteData,
      [e.target.name]: e.target.value,
    });
  };

  const validateInputs = () => {
    if (
      transportationData.some(data => !data.distance || !data.mode) ||
      !electricityData.previousUsage ||
      !electricityData.todayUsage ||
      !wasteData.dryWaste ||
      !wasteData.wetWaste
    ) {
      setError('Please fill in all fields.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
  
    try {
      // 🔹 Step 1: Fetch user name & city by userId
      const userInfoResponse = await axios.get(`http://localhost:3000/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
  
      const { name, city } = userInfoResponse.data;
  
      // 🔹 Step 2: Build final payload
      const transformedData = {
        userId: userId,
        city,
        name,
        date: recordDate, 
        transportations: transportationData.map(item => ({
          mode: item.mode,
          distance: parseInt(item.distance),
          time: item.time ? parseInt(item.time) : 0
        })),
        wastages: [{
          wetWaste: parseInt(wasteData.wetWaste),
          dryWaste: parseInt(wasteData.dryWaste)
        }],
        prevWatts: parseInt(electricityData.previousUsage),
        todayWatts: parseInt(electricityData.todayUsage)
      };
  
      // 🔹 Step 3: Submit the data
      const response = await axios.post('http://localhost:3000/carbonTrack/calculateAndSubmit', transformedData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
  
      console.log(response.data);
      alert(`Your total carbon footprint is ${response.data.totalCarbonEmission.toFixed(2)} kgCO2e`);
      fetchDashboardData();
    }  catch (error) {
      // ← Replace your old catch here with this:
      console.error('Submission failed:', error.response?.data || error.message);
  
      const serverMessage = error.response?.data?.message;
      setError(serverMessage || 'Failed to submit data. Please try again.');
    }
  };
  
  

  const renderEmissionsDetails = () => {
    switch (activeCategory) {
      case 'transportation':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-2">Transportation Emissions</h3>
            <p>Total: {totalEmissions.transportation.toFixed(2)} kgCO2e</p>
            {/* Add more detailed breakdown here if available */}
          </div>
        );
      case 'electricity':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-2">Electricity Emissions</h3>
            <p>Total: {totalEmissions.electricity.toFixed(2)} kgCO2e</p>
            {/* Add more detailed breakdown here if available */}
          </div>
        );
      case 'waste':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-2">Waste Emissions</h3>
            <p>Total: {totalEmissions.waste.toFixed(2)} kgCO2e</p>
            {/* Add more detailed breakdown here if available */}
          </div>
        );
      default:
        return null;
    }
  };

  const renderLeaderboard = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
          <FaTrophy className="mr-2 text-yellow-500" />
          Carbon Footprint Leaderboard
        </h2>
        
        {leaderboardData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-5 py-3 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                  <th className="px-5 py-3 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">City</th>
                  <th className="px-5 py-3 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Carbon Footprint</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((user, index) => (
                  <tr key={index} className={index === 0 ? "bg-green-50" : "hover:bg-gray-50"}>
                    <td className="px-5 py-3 border-b border-gray-200">
                      <div className="flex items-center">
                        {index < 3 ? (
                          <span className={`text-lg font-bold ${
                            index === 0 ? "text-yellow-500" : 
                            index === 1 ? "text-gray-400" : 
                            "text-yellow-700"
                          }`}>
                            {index + 1}
                          </span>
                        ) : (
                          <span className="text-gray-800">{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      <div className="flex items-center">
                        <FaUserCircle className="text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-red-400 mr-1" />
                        <span className="text-gray-900">{user.city}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 border-b border-gray-200 text-sm">
                      <span className={`py-1 px-3 rounded-full text-xs ${
                        index === 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {typeof user.totalCarbon === 'number' && !isNaN(user.totalCarbon)
                          ? user.totalCarbon.toFixed(2)
                          : 'N/A'} kgCO2e
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No leaderboard data available for your city yet.</p>
          </div>
        )}
      </div>
    );
  };
  

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-gradient-to-r from-green-800 to-green-600 text-white p-5 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <FaLeaf className="text-2xl mr-2" />
            <h1 className="text-2xl font-bold">Carbon Tracker</h1>
          </div>
          <nav className="flex flex-wrap justify-center md:justify-end space-x-2 md:space-x-6">
            <Link to="http://localhost:3001/home" className="px-3 py-2 flex items-center hover:bg-green-700 rounded-lg transition-colors">
              <FaHome className="mr-1" />
              <span>Home</span>
            </Link>
            <Link to="/community" className="px-3 py-2 flex items-center hover:bg-green-700 rounded-lg transition-colors">
              <FaUsers className="mr-1" />
              <span>Community</span>
            </Link>
            <div className="px-3 py-2 flex items-center text-green-200">
              <FaUserCircle className="mr-1" />
              <span>{userName || userEmail}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <FaSignOutAlt className="mr-1" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Your Carbon Footprint Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-5 transition-transform hover:transform hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-3">
                  <FaCar size={24} />
                </div>
                <h3 className="text-lg font-semibold">Transportation</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800">{totalEmissions.transportation.toFixed(2)}</p>
              <p className="text-sm text-gray-500">kgCO2e</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-5 transition-transform hover:transform hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                  <FaBolt size={24} />
                </div>
                <h3 className="text-lg font-semibold">Electricity</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800">{totalEmissions.electricity.toFixed(2)}</p>
              <p className="text-sm text-gray-500">kgCO2e</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-5 transition-transform hover:transform hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="p-3 rounded-full bg-red-100 text-red-600 mr-3">
                  <FaTrash size={24} />
                </div>
                <h3 className="text-lg font-semibold">Waste</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800">{totalEmissions.waste.toFixed(2)}</p>
              <p className="text-sm text-gray-500">kgCO2e</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={() => { 
                setShowLeaderboard(!showLeaderboard); 
                if (!showLeaderboard) fetchLeaderboardData(); 
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg inline-flex items-center transition-colors shadow-sm"
            >
              <FaTrophy className="mr-2" />
              {showLeaderboard ? 'Hide Leaderboard' : 'View Leaderboard'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
        
        {showLeaderboard && renderLeaderboard()}
      </div>

      <section className="mb-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
          <FaChartLine className="mr-2 text-green-600" />
          Carbon Emissions History
        </h2>
        <div className="max-w-4xl mx-auto">
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  backgroundColor: 'rgba(53, 162, 135, 0.9)',
                  titleFont: {
                    weight: 'bold'
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Carbon Footprint (kgCO2e)'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Date'
                  }
                }
              }
            }}
          />
        </div>
      </section>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
          <FaLeaf className="mr-2 text-green-600" />
          Track Your Daily Carbon Footprint
        </h2>
        
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Record Date</label>
          <input
            type="date"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
          />
        </div>
        
        {/* Transportation Data */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
            <FaCar className="mr-2 text-green-600" />
            Transportation
          </h3>
          
          <div className="space-y-4">
            {transportationData.map((data, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    name="distance"
                    value={data.distance}
                    onChange={(e) => handleTransportationChange(index, e)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                    placeholder="e.g. 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Transport</label>
                  <select
                    name="mode"
                    value={data.mode}
                    onChange={(e) => handleTransportationChange(index, e)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  >
                    <option value="">Select a mode</option>
                    <option value="car">Car</option>
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                    <option value="plane">Plane</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="walking">Walking</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={handleAddTransportation}
            className="mt-3 inline-flex items-center px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Transportation
          </button>
        </div>

        {/* Electricity Data */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
            <FaBolt className="mr-2 text-yellow-500" />
            Electricity
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Previous Month Usage (kWh)</label>
              <input
                type="number"
                name="previousUsage"
                value={electricityData.previousUsage}
                onChange={handleElectricityChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                placeholder="e.g. 200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Today's Usage (kWh)</label>
              <input
                type="number"
                name="todayUsage"
                value={electricityData.todayUsage}
                onChange={handleElectricityChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                placeholder="e.g. 250"
              />
            </div>
          </div>
        </div>

        {/* Waste Data */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-700">
            <FaTrash className="mr-2 text-red-500" />
            Waste
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dry Waste (kg)</label>
              <input
                type="number"
                name="dryWaste"
                value={wasteData.dryWaste}
                onChange={handleWasteChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                placeholder="e.g. 2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wet Waste (kg)</label>
              <input
                type="number"
                name="wetWaste"
                value={wasteData.wetWaste}
                onChange={handleWasteChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                placeholder="e.g. 3"
              />
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium text-lg shadow-sm transform transition hover:scale-105"
          >
            Calculate & Submit
          </button>
        </div>
      </form>

      <div className="mt-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Detailed Emissions</h2>
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={() => setActiveCategory('transportation')}
            className={`px-4 py-2 rounded ${activeCategory === 'transportation' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Transportation
          </button>
          <button
            onClick={() => setActiveCategory('electricity')}
            className={`px-4 py-2 rounded ${activeCategory === 'electricity' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Electricity
          </button>
          <button
            onClick={() => setActiveCategory('waste')}
            className={`px-4 py-2 rounded ${activeCategory === 'waste' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Waste
          </button>
        </div>
        <div className="bg-white p-4 rounded shadow-lg">
          {renderEmissionsDetails()}
        </div>
        
      </div>
    </div>
  );
};

export default CarbonTracker;