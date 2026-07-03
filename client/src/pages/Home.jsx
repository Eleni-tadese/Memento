import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A2E] text-white p-6" id="home-view">
      <div className="max-w-xl text-center space-y-8">
        <h1 className="text-6xl font-black tracking-wider text-[#7B2D8B] drop-shadow-lg animate-pulse">
          Memento
        </h1>
        <p className="text-xl text-gray-300 font-light">
          A private, shared space for exactly two partners to preserve and celebrate their memories together.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#7B2D8B] hover:bg-[#913fa3] font-semibold text-center transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#7B2D8B]"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#16213E] hover:bg-[#20305B] border border-purple-900/30 font-semibold text-center transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#7B2D8B]"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Home;
