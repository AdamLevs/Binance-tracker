import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({
    apiKey: '',
    apiSecret: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if credentials exist in localStorage
    const storedApiKey = localStorage.getItem('binance_api_key');
    const storedApiSecret = localStorage.getItem('binance_api_secret');

    if (storedApiKey && storedApiSecret) {
      setCredentials({
        apiKey: storedApiKey,
        apiSecret: storedApiSecret
      });
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const login = async (apiKey, apiSecret, remember) => {
    try {
      console.log('Attempting login with API key', apiKey.substring(0, 5) + '...');

      // Test connection with the API
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;

      // Create signature
      const signature = await createSignature(queryString, apiSecret);

      console.log('Making test request to Binance API');
      const response = await fetch(`/binance-api/api/v3/account?${queryString}&signature=${signature}`, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login response error:', response.status, errorText);

        let errorMessage = `API Error (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData && errorData.msg) {
            errorMessage = errorData.msg;
          }
        } catch (e) {
          // If not valid JSON, use the raw error text
          if (errorText) {
            errorMessage += `: ${errorText}`;
          }
        }

        throw new Error(errorMessage);
      }

      // Store credentials
      setCredentials({ apiKey, apiSecret });
      setIsAuthenticated(true);

      // Store in localStorage if remember is checked
      if (remember) {
        localStorage.setItem('binance_api_key', apiKey);
        localStorage.setItem('binance_api_secret', apiSecret);
      }

      console.log('Login successful');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCredentials({ apiKey: '', apiSecret: '' });
    localStorage.removeItem('binance_api_key');
    localStorage.removeItem('binance_api_secret');
  };

  // Helper function to create HMAC SHA256 signature
  const createSignature = async (queryString, secret) => {
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const messageData = encoder.encode(queryString);

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await window.crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        messageData
      );

      return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      console.error('Error creating signature:', error);
      throw new Error('Failed to create API signature: ' + error.message);
    }
  };

  const value = {
    isAuthenticated,
    credentials,
    login,
    logout,
    createSignature,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;