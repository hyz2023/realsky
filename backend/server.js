const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Bounding box for China (approx): lomin=73, lomax=135, lamin=18, lamax=53
const OPENSKY_URL = 'https://opensky-network.org/api/states/all?lomin=73&lomax=135&lamin=18&lamax=53';

let flightDataCache = { time: 0, states: [] };

async function fetchFlightData() {
    try {
        const response = await axios.get(OPENSKY_URL);
        if (response.data && response.data.states) {
            flightDataCache = response.data;
            console.log(`Fetched ${response.data.states.length} flights at ${new Date().toISOString()}`);
        }
    } catch (error) {
        console.error('Error fetching OpenSky data:', error.message);
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
