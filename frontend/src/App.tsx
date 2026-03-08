import { FlightMap } from './components/FlightMap'
import { StatsPanel } from './components/StatsPanel'
import { TrackingPanel } from './components/TrackingPanel'
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
        <TrackingPanel />
      </div>
    </>
  )
}

export default App
