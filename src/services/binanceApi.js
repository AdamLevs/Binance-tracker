// API service for Binance

// Use the proxy instead of the direct Binance URL
const BINANCE_API_URL = '/binance-api';

/**
 * Get current prices for specified symbols
 * @param {Array} symbols - Array of trading pairs to fetch (e.g. ['BTCUSDT', 'ETHUSDT'])
 * @returns {Promise<Object>} - Object with symbol as key and price as value
 */
export const getCurrentPrices = async (symbols = []) => {
  try {
    console.log('Fetching prices for symbols:', symbols);
    // If specific symbols are provided, use the ticker/price endpoint with a symbol parameter
    if (symbols && symbols.length > 0) {
      const responses = await Promise.all(
        symbols.map(symbol =>
          fetch(`${BINANCE_API_URL}/api/v3/ticker/price?symbol=${symbol}`)
            .then(res => {
              if (!res.ok) {
                throw new Error(`Failed to fetch price for ${symbol}: ${res.status}`);
              }
              return res.json();
            })
        )
      );

      // Convert array of responses to an object with symbol as key
      return responses.reduce((acc, item) => {
        acc[item.symbol] = parseFloat(item.price);
        return acc;
      }, {});
    }
    // Otherwise, get all prices
    else {
      const response = await fetch(`${BINANCE_API_URL}/api/v3/ticker/price`);

      if (!response.ok) {
        console.error('Failed to fetch prices:', response.status, response.statusText);
        throw new Error(`Failed to fetch prices: ${response.status}`);
      }

      const data = await response.json();

      // Convert to object with symbol as key for easier lookup
      return data.reduce((acc, item) => {
        acc[item.symbol] = parseFloat(item.price);
        return acc;
      }, {});
    }
  } catch (error) {
    console.error('Error fetching current prices:', error);
    throw error;
  }
};

/**
 * Get account information with authentication
 * @param {Object} credentials - Object containing apiKey and apiSecret
 * @returns {Promise<Object>} - Account information from Binance
 */
export const getAccountInfo = async (credentials, createSignature) => {
  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = await createSignature(queryString, credentials.apiSecret);

    console.log('Getting account info with API key:', credentials.apiKey.substring(0, 5) + '...');

    const response = await fetch(`${BINANCE_API_URL}/api/v3/account?${queryString}&signature=${signature}`, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': credentials.apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Account info error:', response.status, errorText);
      let errorMessage = `Failed to fetch account information (${response.status})`;
      try {
        const error = JSON.parse(errorText);
        if (error && error.msg) {
          errorMessage = error.msg;
        }
      } catch (e) {
        // If it's not valid JSON, use the raw error text
        if (errorText) {
          errorMessage += `: ${errorText}`;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching account info:', error);
    throw error;
  }
};

/**
 * Process account balances and integrate with current prices
 * @param {Object} accountData - Account information from Binance API
 * @param {Object} prices - Current prices object
 * @returns {Array} - Array of asset objects with value calculations
 */
export const processPortfolio = (accountData, prices) => {
  if (!accountData || !accountData.balances || !prices) {
    return [];
  }

  // Define coin colors for visualization
  const coinColors = {
    BTC: '#F7931A',
    ETH: '#627EEA',
    BNB: '#F3BA2F',
    SOL: '#00FFA3',
    XRP: '#23292F',
    USDT: '#26A17B',
    USDC: '#2775CA',
    BUSD: '#F0B90B'
  };

  // Process each balance
  const assets = accountData.balances
    .map(balance => {
      const coin = balance.asset;
      const free = parseFloat(balance.free);
      const locked = parseFloat(balance.locked);
      const total = free + locked;

      // Skip assets with zero balance
      if (total <= 0) {
        return null;
      }

      // Determine asset value in USDT
      let value = 0;
      let priceSource = null;

      if (coin === 'USDT') {
        value = total;
        priceSource = 'Direct';
      } else if (prices[`${coin}USDT`]) {
        value = total * prices[`${coin}USDT`];
        priceSource = `${coin}USDT`;
      } else if (prices[`${coin}BUSD`]) {
        value = total * prices[`${coin}BUSD`];
        priceSource = `${coin}BUSD`;
      } else if (prices[`${coin}BTC`] && prices['BTCUSDT']) {
        value = total * prices[`${coin}BTC`] * prices['BTCUSDT'];
        priceSource = `${coin}BTC → BTCUSDT`;
      } else {
        // Skip assets we can't value
        return null;
      }

      // Skip dust values
      if (value < 1) {
        return null;
      }

      return {
        coin,
        amount: total,
        value,
        color: coinColors[coin] || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        priceSource
      };
    })
    .filter(asset => asset !== null);

  // Sort by value (descending)
  return assets.sort((a, b) => b.value - a.value);
};

/**
 * Get top coin prices even if no account connected
 * @returns {Promise<Object>} - Prices for top coins
 */
export const getTopCoinPrices = async () => {
  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'BNBUSDT'];

  try {
    console.log('Fetching top coin prices');
    return await getCurrentPrices(symbols);
  } catch (error) {
    console.error('Error fetching top coin prices:', error);
    // If we can't get real prices, return empty object instead of failing
    return {};
  }
};