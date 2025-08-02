# 1inch API Proxy

## Overview
Simple1inchProxy is a Node.js server designed to forward requests to the 1inch API, adding an authorization header. It's useful for integrating 1inch API calls into applications that require server-side request management.

## Installation

This project requires Node version 18 or higher due to the use of `fetch`

Once the correct version of Node is set for the environment, simply run:
   ```bash
   npm install
   ```

## Configuration
1. Create a `.env` file in the root directory.
2. Add your authorization token:
   ```
   AUTHORIZATION=Bearer replace_with_dev_portal_api_token
   ```

## Running the Server

### Local Development
Execute the command `npm start` or `node index.js`. The server will start on `http://localhost:3000`.

### Deployment on Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Set Environment Variables** in Vercel:
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add the `AUTHORIZATION` environment variable with your 1inch API key

4. **Alternative: Deploy with environment variables**:
   ```bash
   vercel --env AUTHORIZATION="Bearer your_api_key_here"
   ```

## Usage
To make a request, use the following structure:

**Local:**
```
http://localhost:3000/https://api.1inch.dev/fusion/orders/v1.0/1/order/active
```

**Vercel (replace with your domain):**
```
https://your-app-name.vercel.app/https://api.1inch.dev/fusion/orders/v1.0/1/order/active
```

Replace the URL parameter with your desired 1inch API endpoint.

## Project Structure
```
1inch-Proxy/
├── index.js          # Main server file
├── package.json      # Dependencies and scripts
├── vercel.json       # Vercel configuration
├── .env.example      # Environment variables template
├── .gitignore        # Git ignore rules
└── README.md         # This file
```
