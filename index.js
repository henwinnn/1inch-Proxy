require('dotenv').config();
const express = require('express');

const app = express();
const port = 3000;

const headers = {
    "Authorization": process.env.AUTHORIZATION, // Read from .env
    "Content-Type": "application/json"
};

app.get('/', async (req, res) => {
    const url = req.query.url;
    if (!url)
        return res.status(400).send("include `url` in the query string");
    if (!url.startsWith("https://api.1inch.dev"))
        return res.status(400).send("base url must start with https://api.1inch.dev");

    try {
        const response = await fetch(url, { headers });
        const data = await response.json();
        return res.send(data);
    } catch (error) {
        return res.status(500).send('Error occurred while fetching data');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
