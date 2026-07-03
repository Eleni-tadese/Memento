import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signup as apiSignup } from '../api/auth';

const Signup = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login: contextLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const data = await apiSignup(email, password, displayName);
      contextLogin(data.token, data.user, data.relationshipId);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Signup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1A1A2E] p-4 text-white" id="signup-view">
      <div className="w-full max-w-md bg-[#16213E] rounded-2xl shadow-xl p-8 border border-purple-900/30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-wider text-[#7B2D8B] mb-2 drop-shadow-md">
            Memento
          </h1>
          <p className="text-gray-400 text-sm">Create your space</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="fullname-input">
              Full Name
            </label>
            <input
              id="fullname-input"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-[#1A1A2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B2D8B] focus:border-transparent transition-all"
              placeholder="Alex Johnson"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email-input">
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#1A1A2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B2D8B] focus:border-transparent transition-all"
              placeholder="alex@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password-input">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#1A1A2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B2D8B] focus:border-transparent transition-all"
              placeholder="•••••••• (min 8 chars)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-[#7B2D8B] hover:bg-[#913fa3] text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#7B2D8B] focus:ring-offset-2 focus:ring-offset-[#16213E] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  box-sizing="border-box"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-950/20 py-2 px-3 rounded border border-red-900/30">
              {error}
            </div>
          )}
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#7B2D8B] hover:text-[#913fa3] font-medium transition-colors">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Signup;
