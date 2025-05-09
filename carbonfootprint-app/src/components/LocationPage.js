// LocationPage.js
import React, { useState } from 'react';
import axios from 'axios';

const LocationPage = () => {
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');

    const handleLocationSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/auth/social/location', { location }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            window.location.href = '/community'; // Redirect to community page after setting location
        } catch (err) {
            setError('An error occurred while updating your location');
        }
    };

    return (
        <div>
            <h2>Provide Your Location</h2>
            <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location"
            />
            <button onClick={handleLocationSubmit}>Submit</button>
            {error && <p>{error}</p>}
        </div>
    );
};

export default LocationPage;
