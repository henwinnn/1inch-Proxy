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

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: '1inch API Proxy is running',
    timestamp: new Date().toISOString(),
    usage: 'Add a 1inch API URL after the domain: https://your-domain.vercel.app/https://api.1inch.dev/...',
    example: 'https://your-domain.vercel.app/https://api.1inch.dev/fusion/orders/v1.0/1/order/active'
  });
});

// Middleware for URL validation
app.use((req, res, next) => {
  const url = req.originalUrl.substring(1); // Remove leading slash

  console.log("Original URL:", req.originalUrl);
  console.log("Extracted URL:", url);
  console.log("URL length:", url.length);
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Authorization header exists:", !!process.env.AUTHORIZATION);

  if (!url) {
    return res
      .status(400)
      .json({ 
        error: "Include URL in the path", 
        example: "https://your-domain.vercel.app/https://api.1inch.dev/fusion/orders/v1.0/1/order/active" 
      });
  }
  if (!url.startsWith("https://api.1inch.dev")) {
    return res
      .status(400)
      .json({ 
        error: "Base URL must start with https://api.1inch.dev",
        received: url,
        example: "https://your-domain.vercel.app/https://api.1inch.dev/fusion/orders/v1.0/1/order/active" 
      });
  }
  next();
});

app.get("/*", async (req, res) => {
  try {
    const url = req.originalUrl.substring(1); // Remove leading slash
    console.log("Fetching URL:", url);
    console.log("Headers being sent:", headers);
    
    const response = await fetch(url, { 
      headers,
      method: 'GET'
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText);
      return res.status(response.status).json({
        error: "API request failed",
        status: response.status,
        message: errorText,
        url: url
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Fetch error:", error);
    res
      .status(500)
      .json({
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
  }
});

app.post("/*", async (req, res) => {
  try {
    const url = req.originalUrl.substring(1); // Remove leading slash
    console.log("POST request to URL:", url);
    console.log("Request body:", req.body);
    
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(req.body),
    });
    
    console.log("POST Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log("POST Error response:", errorText);
      return res.status(response.status).json({
        error: "API request failed",
        status: response.status,
        message: errorText,
        url: url
      });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("POST Fetch error:", error);
    res
      .status(500)
      .json({
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
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
