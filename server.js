const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = 8083;

const API_URL = process.env.REACT_APP_API_URL;
const BASENAME = process.env.REACT_APP_BASENAME;
const PROXY_URL = process.env.PROXY_URL;

// Proxy requests to flask backend
app.use(`${API_URL}`, createProxyMiddleware({
  target: PROXY_URL,
  changeOrigin: true,
  pathRewrite: {
    [`^${API_URL}`]: '/api'  // Strip the basename prefix and replace with /api
  },
  proxyTimeout: 900000,
  timeout: 900000,
}));

// Absolute path to build folder
const buildPath = path.join(__dirname, "build");

// Serve static assets
app.use(BASENAME, express.static(buildPath));

// SPA fallback
app.get(`${BASENAME}/*`, (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const server =  app.listen(PORT, "0.0.0.0", () => {
  console.log(`App running at http://127.0.0.1:${PORT}/${BASENAME}/`);
});

server.timeout = 900000;
server.keepAliveTimeout = 900000;
server.headersTimeout = 905000;