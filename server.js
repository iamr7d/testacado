import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use(cors());

// Proxy middleware configuration
app.use('/api/phd', createProxyMiddleware({
  target: 'https://www.findaphd.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/phd': '/phds'
  },
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
