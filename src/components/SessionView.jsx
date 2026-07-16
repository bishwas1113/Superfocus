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
import { Plus, Play, Pause, Save, RefreshCw, SkipBack, RotateCcw, Coffee, Cloud, Edit2 } from 'lucide-react';
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
  const [sessionsData, setSessionsData] = useLocalStorage('hyperfocus_sessions_data', () => {
    const oldSessions = window.localStorage.getItem('hyperfocus_sessions');
    if (oldSessions) {
      try {
        const parsed = JSON.parse(oldSessions);
        return { sessions: parsed, lastUpdated: Date.now() };
      } catch(e) {}
    }
    return { sessions: { 'Default': DEFAULT_TASKS }, lastUpdated: Date.now() };
  });
  const sessions = sessionsData?.sessions || { 'Default': DEFAULT_TASKS };
  const lastUpdated = sessionsData?.lastUpdated || Date.now();

  const updateSessions = (newSessions) => {
    setSessionsData({ sessions: newSessions, lastUpdated: Date.now() });
  };

  const [activeSessionName, setActiveSessionName] = useLocalStorage('hyperfocus_active_session', 'Default');
  
  const [tasks, setTasks] = useState(sessions[activeSessionName] || sessions['Default'] || []);
  const [activeTaskIndex, setActiveTaskIndex] = useState(-1);
  const [sessionStatus, setSessionStatus] = useState('idle'); // idle, running, paused, finished
  
  const [syncStatus, setSyncStatus] = useState('idle');
  const [missingRoutines, setMissingRoutines] = useState([]);

  useEffect(() => {
    const handleStatus = (e) => setSyncStatus(e.detail);
    window.addEventListener('sync-status', handleStatus);
    return () => window.removeEventListener('sync-status', handleStatus);
  }, []);
  
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [stopwatchTime, setStopwatchTime] = useState(0); // in seconds
  
  const [lastDeleted, setLastDeleted] = useState(null); // { task, index, timeoutId }

  const timerRef = useRef(null);
  const lastTickRef = useRef(null);
  
  // Calculate Session Metrics
  const safeTasks = tasks || [];
  const totalEstimatedSeconds = safeTasks.reduce((acc, task) => acc + (task.estimatedTime * 60), 0);
  
  let totalElapsedSeconds = 0;
  if (sessionStatus === 'finished') {
    totalElapsedSeconds = safeTasks.reduce((acc, task) => acc + (task.actualTime || 0), 0);
  } else if (sessionStatus !== 'idle') {
    totalElapsedSeconds = safeTasks.reduce((acc, task, index) => {
      if (index < activeTaskIndex) return acc + (task.actualTime || 0);
      if (index === activeTaskIndex) return acc + stopwatchTime;
      return acc;
    }, 0);
  }

  const sessionProgressPercent = totalEstimatedSeconds > 0 
    ? Math.min(100, (totalElapsedSeconds / totalEstimatedSeconds) * 100) 
    : 0;
  
  const isOverTime = totalElapsedSeconds > totalEstimatedSeconds;

  const formatTime = (secs) => {
    if (secs < 0) secs = 0;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Timer effect (uses delta time to catch up after backgrounding/sleeping)
  useEffect(() => {
    if (sessionStatus === 'running' || sessionStatus === 'waiting_next') {
      lastTickRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const deltaMs = now - lastTickRef.current;
        const deltaSecs = Math.floor(deltaMs / 1000);
        
        if (deltaSecs >= 1) {
          lastTickRef.current += deltaSecs * 1000;
          setStopwatchTime(prev => prev + deltaSecs);
          
          if (sessionStatus === 'running') {
            setTimeRemaining(prev => {
              const nextTime = prev - deltaSecs;
              if (nextTime <= 0) {
                // If we just crossed the zero threshold
                if (prev > 0) {
                  playCompletionSound(preferences?.sound || 'chime');
                  if (preferences?.vibrate && 'vibrate' in navigator) {
                    navigator.vibrate([300, 150, 300, 150, 500]);
                  }
                }
                setSessionStatus('waiting_next'); // Timer 0, but stopwatch keeps going
                return 0;
              }
              return nextTime;
            });
          }
        }
      }, 500); // Check twice a second to feel responsive
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [sessionStatus, preferences]);

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

  const resetSession = (overrideTasks) => {
    setSessionStatus('idle');
    setActiveTaskIndex(-1);
    setTimeRemaining(0);
    setStopwatchTime(0);
    if (overrideTasks) {
      setTasks(overrideTasks.map(t => ({ ...t, actualTime: undefined })));
    } else {
      setTasks(prev => prev.map(t => ({ ...t, actualTime: undefined })));
    }
  };

  const saveRoutine = () => {
    const name = prompt("Enter a name for this routine (e.g. Morning Routine):");
    if (name) {
      updateSessions({ ...sessions, [name]: tasks });
      setActiveSessionName(name);
    }
  };

  const saveChanges = () => {
    updateSessions({ ...sessions, [activeSessionName]: tasks });
  };

  const renameRoutine = () => {
    const name = prompt("Enter a new name for this routine:");
    if (name && name !== activeSessionName) {
      const newSessions = { ...sessions };
      newSessions[name] = tasks;
      delete newSessions[activeSessionName];
      updateSessions(newSessions);
      setActiveSessionName(name);
    }
  };

  const loadRoutine = (e) => {
    const name = e.target.value;
    setActiveSessionName(name);
    resetSession(sessions[name] || []);
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

  const performSync = async () => {
    if (!preferences?.syncUrl) return;
    window.dispatchEvent(new CustomEvent('sync-status', { detail: 'syncing' }));
    
    try {
      const res = await fetch(preferences.syncUrl);
      const json = await res.json();
      
      if (json.status === 'success' && json.data) {
        const cloudData = json.data;
        
        const cloudKeys = Object.keys(cloudData.sessions || {}).filter(k => k !== 'Default');
        const missing = cloudKeys.filter(k => !sessions[k]);
        
        if (missing.length > 0) {
          setMissingRoutines(missing.map(name => ({ name, cloudData })));
          return;
        }

        if (cloudData.lastUpdated && cloudData.lastUpdated > lastUpdated) {
          setSessionsData(cloudData);
          if (cloudData.sessions[activeSessionName]) {
            setTasks(cloudData.sessions[activeSessionName]);
          }
          window.dispatchEvent(new CustomEvent('sync-status', { detail: 'success' }));
          return;
        }
      }
      
      const postRes = await fetch(preferences.syncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ data: sessionsData })
      });
      const postJson = await postRes.json();
      if (postJson.status === 'success' || postJson.status === 'conflict') {
        window.dispatchEvent(new CustomEvent('sync-status', { detail: 'success' }));
      } else {
        window.dispatchEvent(new CustomEvent('sync-status', { detail: 'error' }));
      }
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('sync-status', { detail: 'error' }));
    }
  };

  const resolveMissingRoutine = (routineName, action, cloudData) => {
    const newSessions = { ...sessions };
    if (action === 'restore') {
      newSessions[routineName] = cloudData.sessions[routineName];
    }
    
    const nextMissing = missingRoutines.slice(1);
    setMissingRoutines(nextMissing);
    
    if (nextMissing.length === 0) {
      if (action === 'restore') {
        setSessionsData({ sessions: newSessions, lastUpdated: cloudData.lastUpdated });
      } else {
        updateSessions(newSessions);
      }
      setTimeout(performSync, 500);
    }
  };

  // Sync on mount if URL exists
  useEffect(() => {
    if (preferences?.syncUrl) performSync();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences?.syncUrl]);

  // Sync on manual trigger
  useEffect(() => {
    window.addEventListener('trigger-manual-sync', performSync);
    window.addEventListener('online', performSync);
    return () => {
      window.removeEventListener('trigger-manual-sync', performSync);
      window.removeEventListener('online', performSync);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionsData, preferences?.syncUrl, activeSessionName]);
  
  // Auto sync on data change
  useEffect(() => {
    if (!preferences?.syncUrl) return;
    const timeout = setTimeout(() => {
      performSync();
    }, 2000);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionsData]);

  return (
    <div style={{ padding: '20px' }}>
      
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          {preferences?.syncUrl && (
            <div title={`Sync Status: ${syncStatus}`}>
              <Cloud 
                size={18} 
                style={{ 
                  color: syncStatus === 'syncing' ? '#D1B48C' : 
                         syncStatus === 'success' ? '#82A082' : 
                         syncStatus === 'error' ? '#C58B86' : 'var(--text-secondary)'
                }} 
              />
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {activeSessionName === 'Default' ? (
            <button 
              onClick={saveRoutine}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-secondary)' }}
            >
              <Save size={18} /> <span style={{ fontSize: '14px', fontWeight: 500 }}>Save as New Routine</span>
            </button>
          ) : (
            <>
              <button 
                onClick={renameRoutine}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
              >
                <Edit2 size={16} /> <span style={{ fontSize: '14px', fontWeight: 500 }}>Rename</span>
              </button>
              <button 
                onClick={saveChanges}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-secondary)' }}
              >
                <Save size={18} /> <span style={{ fontSize: '14px', fontWeight: 500 }}>Save Changes</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Session Progress Bar */}
      {sessionStatus !== 'idle' && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600 }}>Session Progress</span>
            <span style={{ fontFamily: 'var(--mono)' }}>
              <span style={{ color: isOverTime ? '#C58B86' : 'var(--text-primary)' }}>
                {formatTime(totalElapsedSeconds)}
              </span>
              {' / '}{formatTime(totalEstimatedSeconds)}
            </span>
          </div>
          <div style={{ 
            height: '8px', 
            background: 'var(--bg-tertiary)', 
            borderRadius: 'var(--radius-full)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: 0, left: 0, bottom: 0,
              width: `${sessionProgressPercent}%`,
              background: isOverTime ? '#C58B86' : '#82A082',
              borderRadius: 'var(--radius-full)',
              transition: 'width 1s linear, background 0.3s ease'
            }} />
          </div>
        </div>
      )}

      <VisualTimer 
        estimatedTimeMinutes={activeTaskIndex >= 0 ? tasks[activeTaskIndex].estimatedTime : 0}
        timeRemaining={timeRemaining}
        stopwatchTime={stopwatchTime}
        isActive={sessionStatus === 'running' || sessionStatus === 'waiting_next'}
      />

      {/* Current Task Banner */}
      {(sessionStatus === 'running' || sessionStatus === 'waiting_next') && activeTaskIndex >= 0 && (
        <div className="animate-pop-in" style={{
          background: 'var(--bg-secondary)',
          border: '2px solid var(--accent-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '4px' }}>
            Current Task
          </span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>
            {tasks[activeTaskIndex]?.name}
          </span>
        </div>
      )}

      {/* Play/Pause Main Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', position: 'sticky', top: '20px', zIndex: 10 }}>
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

        {(sessionStatus !== 'idle' && sessionStatus !== 'finished') && (
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
              {(sessionStatus === 'running' || sessionStatus === 'waiting_next') ? (
                <><Pause size={24} fill="white" /> Pause</>
              ) : (
                <><Play size={24} fill="white" /> Resume</>
              )}
            </button>

            <button 
              onClick={() => {
                if(window.confirm('Are you sure you want to reset the session?')) {
                  resetSession();
                }
              }}
              title="Stop & Reset Session"
              style={{ 
                background: 'var(--bg-secondary)', color: 'var(--accent-primary)', 
                padding: '16px', borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--border-color)'
              }}
            >
              <RotateCcw size={24} />
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

      {/* Task List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Tasks</h2>
        {sessionStatus === 'idle' && (
          <button 
            onClick={addTask}
            title="Add Task"
            className="animate-pop-in"
            style={{ 
              background: 'var(--text-primary)', 
              color: 'white', 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Plus size={20} />
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

      <div style={{ paddingBottom: '40px' }} />

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
      {missingRoutines.length > 0 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="animate-pop-in" style={{
            background: 'var(--bg-primary)', padding: '24px', borderRadius: 'var(--radius-md)',
            maxWidth: '300px', width: '100%', boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Missing Routine</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              <strong>"{missingRoutines[0].name}"</strong> exists in the database but not on this device. Do you want to restore it, or permanently remove it from your database? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => resolveMissingRoutine(missingRoutines[0].name, 'delete', missingRoutines[0].cloudData)}
                style={{ color: '#C58B86', padding: '8px', fontSize: '14px', fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                Delete
              </button>
              <button 
                onClick={() => resolveMissingRoutine(missingRoutines[0].name, 'restore', missingRoutines[0].cloudData)}
                style={{ background: 'var(--accent-primary)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
