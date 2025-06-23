import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-2xl text-gray-600">Page Not Found</p>
      <Link to="/" className="mt-4 px-4 py-2 text-white bg-blue-600 rounded-md">
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage; 