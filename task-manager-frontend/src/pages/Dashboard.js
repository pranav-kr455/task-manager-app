import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); 
  

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  const fetchTasks = async () => {
    try {
      let url = '/tasks/';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      const response = await api.get(url);
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks/', {
        title,
        description,
        priority,
        due_date: dueDate || null,
      });
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setDueDate('');
      fetchTasks(); 
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      await api.patch(`/tasks/${id}/`, { is_completed: !currentStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}/`);
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.is_completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  return (
    <div style={{ maxWidtth: '800px', margin: '30px auto', padding: '0 20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h2>Task Dashboard</h2>
        <button onClick={logout} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Log Out</button>
      </div>

     {/* Progress Bar (Bonus Feature) */}
     <div style={{ margin: '20px 0', background: '#e9ecef', borderRadius: '8px', overflow: 'hidden', position: 'relative', height: '30px' }}>
       <div style={{ width: `${completionPercentage}%`, background: '#28a745', height: '100%', transition: 'width 0.3s ease' }} />
         <span style={{ position: 'absolute', width: '100%', textAlign: 'center', top: '5px', left: 0, fontWeight: 'bold', color: '#333' }}>
           {completionPercentage}% Tasks Completed
         </span>
     </div>
      {/* Task Creation Form */}
      <form onSubmit={handleCreateTask} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
        <h3>Create New Task</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px' }}>
          <input type="text" placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '8px' }} required />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: '8px' }}>
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px' }}>
          <textarea placeholder="Description (Optional)" value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: '8px', gridColumn: 'span 2', height: '60px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Due Date:</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ padding: '8px', width: '50%' }} />
        </div>
        <button type="submit" style={{ background: '#007bff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Add Task</button>
      </form>

      {/* Filtering Tab Section */}
      <div style={{ marginBottom: '15px' }}>
        <button onClick={() => setFilter('all')} style={{ marginRight: '10px', padding: '6px 12px', background: filter === 'all' ? '#6c757d' : '#e2e8f0', color: filter === 'all' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>All Tasks</button>
        <button onClick={() => setFilter('pending')} style={{ marginRight: '10px', padding: '6px 12px', background: filter === 'pending' ? '#6c757d' : '#e2e8f0', color: filter === 'pending' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Pending</button>
        <button onClick={() => setFilter('completed')} style={{ padding: '6px 12px', background: filter === 'completed' ? '#6c757d' : '#e2e8f0', color: filter === 'completed' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Completed</button>
      </div>

      {/* Task List Container */}
      <div>
        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', padding: '15px', borderRadius: '6px', marginBottom: '10px', backgroundColor: task.is_completed ? '#f1fdf5' : '#fff' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', textDecoration: task.is_completed ? 'line-through' : 'none', color: task.is_completed ? '#6c757d' : '#000' }}>{task.title}</h4>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#555' }}>{task.description}</p>
                <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                  <span style={{ padding: '2px 6px', borderRadius: '4px', background: task.priority === 'HIGH' ? '#f8d7da' : task.priority === 'MEDIUM' ? '#fff3cd' : '#d1ecf1', color: task.priority === 'HIGH' ? '#721c24' : task.priority === 'MEDIUM' ? '#856404' : '#0c5460' }}>
                    {task.priority}
                  </span>
                  {task.due_date && <span style={{ color: '#666' }}>Due: {task.due_date}</span>}
                </div>
              </div>
              <div>
                <button onClick={() => handleToggleComplete(task.id, task.is_completed)} style={{ background: task.is_completed ? '#6c757d' : '#28a745', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '10px', cursor: 'pointer' }}>
                  {task.is_completed ? 'Mark Pending' : 'Mark Complete'}
                </button>
                <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Dashboard;