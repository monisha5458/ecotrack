// src/components/GetStartedPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const GetStartedPage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/authpage'); // Navigate to Home page
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source
          src="https://media.istockphoto.com/id/1253263447/video/beautiful-summer-morning-in-the-forest-sun-rays-break-through-the-foliage-of-magnificent.mp4?s=mp4-640x640-is&k=20&c=g0XCZSy1Fo646q8Iy3EJ7Hkg3HB8CPSGpuK4rYQUfTY="
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10" />
      {/* <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 z-10" /> */}

      {/* Text content */}
      <div className="relative z-20 flex items-center justify-center h-full text-center text-white">
        <div>
          <h1 className="text-5xl font-bold mb-6">Welcome to EcoTrack </h1>
          <p className="text-xl mb-8">Track your carbon footprint, monitor weather, and join the green community.</p>
          <button
            onClick={handleStart}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetStartedPage;
