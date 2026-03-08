import { FlightMap } from './components/FlightMap'
import './index.css'

function App() {
  return (
    <>
      <FlightMap />

      {/* Dashboard Overlay */}
      <div className="panel-container left-panel">
        <div className="card-title">Global Statistics</div>
        <div style={{ flex: 1, border: '1px dashed #333' }}>[Stats Panel Placeholder]</div>
      </div>

      <div className="panel-container right-panel">
        <div className="card-title">Flight Tracker</div>
        <div style={{ flex: 1, border: '1px dashed #333' }}>[Tracking Panel Placeholder]</div>
      </div>
    </>
  )
}

export default App
