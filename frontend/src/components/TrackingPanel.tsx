import { useFlightStore } from '../store/flightStore';

export const TrackingPanel = () => {
    const { selectedFlight } = useFlightStore();

    if (!selectedFlight) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center' }}>
                Select a flight on the map to view real-time telemetry details.
            </div>
        );
    }

    // OpenSky State Vector Indices:
    // 0: icao24, 1: callsign, 2: origin_country, 3: time_position, 4: last_contact
    // 5: longitude, 6: latitude, 7: baro_altitude, 8: on_ground, 9: velocity (m/s)
    // 10: true_track (heading), 11: vertical_rate (m/s), ...

    const callsign = selectedFlight[1] ? selectedFlight[1].trim() : 'UNKNOWN';
    const country = selectedFlight[2] || 'N/A';
    const altitude = selectedFlight[7] !== null ? `${Math.round(selectedFlight[7])} m` : 'N/A';
    const speed = selectedFlight[9] !== null ? `${Math.round(selectedFlight[9] * 3.6)} km/h` : 'N/A'; // Convert m/s to km/h
    const heading = selectedFlight[10] !== null ? `${Math.round(selectedFlight[10])}°` : 'N/A';
    const vRate = selectedFlight[11] !== null ? `${Math.round(selectedFlight[11])} m/s` : '0 m/s';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{callsign}</div>
                <div style={{ fontSize: '12px', background: '#3b82f6', padding: '2px 8px', borderRadius: '12px' }}>{selectedFlight[0]}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Altitude</div>
                    <div style={{ fontSize: '18px', color: '#38bdf8' }}>{altitude}</div>
                </div>
                <div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Ground Speed</div>
                    <div style={{ fontSize: '18px', color: '#38bdf8' }}>{speed}</div>
                </div>
                <div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Heading</div>
                    <div style={{ fontSize: '18px', color: '#fff' }}>{heading}</div>
                </div>
                <div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Vertical Rate</div>
                    <div style={{ fontSize: '18px', color: '#fff' }}>{vRate}</div>
                </div>
            </div>

            <div style={{ marginTop: '10px' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Origin Country</div>
                <div style={{ fontSize: '16px', color: '#fff' }}>{country}</div>
            </div>
        </div>
    );
};
