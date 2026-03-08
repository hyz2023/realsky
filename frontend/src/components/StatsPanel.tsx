import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useFlightStore } from '../store/flightStore';

export const StatsPanel = () => {
    const { flights } = useFlightStore();

    const totalFlights = flights.filter(f => f[5] && f[6]).length;

    const altitudeData = useMemo(() => {
        let low = 0; // < 3000m
        let mid = 0; // 3000m - 8000m
        let high = 0; // > 8000m

        flights.forEach(f => {
            // f[7] is baro_altitude
            const alt = f[7];
            if (alt !== null && f[5] && f[6]) {
                if (alt < 3000) low++;
                else if (alt >= 3000 && alt <= 8000) mid++;
                else high++;
            }
        });

        return [
            { value: low, name: '< 3000m', itemStyle: { color: '#38bdf8' } },
            { value: mid, name: '3k-8k m', itemStyle: { color: '#818cf8' } },
            { value: high, name: '> 8000m', itemStyle: { color: '#c084fc' } }
        ];
    }, [flights]);

    const option = {
        tooltip: { trigger: 'item' },
        legend: { top: '5%', left: 'center', textStyle: { color: '#94a3b8' } },
        series: [
            {
                name: 'Altitude',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 5,
                    borderColor: '#0f172a',
                    borderWidth: 2
                },
                label: { show: false, position: 'center' },
                emphasis: {
                    label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#fff' }
                },
                labelLine: { show: false },
                data: altitudeData
            }
        ]
    };

    return (
        <>
            <div>
                <div className="card-title">Total Active Flights</div>
                <div className="big-number">{totalFlights}</div>
            </div>
            <div style={{ flex: 1, minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
                <div className="card-title">Altitude Distribution</div>
                <div style={{ flex: 1, position: 'relative' }}>
                    <ReactECharts
                        option={option}
                        style={{ height: '100%', width: '100%', position: 'absolute' }}
                        opts={{ renderer: 'svg' }}
                    />
                </div>
            </div>
        </>
    );
};
