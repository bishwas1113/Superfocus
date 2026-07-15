import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Plus, Trash2, Clock, Coffee, Gift } from 'lucide-react';

const DEFAULT_REWARDS = [
  { id: '1', name: 'Watch TV episode', duration: 'long' },
  { id: '2', name: 'Play video game for 30m', duration: 'long' },
  { id: '3', name: 'Online shopping (window)', duration: 'short' },
  { id: '4', name: 'Make a nice coffee', duration: 'short' }
];

export default function RewardsView() {
  const [rewards, setRewards] = useLocalStorage('hyperfocus_rewards', DEFAULT_REWARDS);
  const [newName, setNewName] = useState('');
  const [newDuration, setNewDuration] = useState('short'); // 'short' or 'long'

  const addReward = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newReward = {
      id: Date.now().toString(),
      name: newName.trim(),
      duration: newDuration
    };
    setRewards([...rewards, newReward]);
    setNewName('');
  };

  const deleteReward = (id) => {
    setRewards(rewards.filter(r => r.id !== id));
  };

  return (
    <div style={{ padding: '20px' }} className="animate-pop-in">
      <h2 style={{ marginBottom: '16px', color: 'var(--accent-primary)' }}>My Rewards</h2>
      
      <form onSubmit={addReward} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        marginBottom: '32px',
        background: 'var(--bg-secondary)',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <input 
          type="text" 
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New reward idea (e.g. Sewing)" 
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: '16px',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setNewDuration('short')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: `2px solid ${newDuration === 'short' ? 'var(--accent-primary)' : 'transparent'}`,
              background: newDuration === 'short' ? 'rgba(117, 146, 139, 0.1)' : 'var(--bg-tertiary)',
              color: newDuration === 'short' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Coffee size={18} /> Short
          </button>
          <button
            type="button"
            onClick={() => setNewDuration('long')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: `2px solid ${newDuration === 'long' ? 'var(--accent-secondary)' : 'transparent'}`,
              background: newDuration === 'long' ? 'rgba(88, 124, 146, 0.1)' : 'var(--bg-tertiary)',
              color: newDuration === 'long' ? 'var(--accent-secondary)' : 'var(--text-secondary)',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Clock size={18} /> Long
          </button>
        </div>

        <button 
          type="submit"
          style={{
            background: 'var(--text-primary)',
            color: 'white',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Plus size={20} /> Add Reward
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {rewards.map(reward => (
          <div 
            key={reward.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-secondary)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              borderLeft: `4px solid ${reward.duration === 'short' ? 'var(--accent-primary)' : 'var(--accent-secondary)'}`
            }}
          >
            <div>
              <p style={{ fontWeight: 500 }}>{reward.name}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'capitalize' }}>
                {reward.duration} duration
              </p>
            </div>
            <button 
              onClick={() => deleteReward(reward.id)}
              style={{ color: 'var(--text-secondary)', padding: '8px' }}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        {rewards.length === 0 && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-color)',
            textAlign: 'center',
            gap: '12px',
            marginTop: '12px'
          }}>
            <Gift size={40} style={{ color: 'var(--accent-secondary)', opacity: 0.5 }} />
            <p>No rewards added yet.<br/>Add some treats to motivate yourself!</p>
          </div>
        )}
      </div>
    </div>
  );
}
