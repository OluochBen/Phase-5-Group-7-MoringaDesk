import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>Question List Page</h1>} />
      <Route path="/ask" element={<h1>Ask a Question Page</h1>} />
      <Route path="/questions/:id" element={<h1>Question Detail Page</h1>} />
      <Route path="/login" element={<h1>Login Page</h1>} />
      <Route path="/register" element={<h1>Register Page</h1>} />
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}

export default App;
