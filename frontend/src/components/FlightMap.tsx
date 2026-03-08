import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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
    }, [fetchFlights]);

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
