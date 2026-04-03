import React, { useEffect, useState } from 'react';
import api from '../api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editingUser.id}`, {
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        role: editingUser.role,
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <div>
      <h2>User Management (Admin)</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.first_name} {u.last_name}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleEdit(u)}>Edit</button>
                <button onClick={() => handleDelete(u.id)} disabled={u.id === 'admin_id'}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <div className="edit-modal">
          <h3>Edit User: {editingUser.email}</h3>
          <form onSubmit={handleUpdate}>
            <input 
              value={editingUser.first_name} 
              onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})} 
              placeholder="First Name" 
              required 
            />
            <input 
              value={editingUser.last_name} 
              onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})} 
              placeholder="Last Name" 
              required 
            />
            <select 
              value={editingUser.role} 
              onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
            >
              <option value="user">User</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditingUser(null)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
