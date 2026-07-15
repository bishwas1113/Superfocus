import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Timer, Gift } from 'lucide-react';
import SessionView from './components/SessionView';
import RewardsView from './components/RewardsView';

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh', paddingBottom: '80px' }}>
        <header style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <h1 style={{ color: 'var(--accent-secondary)' }}>Hyperfocus</h1>
        </header>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<SessionView />} />
            <Route path="/rewards" element={<RewardsView />} />
          </Routes>
        </main>

        <nav style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          maxWidth: '480px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 0',
          zIndex: 50
        }}>
          <NavLink 
            to="/" 
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none',
              color: isActive ? 'var(--accent-secondary)' : 'var(--text-secondary)'
            })}
          >
            <Timer size={24} />
            <span style={{ fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>Session</span>
          </NavLink>
          <NavLink 
            to="/rewards" 
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)'
            })}
          >
            <Gift size={24} />
            <span style={{ fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>Rewards</span>
          </NavLink>
        </nav>
      </div>
    </BrowserRouter>
  );
}

export default App;
