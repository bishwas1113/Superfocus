import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Timer, Gift, Settings } from 'lucide-react';
import SessionView from './components/SessionView';
import RewardsView from './components/RewardsView';
import SettingsModal from './components/SettingsModal';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [preferences, setPreferences] = useLocalStorage('hyperfocus_prefs', { theme: 'japandi', sound: 'chime', syncUrl: '' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');

  useEffect(() => {
    document.body.setAttribute('data-theme', preferences.theme);
  }, [preferences.theme]);

  useEffect(() => {
    const handleStatus = (e) => setSyncStatus(e.detail);
    window.addEventListener('sync-status', handleStatus);
    return () => window.removeEventListener('sync-status', handleStatus);
  }, []);

  return (
    <HashRouter>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh', paddingBottom: '80px' }}>
        <header style={{ 
          padding: '20px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          borderBottom: '1px solid var(--border-color)',
          position: 'relative',
          gap: '12px'
        }}>
          <img src="./icon.png" alt="Superfocus Icon" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
          <h1 style={{ color: 'var(--accent-secondary)', margin: 0 }}>Superfocus</h1>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            style={{ position: 'absolute', right: '20px', color: 'var(--text-secondary)' }}
          >
            <Settings size={24} />
          </button>
        </header>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<SessionView preferences={preferences} />} />
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
          background: 'var(--bg-primary)',
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

        {isSettingsOpen && (
          <SettingsModal 
            onClose={() => setIsSettingsOpen(false)} 
            preferences={preferences} 
            setPreferences={setPreferences} 
            syncStatus={syncStatus}
          />
        )}
      </div>
    </HashRouter>
  );
}

export default App;
