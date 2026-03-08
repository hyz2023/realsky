# Realtime Sky Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Build a real-time flight visualization dashboard for the China region with a Node.js backend proxy and a React+Vite frontend.
**Architecture:** Node.js (Express) backend acts as a singleton polling service (every 10-15s) to OpenSky API to avoid rate limits and serves processed data to the React frontend. The frontend uses React, ECharts, and Leaflet (react-leaflet) for visualization, with Zustand for state management.
**Tech Stack:** 
- Backend: Node.js, Express, axios, cors
- Frontend: React 18, Vite, ECharts, react-leaflet (Free OSM tiles), Zustand

---

## Phase 1: Project Setup & Backend Proxy

### Task 1: Initialize Monorepo Structure & Backend Server
**Files:**
- Create: `package.json` (Root, if not exists)
- Create: `backend/package.json`
- Create: `backend/server.js`

**Step 1: Write the minimal Express server**
```javascript
// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
```

**Step 2: Verify server starts**
Run: `cd backend && npm install express cors && node server.js`
Expected: Passes and logs "Backend server running on port 3001"

**Step 3: Commit**
```bash
git add backend/
git commit -m "feat(backend): initialize backend express server"
```

### Task 2: Implement OpenSky Polling Service
**Files:**
- Modify: `backend/server.js`

**Step 1: Add internal polling and flight endpoint**
```javascript
// Add to backend/server.js
const axios = require('axios');

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
```

**Step 2: Verify endpoint**
Run: Start server `node server.js` and in another terminal run `curl http://localhost:3001/api/flights`
Expected: Returns JSON with `{"time": ..., "states": [...]}`

**Step 3: Commit**
```bash
git add backend/server.js package.json
git commit -m "feat(backend): add OpenSky polling service and flight endpoint"
```

---

## Phase 2: Frontend Setup & Core Map

### Task 3: Initialize Frontend application
**Files:**
- Run: `npm create vite@latest frontend -- --template react-ts`
- Modify: `frontend/vite.config.ts` (add proxy)

**Step 1: Create frontend app and add proxy**
Run:
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install leaflet react-leaflet @types/leaflet
npm install zustand echarts echarts-for-react
```

**Step 2: Start frontend dev server to verify**
Run: `npm run dev`
Expected: Vite server starts.

**Step 3: Commit**
```bash
git add frontend/
git commit -m "chore(frontend): initialize react vite app with leaflet and echarts dependencies"
```

### Task 4: Configure Zustand Flight Store
**Files:**
- Create: `frontend/src/store/flightStore.ts`

**Step 1: Create store for polling backend**
```typescript
import { create } from 'zustand';

interface FlightState {
  flights: any[];
  lastUpdate: number;
  selectedFlight: any | null;
  fetchFlights: () => Promise<void>;
  setSelectedFlight: (flight: any) => void;
}

export const useFlightStore = create<FlightState>((set) => ({
  flights: [],
  lastUpdate: 0,
  selectedFlight: null,
  fetchFlights: async () => {
    try {
      const response = await fetch('http://localhost:3001/api/flights');
      const data = await response.json();
      if (data.states) {
        set({ flights: data.states, lastUpdate: data.time });
      }
    } catch (error) {
      console.error('Failed to fetch flights:', error);
    }
  },
  setSelectedFlight: (flight) => set({ selectedFlight: flight })
}));
```

**Step 2: Verify lint**
Run: `npm run lint` in frontend.
Expected: PASS

**Step 3: Commit**
```bash
git add frontend/src/store/flightStore.ts
git commit -m "feat(frontend): add Zustand store for flight state management"
```

### Task 5: Implement Map Component (The Core)
**Files:**
- Create: `frontend/src/components/FlightMap.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/index.css`

**Step 1: Create the base map and aircraft markers**

```typescript
// frontend/src/components/FlightMap.tsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useFlightStore } from '../store/flightStore';
import L from 'leaflet';

// Create a custom divIcon for the airplane to allow rotation
const createAirplaneIcon = (heading: number) => {
  return L.divIcon({
    html: `<div style="transform: rotate(${heading}deg); color: #00ff00; font-size: 20px; text-align: center;">✈</div>`,
    className: 'custom-airplane-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export const FlightMap = () => {
  const { flights, fetchFlights, setSelectedFlight } = useFlightStore();

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <MapContainer 
        center={[35.8617, 104.1954]} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* Using a dark themed OSM layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Render markers mapping over flights. OpenSky state vector: [0:icao24, 1:callsign, 2:origin_country, ..., 5:lng, 6:lat, ..., 10:true_track] */}
        {flights.map((f) => (
            f[5] && f[6] && (
                <Marker 
                  key={f[0]} 
                  position={[f[6], f[5]]} 
                  icon={createAirplaneIcon(f[10] || 0)}
                  eventHandlers={{ click: () => setSelectedFlight(f) }}
                >
                </Marker>
            )
        ))}
      </MapContainer>
    </div>
  );
};
```

**Step 2: Ensure leaflet CSS is imported and Map is rendered**
```typescript
// frontend/src/App.tsx
import { FlightMap } from './components/FlightMap';
import './App.css';

function App() { return (<FlightMap />); }
export default App;
```
Run: `npm run build`
Expected: Build passes.

**Step 3: Commit**
```bash
git add .
git commit -m "feat(frontend): integrate react-leaflet and render real-time flight markers"
```

---

## Phase 3: Dashboard Layout & ECharts Panels

### Task 6: Dashboard Layout Overlay
**Files:**
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/index.css`

**Step 1: Add absolute positioned panels over the map**
Create left and right panels with a dark semi-transparent background (glassmorphism effect) overlaid on the map.

```css
/* frontend/src/index.css */
body { margin: 0; font-family: 'Inter', sans-serif; background: #1a1a2e; color: white; overflow: hidden; }
.panel-container { position: absolute; top: 20px; bottom: 20px; width: 350px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(10px); border-radius: 12px; z-index: 1000; padding: 20px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5); display: flex; flex-direction: column; gap: 20px; }
.left-panel { left: 20px; }
.right-panel { right: 20px; }
.card-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 10px; }
.big-number { font-size: 48px; font-weight: bold; color: #38bdf8; text-shadow: 0 0 10px rgba(56, 189, 248, 0.5); }
```

**Step 2: Commit layout**
```bash
git commit -m "feat(frontend): add dashboard overlay layout styles"
```

### Task 7: Implement Left Panel Statistics (ECharts)
**Files:**
- Create: `frontend/src/components/StatsPanel.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1: Calculate and render stats**
Use `useFlightStore` to compute:
1. Total flights (`flights.length`)
2. Altitude distribution (e.g., `< 3000m`, `3k-8k m`, `> 8k m`) using ECharts Pie/Bar.

**Step 2: Embed EChartsReact in StatsPanel**
```typescript
// abstract implementation showing ECharts integration
import ReactECharts from 'echarts-for-react';
// ... standard Echarts config logic ...
```

**Step 3: Commit**
```bash
git commit -m "feat(frontend): add ECharts statistics panel for altitude and total counts"
```

### Task 8: Implement Right Panel (Tracking & Details)
**Files:**
- Create: `frontend/src/components/TrackingPanel.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1: Details View**
Display details of `selectedFlight` from Zustand. Show "Select a flight on the map to view details" if null.
Details to show: Callsign, Altitude (m), Speed (m/s), True Track, Origin Country.

**Step 2: Commit**
```bash
git commit -m "feat(frontend): add flight tracking details panel"
```

## Verification Plan

1. **Backend Verification**: Start the Node server (`node backend/server.js`). Confirm terminal logs show pulling data from OpenSky successfully every 15s. Visit `http://localhost:3001/api/flights` to confirm JSON payload.
2. **Frontend Map**: Start vite (`npm run dev`). Confirm black/dark CARTO map renders spanning China. Confirm green airplane icons appear, rotate correctly, and shift position every 15 seconds based on the backend polling.
3. **Frontend Dashboard Panels**: Confirm Left Panel shows correct total count matching the number of airplanes. Hovering on ECharts shows tooltips. Confirm Right panel updates when a specific flight icon is clicked and shows correct telemetry (altitude, speed, callsign).

## User Review Required
- **Map Library**: I chose `react-leaflet` with CartoDB Dark Matter tiles (free, no API key required) instead of Mapbox for a highly robust, zero-configuration start that fits the dark cyberpunk theme perfectly. Is this acceptable? If you strictly need Mapbox, we will need a Mapbox Token.
