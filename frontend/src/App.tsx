import { FlightMap } from './components/FlightMap'
import { StatsPanel } from './components/StatsPanel'
import './index.css'

function App() {
  return (
    <>
      <FlightMap />

      {/* Dashboard Overlay */}
      <div className="panel-container left-panel">
        <StatsPanel />
      </div>

      <div className="panel-container right-panel">
        <div className="card-title">Flight Tracker</div>
        <div style={{ flex: 1, border: '1px dashed #333' }}>[Tracking Panel Placeholder]</div>
      </div>
    </>
  )
}

export default App
