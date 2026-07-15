import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Play, Check, Trash2 } from 'lucide-react';

export default function TaskItem({ 
  task, 
  isActive, 
  isCompleted, 
  onUpdate, 
  onDelete,
  onPlay, 
  isNext 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: isActive || isCompleted });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [editTime, setEditTime] = useState(task.estimatedTime);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    background: isActive ? 'var(--bg-secondary)' : isCompleted ? 'rgba(117, 146, 139, 0.1)' : 'var(--bg-secondary)',
    borderLeft: `4px solid ${isActive ? 'var(--accent-secondary)' : isCompleted ? 'var(--accent-primary)' : 'transparent'}`,
    boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const handleSave = () => {
    const parsedTime = parseFloat(editTime);
    onUpdate(task.id, { 
      name: editName, 
      estimatedTime: !isNaN(parsedTime) && parsedTime > 0 ? parsedTime : task.estimatedTime 
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div style={style}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
          <input 
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="number"
                step="0.5"
                min="0.1"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '80px' }}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>min</span>
            </div>
            <button 
              onClick={() => onDelete && onDelete(task.id)} 
              style={{ color: '#C58B86', padding: '6px' }}
              title="Delete task"
            >
              <Trash2 size={20} />
            </button>
          </div>
          <button onClick={handleSave} style={{ alignSelf: 'flex-start', background: 'var(--accent-primary)', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '14px' }}>Save</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      {!isActive && !isCompleted && (
        <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-secondary)' }}>
          <GripVertical size={20} />
        </div>
      )}
      
      {isCompleted && (
        <div style={{ color: 'var(--accent-primary)' }}>
          <Check size={20} />
        </div>
      )}

      <div style={{ flex: 1 }} onClick={() => !isActive && !isCompleted && setIsEditing(true)}>
        <p style={{ fontWeight: isActive ? 600 : 500, color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
          {task.name}
        </p>
        <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          <span>Est: {task.estimatedTime}m</span>
          {isCompleted && task.actualTime !== undefined && (
            <span>Act: {Math.floor(task.actualTime / 60)}m {task.actualTime % 60}s</span>
          )}
        </div>
      </div>

      {isNext && (
        <button 
          onClick={onPlay}
          className="animate-pop-in"
          style={{ 
            background: 'var(--accent-secondary)', 
            color: 'white', 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <Play size={24} fill="white" />
        </button>
      )}
    </div>
  );
}
