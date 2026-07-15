export function playCompletionSound(type = 'chime') {
  if (type === 'silent') return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();

  if (type === 'chime') {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  } 
  else if (type === 'gong') {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.type = 'sine';
    osc2.type = 'triangle';
    
    // Low frequencies for gong
    osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2
    osc2.frequency.setValueAtTime(164.81, ctx.currentTime); // E3
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3.0);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 3.0);
    osc2.stop(ctx.currentTime + 3.0);
  }
  else if (type === 'digital') {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    
    // First beep
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    
    // Second beep
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.25);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }
}
