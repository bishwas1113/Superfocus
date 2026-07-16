import { X, Moon, Sun, Palette, Volume2, VolumeX, Bell, Music } from 'lucide-react';
import { playCompletionSound } from '../utils/sound';

export default function SettingsModal({ onClose, preferences, setPreferences, syncStatus }) {
  
  const handleThemeChange = (theme) => {
    setPreferences(prev => ({ ...prev, theme }));
    document.body.setAttribute('data-theme', theme);
  };

  const handleSoundChange = (sound) => {
    setPreferences(prev => ({ ...prev, sound }));
    playCompletionSound(sound);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="animate-pop-in" style={{
        background: 'var(--bg-primary)',
        width: '100%',
        maxWidth: '400px',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Settings</h2>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Theme Settings */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Theme</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SettingOption 
              icon={<Sun size={20} />} 
              label="Japandi (Default)" 
              isActive={preferences.theme === 'japandi'} 
              onClick={() => handleThemeChange('japandi')}
            />
            <SettingOption 
              icon={<Moon size={20} />} 
              label="Midnight (Dark)" 
              isActive={preferences.theme === 'midnight'} 
              onClick={() => handleThemeChange('midnight')}
            />
            <SettingOption 
              icon={<Palette size={20} />} 
              label="Vibrant" 
              isActive={preferences.theme === 'vibrant'} 
              onClick={() => handleThemeChange('vibrant')}
            />
          </div>
        </div>

        {/* Sound Settings */}
        <div>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Timer Sound</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SettingOption 
              icon={<Bell size={20} />} 
              label="Chime" 
              isActive={preferences.sound === 'chime'} 
              onClick={() => handleSoundChange('chime')}
            />
            <SettingOption 
              icon={<Music size={20} />} 
              label="Gong" 
              isActive={preferences.sound === 'gong'} 
              onClick={() => handleSoundChange('gong')}
            />
            <SettingOption 
              icon={<Volume2 size={20} />} 
              label="Digital Beep" 
              isActive={preferences.sound === 'digital'} 
              onClick={() => handleSoundChange('digital')}
            />
            <SettingOption 
              icon={<VolumeX size={20} />} 
              label="Silent" 
              isActive={preferences.sound === 'silent'} 
              onClick={() => handleSoundChange('silent')}
            />
          </div>
        </div>

        {/* Haptics Settings */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Haptics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SettingOption 
              icon={<Bell size={20} />} 
              label={preferences.vibrate ? "Vibration On" : "Vibration Off"} 
              isActive={preferences.vibrate} 
              onClick={() => {
                setPreferences(prev => ({ ...prev, vibrate: !prev.vibrate }));
                if (!preferences.vibrate && navigator.vibrate) navigator.vibrate(200);
              }}
            />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
            Note: Vibration is supported on Android devices. iOS/iPhones restrict web browsers from vibrating.
          </p>
        </div>

        {/* Cloud Sync Settings */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Cloud Sync (Google Sheets)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Paste Apps Script Web App URL here"
              value={preferences.syncUrl || ''}
              onChange={(e) => setPreferences(prev => ({ ...prev, syncUrl: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit'
              }}
            />
            {preferences.syncUrl && (
              <button 
                onClick={() => window.dispatchEvent(new Event('trigger-manual-sync'))}
                disabled={syncStatus === 'syncing'}
                style={{
                  background: 'var(--accent-primary)',
                  color: 'white',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  opacity: syncStatus === 'syncing' ? 0.7 : 1,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
            {syncStatus === 'success' && <p style={{ fontSize: '12px', color: '#82A082', marginTop: '4px' }}>Successfully synced!</p>}
            {syncStatus === 'error' && <p style={{ fontSize: '12px', color: '#C58B86', marginTop: '4px' }}>Error syncing. Check URL.</p>}
          </div>
        </div>
        
      </div>
    </div>
  );
}

function SettingOption({ icon, label, isActive, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: isActive ? 'var(--accent-secondary)' : 'var(--bg-secondary)',
        color: isActive ? 'white' : 'var(--text-primary)',
        border: `1px solid ${isActive ? 'var(--accent-secondary)' : 'var(--border-color)'}`,
        width: '100%',
        textAlign: 'left',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ color: isActive ? 'white' : 'var(--accent-primary)' }}>
        {icon}
      </div>
      <span style={{ fontWeight: isActive ? 600 : 500 }}>{label}</span>
    </button>
  );
}
