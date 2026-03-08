# Realtime Sky - Global Flight Visualization Dashboard

## Project Overview
A real-time flight visualization dashboard focused on the China region, providing an immersive, large-screen "monitoring center" experience. It displays dynamic aircraft movements on a map alongside rich statistical panels and interactive tracking features.

## Architecture & Technology Stack
*   **Backend Proxy**: Node.js (Express or NestJS)
    *   Acts as a singleton polling service to fetch OpenSky data every 10-15s.
    *   Filters and caches data in memory.
    *   Exposes a clean REST API (e.g., `/api/flights`) for the frontend, avoiding OpenSky rate limits and CORS issues.
*   **Frontend Framework**: React
*   **Charting Library**: ECharts (for statistical panels)
*   **Map Visualization**: Mapbox GL JS / react-map-gl (or similar high-performance WebGL map library suitable for large-scale dot rendering and animations)
*   **State Management**: Zustand (for managing real-time flight data and UI state like selected flight)
*   **Data Source**: OpenSky Network API (REST API, fetched by the backend proxy)
*   **Styling**: Vanilla CSS / CSS Modules with a modern, dark "cyberpunk/tech" aesthetic.

## Features & UI Layout

The application will follow a classic large-screen dashboard layout:

1.  **Central Map View (The Core)**:
    *   Dark-themed, minimalist base map.
    *   Real-time rendering of aircraft positions.
    *   Aircraft icons rotate based on true track (heading).
    *   Smooth interpolation/animation between data updates to prevent jumping.
    *   Clicking an aircraft highlights it and updates the tracking panel.

2.  **Left Panel (Global Statistics)**:
    *   **Total Active Flights**: Large, animated number counter.
    *   **Altitude Distribution**: Bar chart or rose chart showing flights at different flight levels.
    *   **Speed Distribution**: Gauge or histogram showing current ground speeds.
    *   **Country of Origin**: Pie or donut chart showing the proportion of airlines/countries currently in the airspace.

3.  **Right Panel (Interaction & Details)**:
    *   **Flight Tracker / Search**: Input box to search by Callsign or ICAO24 address.
    *   **Selected Flight Details**: When a flight is clicked or searched, display detailed telemetry (Callsign, Altitude, Speed, Heading, Vertical Rate, Country of Origin).
    *   **Top Airports/Airlines (Derived/Mocked)**: A ranking chart. *Note: OpenSky free API doesn't cleanly provide departure/arrival for live state vectors, so this may require approximation based on location or using mocked contextual data for the demo.*

## Data Flow & Limitations
*   **Data Fetching**: The frontend will poll the OpenSky `states/all` endpoint bounded by a geographic box covering China (e.g., `lamin=15`, `lamax=55`, `lomin=70`, `lomax=135`).
*   **Rate Limiting**: Polling interval will be set to 10-15 seconds to respect OpenSky's anonymous usage limits and prevent blocking.
*   **Animation**: Between API polls, the frontend will locally extrapolate aircraft positions based on their last known velocity and heading to create a smooth, near-real-time visual experience.

## Next Steps
Upon approval of this design, we will transition to creating a detailed implementation plan (tasks and milestones).
