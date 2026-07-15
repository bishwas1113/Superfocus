import { useEffect, useState } from 'react';

export default function VisualTimer({ estimatedTimeMinutes, timeRemaining, stopwatchTime, isActive }) {
  // Calculate percentage for circular progress
  const totalSeconds = estimatedTimeMinutes * 60;
  const percentage = totalSeconds > 0 ? (timeRemaining / totalSeconds) * 100 : 0;
  
  const formatTime = (secs) => {
    if (secs < 0) secs = 0;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      padding: '32px 20px',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background element */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        background: 'var(--accent-primary)',
        opacity: 0.05,
        borderRadius: '50%',
      }} />

      <div style={{ position: 'relative', width: '160px', height: '160px' }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle 
            cx="80" cy="80" r="70" 
            fill="none" 
            stroke="var(--bg-tertiary)" 
            strokeWidth="8" 
          />
          {/* Progress circle */}
          <circle 
            cx="80" cy="80" r="70" 
            fill="none" 
            stroke="var(--accent-secondary)" 
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="439.8" /* 2 * PI * 70 */
            strokeDashoffset={439.8 - (percentage / 100) * 439.8}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Remaining</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '12px 24px', 
        background: 'var(--bg-primary)', 
        borderRadius: 'var(--radius-full)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          background: isActive ? 'var(--accent-tertiary)' : 'var(--text-secondary)',
          boxShadow: isActive ? '0 0 8px var(--accent-tertiary)' : 'none'
        }} />
        <div style={{ fontSize: '15px', color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>
          Stopwatch: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatTime(stopwatchTime)}</span>
        </div>
      </div>
    </div>
  );
}
