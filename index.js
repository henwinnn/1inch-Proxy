require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Check if authorization is available
if (!process.env.AUTHORIZATION) {
  console.warn("WARNING: AUTHORIZATION environment variable is not set");
}

const headers = {
  Authorization: process.env.AUTHORIZATION || "",
  "Content-Type": "application/json",
};

// Middleware to give proper CORS permission to browser requests
app.use(cors());

// Middleware to handle request bodies
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "1inch API Proxy is running",
    environment: process.env.NODE_ENV || "development",
    hasAuthorization: !!process.env.AUTHORIZATION,
    timestamp: new Date().toISOString(),
    usage:
      "Add the 1inch API URL after the domain, e.g., /https://api.1inch.dev/fusion/orders/v1.0/1/order/active",
  });
});

// Middleware for URL validation
app.use((req, res, next) => {
  // Handle different URL formats
  let url = req.originalUrl.substring(1); // Remove leading slash

  // Handle query parameters that might be encoded
  if (req.query.url) {
    url = req.query.url;
  }

  console.log("Original URL:", req.originalUrl);
  console.log("Query params:", req.query);
  console.log("Extracted URL:", url);
  console.log("URL length:", url.length);
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Authorization header present:", !!process.env.AUTHORIZATION);

  if (!url) {
    return res
      .status(400)
      .json({ error: "Include `url` in the query string or request body" });
  }
  if (!url.startsWith("https://api.1inch.dev")) {
    return res
      .status(400)
      .json({ error: "Base URL must start with https://api.1inch.dev" });
  }

  // Store the clean URL for use in route handlers
  req.targetUrl = url;
  next();
});

app.get("/*", async (req, res) => {
  try {
    const url = req.targetUrl || req.originalUrl.substring(1); // Use stored URL or fallback
    console.log("Fetching URL:", url);

    if (!process.env.AUTHORIZATION) {
      return res.status(500).json({
        error: "Server configuration error: Missing authorization",
      });
    }

    const response = await fetch(url, { headers });
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText);
      return res.status(response.status).json({
        error: errorText,
        status: response.status,
        url: url,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({
      error: "Error occurred while fetching data",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

app.post("/", async (req, res) => {
  try {
    const url = req.query.url || req.body.url;

    if (!url) {
      return res
        .status(400)
        .json({ error: "URL is required in query or body" });
    }

    if (!process.env.AUTHORIZATION) {
      return res.status(500).json({
        error: "Server configuration error: Missing authorization",
      });
    }

    console.log("POST request to URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(req.body.data || req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("POST Error response:", errorText);
      return res.status(response.status).json({
        error: errorText,
        status: response.status,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("POST Fetch error:", error);
    res.status(500).json({
      error: "Error occurred while fetching data",
      message: error.message,
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
