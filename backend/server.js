const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Bounding box for China (approx): lomin=73, lomax=135, lamin=18, lamax=53
const OPENSKY_URL = 'https://opensky-network.org/api/states/all?lomin=73&lomax=135&lamin=18&lamax=53';

let flightDataCache = { time: 0, states: [] };

async function fetchFlightData() {
    try {
        const config = {};
        // Add authentication if credentials are provided in .env
        if (process.env.OPENSKY_USERNAME && process.env.OPENSKY_PASSWORD) {
            config.auth = {
                username: process.env.OPENSKY_USERNAME,
                password: process.env.OPENSKY_PASSWORD
            };
        }

        const response = await axios.get(OPENSKY_URL, config);
        if (response.data && response.data.states) {
            flightDataCache = response.data;
            const authStatus = config.auth ? '(Authenticated)' : '(Anonymous)';
            console.log(`Fetched ${response.data.states.length} flights at ${new Date().toISOString()} ${authStatus}`);
        }
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error('API Rate Limit Exceeded (429). If anonymous, you may have hit the 400 requests/day limit.');
        } else {
            console.error('Error fetching OpenSky data:', error.message);
        }
    }
}

// Fetch every 15 seconds to respect rate limits
setInterval(fetchFlightData, 15000);
// Initial fetch
fetchFlightData();

app.get('/api/flights', (req, res) => {
    res.json(flightDataCache);
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
