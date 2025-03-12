import React from 'react';

const PriceOverview = ({ prices, darkMode = true }) => {
  // Define coins we want to display
  const targetCoins = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'BNBUSDT'];

  // Define coin display names
  const coinNames = {
    'BTCUSDT': 'Bitcoin',
    'ETHUSDT': 'Ethereum',
    'SOLUSDT': 'Solana',
    'XRPUSDT': 'XRP',
    'BNBUSDT': 'Binance Coin'
  };

  // Define coin colors
  const coinColors = {
    'BTCUSDT': '#F7931A',
    'ETHUSDT': '#627EEA',
    'SOLUSDT': '#00FFA3',
    'XRPUSDT': '#23292F',
    'BNBUSDT': '#F3BA2F'
  };

  if (!prices || Object.keys(prices).length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {targetCoins.map(coin => (
          <div key={coin} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 animate-pulse shadow-lg`}>
            <div className="flex items-center mb-2">
              <div className={`h-8 w-8 rounded-full mr-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`h-5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-24`}></div>
            </div>
            <div className={`h-7 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-32 mb-2`}></div>
            <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-16`}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {targetCoins.map(coin => {
        const price = prices[coin];
        if (!price) return null;

        return (
          <div key={coin} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-lg border-l-4`} style={{ borderColor: coinColors[coin] }}>
            <div className="flex items-center mb-2">
              <div
                className="h-8 w-8 rounded-full mr-3 flex items-center justify-center text-black font-bold text-xs"
                style={{ backgroundColor: coinColors[coin] }}
              >
                {coin.substring(0, 3)}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{coinNames[coin]}</div>
            </div>
            <div className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: price > 100 ? 2 : 4 })}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>USDT</div>
          </div>
        );
      })}
    </div>
  );
};

export default PriceOverview;