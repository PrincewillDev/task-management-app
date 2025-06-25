import React, { useState, useEffect } from 'react';
import { authAPI, tasksAPI } from '../services/api.js';

const Dashboard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await authAPI.getUserTasks();
      setTasks(response.data);
    } catch (error) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateTask(taskId, { status: newStatus });
      fetchTasks(); // Refresh tasks
    } catch (error) {
      setError('Failed to update task');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    onLogout();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <div className="header">
        <h2>Dashboard - Welcome {user.email}</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <div className="tasks">
        <h3>My Tasks</h3>
        {tasks.length === 0 ? (
          <p>No tasks assigned to you.</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="task-card">
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <p>Status: {task.status}</p>
              <p>Created by: {task.created_by_name}</p>
              <div>
                <label>Update Status:</label>
                <select 
                  value={task.status} 
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;