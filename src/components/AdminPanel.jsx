import React, { useState, useEffect } from 'react';
import { tasksAPI, authAPI } from '../services/api.js';

const AdminPanel = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to_email: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('Failed to fetch tasks: ' + (error.response?.data?.detail || error.message));
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      console.log('Fetched users:', response.data);
      // Filter out the current admin user from the list
      const filteredUsers = response.data.filter(fetchedUser => fetchedUser.email !== user.email);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to fetch users: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Additional validation to ensure admin doesn't assign task to themselves
    if (newTask.assigned_to_email === user.email) {
      setError('Admins cannot assign tasks to themselves. Please select a different user.');
      setLoading(false);
      return;
    }
    
    try {
      await tasksAPI.createTask(newTask);
      setNewTask({
        title: '',
        description: '',
        assigned_to_email: '',
        status: 'pending'
      });
      setShowCreateForm(false);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('Failed to create task: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReassignTask = async (taskId, newAssigneeEmail) => {
    // Prevent admin from reassigning task to themselves
    if (newAssigneeEmail === user.email) {
      setError('Admins cannot assign tasks to themselves. Please select a different user.');
      return;
    }
    
    try {
      await tasksAPI.updateTask(taskId, { assigned_to_email: newAssigneeEmail });
      await fetchTasks();
    } catch (error) {
      console.error('Failed to reassign task:', error);
      setError('Failed to reassign task: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.deleteTask(taskId);
        await fetchTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
        setError('Failed to delete task: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  // Get available users (excluding admin)
  const availableUsers = users.filter(fetchedUser => fetchedUser.email !== user.email);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-panel">
      <h2>Admin Panel - Task Management</h2>
      
      {error && <div className="error">{error}</div>}
      
      <div className="admin-actions">
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-task-btn"
        >
          {showCreateForm ? 'Cancel' : 'Create New Task'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateTask} className="create-task-form">
          <h3>Create New Task</h3>
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Description:</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows="4"
            />
          </div>
          <div>
            <label>Assign to (Users only):</label>
            <select
              value={newTask.assigned_to_email}
              onChange={(e) => setNewTask({ ...newTask, assigned_to_email: e.target.value })}
              required
            >
              <option value="">Select User</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.email}>
                  {user.email}
                </option>
              ))}
            </select>
            {availableUsers.length === 0 && (
              <p style={{color: 'red', fontSize: '12px'}}>
                No regular users found. Only non-admin users can be assigned tasks.
              </p>
            )}
          </div>
          <div>
            <label>Status:</label>
            <select
              value={newTask.status}
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button type="submit" disabled={loading || availableUsers.length === 0}>
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      )}

      <div className="tasks-list">
        <h3>All Tasks ({tasks.length})</h3>
        <p>Available Users for Assignment: {availableUsers.length}</p>
        
        {tasks.length === 0 ? (
          <p>No tasks created yet.</p>
        ) : (
          <div className="tasks-grid">
            {tasks.map(task => (
              <div key={task.id} className="task-card admin-task-card">
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <p><strong>Status:</strong> {task.status}</p>
                <p><strong>Assigned to:</strong> {task.assigned_to_name || 'Unassigned'}</p>
                <p><strong>Created by:</strong> {task.created_by_name}</p>
                <p><strong>Created:</strong> {new Date(task.created_at).toLocaleDateString()}</p>
                
                <div className="admin-actions">
                  <div>
                    <label>Reassign to:</label>
                    <select
                      onChange={(e) => e.target.value && handleReassignTask(task.id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="">Select User</option>
                      {availableUsers.map(user => (
                        <option key={user.id} value={user.email}>
                          {user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;