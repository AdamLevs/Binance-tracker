import React, { useState } from 'react';

const AssetTable = ({ assets, darkMode = true }) => {
  const [sortField, setSortField] = useState('value');
  const [sortDirection, setSortDirection] = useState('desc');

  if (!assets || assets.length === 0) {
    return (
      <div className={`${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'} rounded-lg p-8 text-center shadow-lg`}>
        No assets found in your portfolio
      </div>
    );
  }

  // Sort assets
  const sortedAssets = [...assets].sort((a, b) => {
    if (sortField === 'coin') {
      return sortDirection === 'asc'
        ? a.coin.localeCompare(b.coin)
        : b.coin.localeCompare(a.coin);
    } else {
      return sortDirection === 'asc'
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    }
  });

  // Handle sort change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Calculate total portfolio value
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                onClick={() => handleSort('coin')}
              >
                Asset {sortField === 'coin' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                onClick={() => handleSort('amount')}
              >
                Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider cursor-pointer`}
                onClick={() => handleSort('value')}
              >
                Value (USDT) {sortField === 'value' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}
              >
                Allocation
              </th>
            </tr>
          </thead>
          <tbody className={`${darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}>
            {sortedAssets.map((asset) => {
              const allocation = (asset.value / totalValue * 100).toFixed(2);

              return (
                <tr key={asset.coin} className={darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full mr-3 flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: asset.color }}>
                        {asset.coin.substring(0, 2)}
                      </div>
                      <div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{asset.coin}</div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{asset.priceSource}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {asset.amount < 0.001
                      ? asset.amount.toExponential(4)
                      : asset.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 8
                        })}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${asset.value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end">
                      <span className={`mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{allocation}%</span>
                      <div className={`w-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${allocation}%`,
                            backgroundColor: asset.color
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetTable;