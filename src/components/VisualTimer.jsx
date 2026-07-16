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

      <div style={{ position: 'relative', width: '240px', height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Analog Clock Face with Traditional Twin-Bell Frame */}
        <svg width="240" height="240" viewBox="0 0 240 240">
          
          {/* Handle */}
          <path d="M 70 45 C 70 5, 170 5, 170 45" fill="none" stroke="#95a5a6" strokeWidth="6" strokeLinecap="round" />
          
          {/* Hammer */}
          <rect x="117" y="30" width="6" height="25" fill="#7f8c8d" />
          <circle cx="120" cy="30" r="6" fill="#7f8c8d" />
          
          {/* Left Bell */}
          <g transform="translate(65, 55) rotate(-25)">
            <path d="M -30 0 A 30 30 0 0 1 30 0 Z" fill="#D32F2F" />
            <rect x="-30" y="0" width="60" height="6" fill="#B71C1C" rx="2" />
          </g>
          
          {/* Right Bell */}
          <g transform="translate(175, 55) rotate(25)">
            <path d="M -30 0 A 30 30 0 0 1 30 0 Z" fill="#D32F2F" />
            <rect x="-30" y="0" width="60" height="6" fill="#B71C1C" rx="2" />
          </g>

          {/* Legs */}
          <line x1="80" y1="200" x2="60" y2="230" stroke="#95a5a6" strokeWidth="6" strokeLinecap="round" />
          <line x1="160" y1="200" x2="180" y2="230" stroke="#95a5a6" strokeWidth="6" strokeLinecap="round" />
          
          {/* Feet balls */}
          <circle cx="60" cy="230" r="5" fill="#7f8c8d" />
          <circle cx="180" cy="230" r="5" fill="#7f8c8d" />

          {/* Main Red Frame */}
          <circle cx="120" cy="130" r="95" fill="#D32F2F" />
          <circle cx="120" cy="130" r="85" fill="#B71C1C" />

          {/* White Clock Face (original) */}
          <circle cx="120" cy="130" r="80" fill="var(--bg-primary)" />
          
          {/* Minimalist Tick marks for 12, 3, 6, 9 */}
          <line x1="120" y1="55" x2="120" y2="65" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" />
          <line x1="120" y1="195" x2="120" y2="205" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" />
          <line x1="45" y1="130" x2="55" y2="130" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" />
          <line x1="195" y1="130" x2="185" y2="130" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" />

          {/* Progress Ring */}
          <circle cx="120" cy="130" r="70" fill="none" stroke="var(--bg-tertiary)" strokeWidth="4" />
          <circle cx="120" cy="130" r="70" fill="none" stroke="var(--accent-secondary)" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="439.8"
            strokeDashoffset={439.8 - (percentage / 100) * 439.8}
            style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: '120px 130px' }}
          />

          {/* Sweeping Clock Hand */}
          <g style={{ transition: 'transform 1s linear', transform: `rotate(${handRotation}deg)`, transformOrigin: '120px 130px' }}>
            <line x1="120" y1="130" x2="120" y2="65" stroke="var(--accent-primary)" strokeWidth="4" strokeLinecap="round" />
            <line x1="120" y1="130" x2="120" y2="145" stroke="var(--accent-primary)" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
          </g>

          <circle cx="120" cy="130" r="6" fill="var(--text-primary)" />
          <circle cx="120" cy="130" r="3" fill="var(--bg-primary)" />
        </svg>

        {/* Digital Time Overlay */}
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
          border: '1px solid var(--border-color)',
          zIndex: 10
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
