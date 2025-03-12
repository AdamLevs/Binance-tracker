import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAccountInfo, getCurrentPrices, processPortfolio, getTopCoinPrices } from '../services/binanceApi';
import AssetTable from './AssetTable';
import PortfolioChart from './PortfolioChart';
import PriceOverview from './PriceOverview';

const Dashboard = () => {
  const { credentials, logout, createSignature } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [portfolio, setPortfolio] = useState({ assets: [] });
  const [topPrices, setTopPrices] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');

  // Function to load data
  const loadData = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      // Always fetch top coin prices regardless of account status
      console.log('Loading top coin prices');
      try {
        const topCoins = await getTopCoinPrices();
        setTopPrices(topCoins);
        console.log('Top coin prices loaded successfully');
      } catch (priceError) {
        console.error('Failed to load top prices:', priceError);
        setError('Could not load current prices. Please check your connection.');
      }

      // If we have valid credentials, try to get account info
      if (credentials.apiKey && credentials.apiSecret) {
        console.log('Attempting to load account data');
        try {
          // First get all prices
          let prices = {};
          try {
            prices = await getCurrentPrices();
            console.log('All prices loaded successfully');
          } catch (allPricesError) {
            console.error('Failed to load all prices:', allPricesError);
            // Continue with top prices if available
            prices = topPrices;
          }

          const accountData = await getAccountInfo(credentials, createSignature);
          console.log('Account data loaded successfully');

          const assets = processPortfolio(accountData, prices);
          console.log(`Processed ${assets.length} assets with value`);

          setPortfolio({
            assets,
            totalValue: assets.reduce((sum, asset) => sum + asset.value, 0)
          });

          // Set last updated timestamp
          setLastUpdated(new Date());
        } catch (accountError) {
          console.error('Error fetching account:', accountError);
          setError(`Failed to load account data: ${accountError.message}`);
          setPortfolio({ assets: [] });
        }
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [credentials, createSignature, topPrices]);

  // Load data on component mount
  useEffect(() => {
    loadData();

    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(() => loadData(true), 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = () => {
    loadData(true);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (loading && !refreshing) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mx-auto mb-4 ${darkMode ? 'border-blue-500' : 'border-blue-600'}`}></div>
          <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Binance Portfolio</h1>
              {lastUpdated && (
                <span className={`ml-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {refreshing && (
                <span className={`animate-pulse ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Refreshing...
                </span>
              )}

              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>

              <button
                onClick={handleRefresh}
                className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                disabled={refreshing}
                title="Refresh data"
              >
                Refresh
              </button>

              <button
                onClick={handleLogout}
                className={`flex items-center px-4 py-2 rounded-md ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${refreshing ? 'opacity-80' : 'opacity-100'} transition-opacity`}>
        {error && (
          <div className={`${darkMode ? 'bg-red-900 border-red-700' : 'bg-red-100 border-red-400'} border text-white px-4 py-3 rounded mb-6`}>
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {/* Portfolio summary */}
        {portfolio.assets.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Total Portfolio Value</h2>
              <div className="text-3xl font-bold">
                ${portfolio.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        )}

        {/* Price Overview Section */}
        <section className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Top Coin Prices
          </h2>
          <PriceOverview
            prices={topPrices}
            darkMode={darkMode}
          />
        </section>

        {/* Portfolio Charts */}
        {portfolio.assets.length > 0 && (
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Portfolio Overview
              </h2>
              <div className="flex space-x-2">
                {['24h', '7d', '30d', 'all'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    className={`px-3 py-1 text-sm rounded ${
                      timeframe === period
                        ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                        : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300')
                    }`}
                  >
                    {period.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-lg mb-6`}>
              <h3 className="text-lg font-medium mb-3">Asset Allocation</h3>
              <div className="h-64">
                <PortfolioChart
                  assets={portfolio.assets}
                  type="pie"
                  darkMode={darkMode}
                />
              </div>
            </div>

            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Your Assets
            </h2>
            <AssetTable
              assets={portfolio.assets}
              darkMode={darkMode}
            />
          </section>
        )}

        {/* No Assets Message */}
        {portfolio.assets.length === 0 && credentials.apiKey && (
          <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center shadow-lg`}>
            <h2 className="text-xl font-semibold mb-4">No Assets Found</h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              We couldn't find any assets in your Binance account, or your API key may not have permission to view your account balance.
            </p>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Make sure your API key has "Read-Only" permissions enabled for your account data.
            </p>
          </section>
        )}

        {/* No prices message */}
        {Object.keys(topPrices).length === 0 && (
          <div className={`mt-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}>
            <h3 className="text-xl font-semibold mb-2">Unable to Load Market Data</h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              We couldn't connect to Binance to retrieve current market prices. This could be due to network issues or API restrictions.
            </p>
            <button
              onClick={handleRefresh}
              className={`mt-4 px-4 py-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded`}
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-4 mt-auto`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Binance Portfolio Tracker - Secure and Private
          </p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
            All data is processed locally. Your API keys are never sent to any server.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;