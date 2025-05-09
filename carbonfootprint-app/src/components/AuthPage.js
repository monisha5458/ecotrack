import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Cities organized by country
const citiesByCountry = {
  "India": [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", 
    "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
    "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal"
  ],
  "United States": [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
    "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"
  ],
  "United Kingdom": [
    "London", "Birmingham", "Manchester", "Glasgow", "Liverpool",
    "Edinburgh", "Bristol", "Sheffield", "Leeds", "Newcastle"
  ],
  "Canada": [
    "Toronto", "Montreal", "Vancouver", "Calgary", "Ottawa",
    "Edmonton", "Winnipeg", "Quebec City", "Hamilton", "Kitchener"
  ],
  "Australia": [
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
    "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Hobart"
  ]
};

const AuthPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [otherCity, setOtherCity] = useState('');
  const [showOtherCity, setShowOtherCity] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  // Handle city selection
  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setCity(selectedCity);
    setShowOtherCity(selectedCity === 'Other');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (isRegistering && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
  
    try {
      const endpoint = isRegistering ? 'signup' : 'login';
      // Use the otherCity value if "Other" is selected
      const finalCity = city === 'Other' ? otherCity : city;
      const payload = isRegistering
        ? { name, email, password, city: finalCity }
        : { email, password };
  
      const response = await fetch(`http://localhost:3000/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Response data:', data); // Debug: Log the entire response data
  
        if (response.ok) {
          if (!isRegistering && data.token) { // Only decode the token during login
            // Decode the JWT token
            const decodedToken = jwtDecode(data.token);
            console.log('Decoded token:', decodedToken); // Debug: Log the decoded token
  
            // Check if the decoded token contains a user ID
            if (decodedToken.userId) {
              const userId = decodedToken.userId;
              console.log(userId);
              localStorage.setItem('userId', userId);
              localStorage.setItem('jwtToken', data.token);
  
              navigate('/home'); // Redirect to CarbonTracker after login
            } else {
              console.error('User ID not found in token:', decodedToken);
              setError('Login successful, but there was an issue with the token. Please contact support.');
            }
          } else if (isRegistering) {
            setError('Registration successful! Please log in.');
            // Clear form fields after registration
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setCity('');
            setOtherCity('');
            setShowOtherCity(false);
            setIsRegistering(false);
          }
        } else {
          // If response is not ok or token is missing, set the error message from the response
          setError(data.message || 'An error occurred. Please try again.');
        }
      } else {
        console.error('Received non-JSON response:', await response.text());
        setError('Received non-JSON response. Please check the server.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again.');
    }
  };
  

  return (
    // <div className="bg-gray-100 min-h-screen flex items-center justify-center">
    //   <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
    //     <h2 className="text-2xl font-semibold mb-4">{isRegistering ? 'Register' : 'Login'}</h2>
    //     <form onSubmit={handleSubmit}>
    //       {error && <p className="text-red-500 mb-4">{error}</p>}
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      {/* EcoTrack Header */}
      <header className="w-full bg-green-600 text-white py-4 text-center">
        <h1 className="text-4xl font-bold">EcoTrack </h1>
        <p className="text-lg">Join EcoTrack – Your Journey to a Greener Tomorrow Starts Here.</p>
      </header>

      {/* Auth Form */}
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-md mt-8">
        <h2 className="text-2xl font-semibold mb-4">{isRegistering ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {isRegistering && (
            <>
              <label className="block text-gray-700 font-bold mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-4"
                required
              />
              
              <label className="block text-gray-700 font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-4"
                required
              />
              
              <label className="block text-gray-700 font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-4"
                required
              />
              
              <label className="block text-gray-700 font-bold mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-4"
                required
              />
              
              <label className="block text-gray-700 font-bold mb-2">City</label>
              <select
                value={city}
                onChange={handleCityChange}
                className="w-full px-3 py-2 border rounded-lg mb-4"
                required
              >
                <option value="">Select your city</option>
                {Object.entries(citiesByCountry).map(([country, cities]) => (
                  <optgroup key={country} label={country}>
                    {cities.map((cityName, index) => (
                      <option key={`${country}-${index}`} value={cityName}>
                        {cityName}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="Other">Other (specify)</option>
              </select>
              
              {showOtherCity && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Specify your city</label>
                  <input
                    type="text"
                    value={otherCity}
                    onChange={(e) => setOtherCity(e.target.value)}
                    placeholder="Enter your city"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              )}
            </>
          )}
          
          {!isRegistering && (
            <>
              <label className="block text-gray-700 font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-4"
                required
              />
              
              <label className="block text-gray-700 font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-4"
                required
              />
            </>
          )}
          
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
          
          <p className="mt-4">
            {isRegistering ? 'Already have an account?' : 'Need an account?'}
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-blue-500 ml-2"
            >
              {isRegistering ? 'Login' : 'Register'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
