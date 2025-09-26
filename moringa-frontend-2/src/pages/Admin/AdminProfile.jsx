// src/pages/admin/AdminProfile.jsx
import React from "react";

export default function AdminProfile() {
  const users = [
    { id: 1, name: "Jane Doe", email: "jane@example.com", role: "student", joined: "2025-09-01", questionsAsked: 5 },
    { id: 2, name: "John Smith", email: "john@example.com", role: "student", joined: "2025-08-20", questionsAsked: 3 },
  ];

  return (
    <div className="admin-profile-container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users and monitor activity</p>
      </header>

      <section className="user-table-section">
        <h2>Users List</h2>
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Questions Asked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.joined}</td>
                  <td>{user.questionsAsked}</td>
                  <td>
                    <button className="edit-btn">Edit</button>
                    <button className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Inline styling */}
      <style>{`
        .admin-profile-container {
          padding: 2rem;
          font-family: Arial, sans-serif;
          background-color: #f9f9f9;
          min-height: 100vh;
        }

        .admin-header {
          margin-bottom: 2rem;
        }

        .admin-header h1 {
          font-size: 2rem;
          color: #333;
        }

        .admin-header p {
          font-size: 1rem;
          color: #666;
        }

        .user-table-section h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .table-container {
          overflow-x: auto;
          background: white;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
        }

        .user-table {
          width: 100%;
          border-collapse: collapse;
        }

        .user-table th, .user-table td {
          padding: 12px;
          border-bottom: 1px solid #eaeaea;
          text-align: left;
        }

        .user-table th {
          background-color: #f0f0f0;
          font-weight: bold;
        }

        .user-table tr:hover {
          background-color: #f7f7f7;
        }

        .edit-btn, .delete-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .edit-btn {
          background-color: #4caf50;
          color: white;
        }

        .edit-btn:hover {
          background-color: #45a049;
        }

        .delete-btn {
          background-color: #f44336;
          color: white;
          margin-left: 5px;
        }

        .delete-btn:hover {
          background-color: #d32f2f;
        }
      `}</style>
    </div>
  );
}
