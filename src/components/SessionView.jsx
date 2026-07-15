import { useState, useEffect, useRef } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Play, Pause, Save, RefreshCw, SkipBack, RotateCcw, Coffee } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { playCompletionSound } from '../utils/sound';
import TaskItem from './TaskItem';
import VisualTimer from './VisualTimer';
import RewardModal from './RewardModal';

const DEFAULT_TASKS = [
  { id: '1', name: 'Clear desk', estimatedTime: 5 },
  { id: '2', name: 'Read chapter 1', estimatedTime: 20 },
  { id: '3', name: 'Write notes', estimatedTime: 15 },
];

export default function SessionView({ preferences }) {
  const [sessions, setSessions] = useLocalStorage('hyperfocus_sessions', { 'Default': DEFAULT_TASKS });
  const [activeSessionName, setActiveSessionName] = useState('Default');
  
  const [tasks, setTasks] = useState(sessions['Default']);
  const [activeTaskIndex, setActiveTaskIndex] = useState(-1);
  const [sessionStatus, setSessionStatus] = useState('idle'); // idle, running, paused, finished
  
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [stopwatchTime, setStopwatchTime] = useState(0); // in seconds
  
  const [lastDeleted, setLastDeleted] = useState(null); // { task, index, timeoutId }

  const timerRef = useRef(null);
  
  // Timer effect
  useEffect(() => {
    if (sessionStatus === 'running' || sessionStatus === 'waiting_next') {
      timerRef.current = setInterval(() => {
        setStopwatchTime(prev => prev + 1);
        
        if (sessionStatus === 'running') {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              // Timer just finished!
              if (prev === 1) {
                playCompletionSound(preferences?.sound || 'chime');
                if (preferences?.vibrate && 'vibrate' in navigator) {
                  navigator.vibrate([300, 150, 300, 150, 500]);
                }
              }
              setSessionStatus('waiting_next'); // Timer 0, but stopwatch keeps going
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [sessionStatus]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const startSession = () => {
    if (tasks.length === 0) return;
    setActiveTaskIndex(0);
    setTimeRemaining(tasks[0].estimatedTime * 60);
    setStopwatchTime(0);
    setSessionStatus('running');
  };
  
  const togglePause = () => {
    if (sessionStatus === 'running' || sessionStatus === 'waiting_next') {
      setSessionStatus('paused');
    } else if (sessionStatus === 'paused') {
      setSessionStatus(timeRemaining > 0 ? 'running' : 'waiting_next');
    }
  };

  const playNextTask = () => {
    // Save actual time for the completed task
    const updatedTasks = [...tasks];
    updatedTasks[activeTaskIndex].actualTime = stopwatchTime;
    setTasks(updatedTasks);
    
    if (activeTaskIndex + 1 < tasks.length) {
      const nextIndex = activeTaskIndex + 1;
      setActiveTaskIndex(nextIndex);
      setTimeRemaining(tasks[nextIndex].estimatedTime * 60);
      setStopwatchTime(0);
      setSessionStatus('running');
    } else {
      setSessionStatus('finished');
    }
  };

  const undoNextTask = () => {
    if (activeTaskIndex > 0) {
      const prevIndex = activeTaskIndex - 1;
      const updatedTasks = [...tasks];
      updatedTasks[activeTaskIndex].actualTime = undefined;
      
      const restoredStopwatch = updatedTasks[prevIndex].actualTime || 0;
      updatedTasks[prevIndex].actualTime = undefined;
      
      setTasks(updatedTasks);
      setActiveTaskIndex(prevIndex);
      setStopwatchTime(restoredStopwatch);
      
      const estSecs = updatedTasks[prevIndex].estimatedTime * 60;
      setTimeRemaining(Math.max(0, estSecs - restoredStopwatch));
      setSessionStatus('paused');
    }
  };

  const resetSession = () => {
    setSessionStatus('idle');
    setActiveTaskIndex(-1);
    setTimeRemaining(0);
    setStopwatchTime(0);
    // Reset actual times
    setTasks(tasks.map(t => ({ ...t, actualTime: undefined })));
  };

  const saveRoutine = () => {
    const name = prompt("Enter a name for this routine (e.g. Morning Routine):");
    if (name) {
      setSessions({ ...sessions, [name]: tasks });
      setActiveSessionName(name);
    }
  };

  const loadRoutine = (e) => {
    const name = e.target.value;
    setActiveSessionName(name);
    setTasks(sessions[name]);
    resetSession();
  };

  const addTask = () => {
    const newTask = {
      id: Date.now().toString(),
      name: 'New Task',
      estimatedTime: 5
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id) => {
    const index = tasks.findIndex(t => t.id === id);
    const taskToDelete = tasks[index];
    setTasks(tasks.filter(t => t.id !== id));
    
    if (lastDeleted && lastDeleted.timeoutId) {
      clearTimeout(lastDeleted.timeoutId);
    }
    
    const timeoutId = setTimeout(() => {
      setLastDeleted(null);
    }, 5000);
    
    setLastDeleted({ task: taskToDelete, index, timeoutId });
  };

  const undoDelete = () => {
    if (lastDeleted) {
      clearTimeout(lastDeleted.timeoutId);
      const updatedTasks = [...tasks];
      updatedTasks.splice(lastDeleted.index, 0, lastDeleted.task);
      setTasks(updatedTasks);
      setLastDeleted(null);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
        <select 
          value={activeSessionName} 
          onChange={loadRoutine}
          disabled={sessionStatus !== 'idle' && sessionStatus !== 'finished'}
          style={{ 
            padding: '8px 12px', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--border-color)',
            fontFamily: 'inherit',
            background: 'var(--bg-secondary)'
          }}
        >
          {Object.keys(sessions).map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
        
        <button 
          onClick={saveRoutine}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-secondary)' }}
        >
          <Save size={18} /> <span style={{ fontSize: '14px', fontWeight: 500 }}>Save Routine</span>
        </button>
      </div>

      <VisualTimer 
        estimatedTimeMinutes={activeTaskIndex >= 0 ? tasks[activeTaskIndex].estimatedTime : 0}
        timeRemaining={timeRemaining}
        stopwatchTime={stopwatchTime}
        isActive={sessionStatus === 'running' || sessionStatus === 'waiting_next'}
      />

      {/* Task List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Tasks</h2>
        {sessionStatus === 'idle' && (
          <button 
            onClick={addTask}
            style={{ 
              background: 'var(--text-primary)', 
              color: 'white', 
              padding: '6px 12px', 
              borderRadius: 'var(--radius-full)',
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '14px'
            }}
          >
            <Plus size={16} /> Add Task
          </button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {tasks.length === 0 ? (
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
                gap: '12px'
              }}>
                <Coffee size={40} style={{ color: 'var(--accent-primary)', opacity: 0.5 }} />
                <p>No tasks in this routine.<br/>Add a task to start focusing.</p>
              </div>
            ) : (
              tasks.map((task, index) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  isActive={index === activeTaskIndex}
                  isCompleted={index < activeTaskIndex || (sessionStatus === 'finished' && index <= activeTaskIndex)}
                  isNext={sessionStatus === 'waiting_next' && index === activeTaskIndex}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  onPlay={playNextTask}
                  onFinishTask={playNextTask}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Play/Pause Main Controls */}
      <div style={{ position: 'sticky', bottom: '20px', display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
        {sessionStatus === 'idle' && tasks.length > 0 && (
          <button 
            onClick={startSession}
            style={{ 
              background: 'var(--accent-secondary)', color: 'white', 
              padding: '16px 32px', borderRadius: 'var(--radius-full)',
              fontSize: '18px', fontWeight: 600,
              boxShadow: 'var(--shadow-lg)',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Play size={24} fill="white" /> Start Session
          </button>
        )}

        {(sessionStatus === 'running' || sessionStatus === 'paused') && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {activeTaskIndex > 0 && (
              <button 
                onClick={undoNextTask}
                title="Previous Task (Undo)"
                style={{ 
                  background: 'var(--bg-secondary)', color: 'var(--text-primary)', 
                  padding: '16px', borderRadius: 'var(--radius-full)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--border-color)'
                }}
              >
                <SkipBack size={24} />
              </button>
            )}
            <button 
              onClick={togglePause}
            style={{ 
              background: 'var(--text-primary)', color: 'white', 
              padding: '16px 32px', borderRadius: 'var(--radius-full)',
              fontSize: '18px', fontWeight: 600,
              boxShadow: 'var(--shadow-lg)',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            {sessionStatus === 'running' ? (
              <><Pause size={24} fill="white" /> Pause</>
            ) : (
              <><Play size={24} fill="white" /> Resume</>
            )}
          </button>
          </div>
        )}

        {sessionStatus === 'finished' && (
          <button 
            onClick={resetSession}
            style={{ 
              background: 'var(--text-secondary)', color: 'white', 
              padding: '16px 32px', borderRadius: 'var(--radius-full)',
              fontSize: '18px', fontWeight: 600,
              boxShadow: 'var(--shadow-lg)',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <RefreshCw size={24} /> Reset Session
          </button>
        )}
      </div>

      {sessionStatus === 'finished' && (
        <RewardModal onClose={() => setSessionStatus('idle')} />
      )}

      {lastDeleted && (
        <div className="animate-slide-up" style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--text-primary)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100
        }}>
          <span style={{ fontSize: '14px' }}>Task deleted</span>
          <button 
            onClick={undoDelete}
            style={{ 
              color: 'var(--accent-tertiary)', 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px' 
            }}
          >
            <RotateCcw size={16} /> Undo
          </button>
        </div>
      )}
    </div>
  );
}
