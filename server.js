const express = require("express");
const path = require("path");

const app = express();
const PORT = 8083;

// Absolute path to build folder
const buildPath = path.join(__dirname, "build");

// Serve static assets under /samfeo
app.use("/samfeo", express.static(buildPath));

// 2. SPA fallback
app.get("/samfeo/*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`App running at http://127.0.0.1:${PORT}/samfeo/`);
});
