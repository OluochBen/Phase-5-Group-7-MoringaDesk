import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AskQuestionPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      setError("You must be logged in to ask a question.");
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/questions', // change to your actual backend route
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess("Question submitted successfully!");
      setFormData({ title: '', description: '', category: '' });

      // Optional: Redirect after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit question');
    }
  };

  return (
    <div>
      <h2>Ask a Question</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Question Title"
          value={formData.title}
          onChange={handleChange}
          required
        /><br />

        <select name="category" value={formData.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
          <option value="technical">Technical</option>
          <option value="logical">Logical</option>
        </select><br />

        <textarea
          name="description"
          placeholder="Describe your problem..."
          value={formData.description}
          onChange={handleChange}
          required
        /><br />

        <button type="submit">Submit Question</button>
      </form>
    </div>
  );
}

export default AskQuestionPage;
