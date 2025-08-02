require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

const headers = {
  Authorization: process.env.AUTHORIZATION,
  "Content-Type": "application/json",
};

// Middleware to give proper CORS permission to browser requests
app.use(cors());

// Middleware to handle request bodies
app.use(express.json());

// Middleware for URL validation
app.use((req, res, next) => {
  const url = req.originalUrl.substring(1); // Remove leading slash

  console.log("Original URL:", req.originalUrl);
  console.log("Extracted URL:", url);
  console.log("URL length:", url.length);

  if (!url) {
    return res
      .status(400)
      .send("Include `url` in the query string or request body");
  }
  if (!url.startsWith("https://api.1inch.dev")) {
    return res
      .status(400)
      .send("Base URL must start with https://api.1inch.dev");
  }
  next();
});

app.get("/*", async (req, res) => {
  try {
    const url = req.originalUrl.substring(1); // Remove leading slash
    console.log("Fetching URL:", url);
    const response = await fetch(url, { headers });
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText);
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Fetch error:", error);
    res
      .status(500)
      .send("Error occurred while fetching data: " + error.message);
  }
});

app.post("/", async (req, res) => {
  try {
    const response = await fetch(req.query.url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(req.body.data),
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .send("Error occurred while fetching data: " + JSON.stringify(error));
  }
});

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

// Export for Vercel
module.exports = app;
