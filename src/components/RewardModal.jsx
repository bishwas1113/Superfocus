import { useState } from 'react';
import { Gift, Sparkles, Clock, Coffee } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function RewardModal({ onClose }) {
  const [rewards] = useLocalStorage('hyperfocus_rewards', []);
  const [selectedDuration, setSelectedDuration] = useState(null); // 'short' or 'long'
  const [revealedReward, setRevealedReward] = useState(null);

  const handleSelect = (duration) => {
    setSelectedDuration(duration);
    const available = rewards.filter(r => r.duration === duration);
    if (available.length > 0) {
      const random = available[Math.floor(Math.random() * available.length)];
      setRevealedReward(random);
    } else {
      setRevealedReward({ id: 'none', name: 'No rewards in this category! Treat yourself anyway.' });
    }
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
      zIndex: 100,
      padding: '20px'
    }}>
      <div 
        className="animate-pop-in"
        style={{
          background: 'var(--bg-primary)',
          width: '100%',
          maxWidth: '400px',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 24px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {!revealedReward ? (
          <>
            <Gift size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
            <h2 style={{ marginBottom: '8px' }}>Session Complete!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Great job! Pick your reward type:
            </p>
            <div style={{ display: 'flex', gap: '16px', width: '100%', marginBottom: '16px' }}>
              <button
                onClick={() => handleSelect('short')}
                style={{
                  flex: 1,
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(117, 146, 139, 0.1)',
                  border: '2px solid var(--accent-primary)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Coffee size={24} />
                <span style={{ fontWeight: 600 }}>Short Break</span>
              </button>
              <button
                onClick={() => handleSelect('long')}
                style={{
                  flex: 1,
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(88, 124, 146, 0.1)',
                  border: '2px solid var(--accent-secondary)',
                  color: 'var(--accent-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Clock size={24} />
                <span style={{ fontWeight: 600 }}>Long Break</span>
              </button>
            </div>
          </>
        ) : (
          <div className="animate-pop-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Sparkles size={48} color="var(--accent-tertiary)" style={{ marginBottom: '16px' }} />
            <h2 style={{ marginBottom: '16px', color: 'var(--accent-secondary)' }}>Your Reward:</h2>
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              width: '100%',
              marginBottom: '24px'
            }}>
              <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>{revealedReward.name}</h1>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'var(--text-primary)',
                color: 'white',
                padding: '12px 32px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                width: '100%'
              }}
            >
              Finish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
