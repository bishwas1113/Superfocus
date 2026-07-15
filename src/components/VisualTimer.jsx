import { useEffect, useState } from 'react';

export default function VisualTimer({ estimatedTimeMinutes, timeRemaining, stopwatchTime, isActive }) {
  // Calculate percentage for circular progress
  const totalSeconds = estimatedTimeMinutes * 60;
  const percentage = totalSeconds > 0 ? (timeRemaining / totalSeconds) * 100 : 0;
  
  // Shake animation class when time hits 0 but task is still active (waiting to be finished)
  const isFinished = totalSeconds > 0 && timeRemaining === 0;
  
  const formatTime = (secs) => {
    if (secs < 0) secs = 0;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Clock rotation: 0% remaining = 360deg, 100% remaining = 0deg
  const handRotation = (100 - percentage) * 3.6;

  return (
    <div className={isFinished ? 'animate-shake' : ''} style={{
      background: 'var(--bg-secondary)',
      padding: '32px 20px',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Decorative whimsical background element (sun/leaf abstraction) */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '120px',
        height: '120px',
        background: 'var(--accent-primary)',
        opacity: 0.05,
        borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
        transform: 'rotate(45deg)'
      }} />

      <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Analog Clock Face */}
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Subtle outer ring */}
          <circle cx="100" cy="100" r="90" fill="var(--bg-primary)" stroke="var(--border-color)" strokeWidth="2" />
          
          {/* Minimalist Tick marks for 12, 3, 6, 9 */}
          <line x1="100" y1="15" x2="100" y2="25" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" />
          <line x1="100" y1="175" x2="100" y2="185" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" />
          <line x1="15" y1="100" x2="25" y2="100" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" />
          <line x1="175" y1="100" x2="185" y2="100" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" />

          {/* Progress Ring (Optional overlay, but adds nice feedback) */}
          <circle 
            cx="100" cy="100" r="80" 
            fill="none" 
            stroke="var(--bg-tertiary)" 
            strokeWidth="4" 
          />
          <circle 
            cx="100" cy="100" r="80" 
            fill="none" 
            stroke="var(--accent-secondary)" 
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="502.6" /* 2 * PI * 80 */
            strokeDashoffset={502.6 - (percentage / 100) * 502.6}
            style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />

          {/* Sweeping Clock Hand */}
          <g style={{ transition: 'transform 1s linear', transform: `rotate(${handRotation}deg)`, transformOrigin: 'center' }}>
            {/* The hand */}
            <line x1="100" y1="100" x2="100" y2="30" stroke="var(--accent-primary)" strokeWidth="4" strokeLinecap="round" />
            {/* Counterweight */}
            <line x1="100" y1="100" x2="100" y2="115" stroke="var(--accent-primary)" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
          </g>

          {/* Center Pivot Dot */}
          <circle cx="100" cy="100" r="6" fill="var(--text-primary)" />
          <circle cx="100" cy="100" r="3" fill="var(--bg-primary)" />
        </svg>

        {/* Digital Time Overlay - moved below center for clock visibility */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-secondary)',
          padding: '2px 12px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--mono)' }}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '24px', 
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
