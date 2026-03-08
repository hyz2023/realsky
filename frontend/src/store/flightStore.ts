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
