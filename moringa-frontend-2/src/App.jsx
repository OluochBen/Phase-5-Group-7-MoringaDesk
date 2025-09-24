import { Routes, Route } from 'react-router-dom';

// ✅ Import page components
import AskQuestionPage from './pages/Questions/AskQuestionPage';
import QuestionListPage from './pages/Questions/QuestionListPage';
import QuestionDetailPage from './pages/Questions/QuestionDetailPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';


function App() {
  return (
    <Routes>
      <Route path="/" element={<QuestionListPage />} />
      <Route path="/ask" element={<AskQuestionPage />} />
      <Route path="/questions/:id" element={<QuestionDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
    </Routes>
  );
}

export default App;
