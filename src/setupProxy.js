const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/binance-api',
    createProxyMiddleware({
      target: 'https://api.binance.com',
      changeOrigin: true,
      pathRewrite: {
        '^/binance-api': '',
      },
      // Add detailed logging for debugging
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: ${req.method} ${proxyReq.path}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`Received response with status: ${proxyRes.statusCode}`);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Proxy error: ' + err.message);
      }
    })
  );
};