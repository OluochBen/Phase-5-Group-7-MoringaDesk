//import { Routes, Route } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// ✅ Import page components
import AskQuestionPage from './pages/Questions/AskQuestionPage';
import QuestionListPage from './pages/Questions/QuestionListPage';
import QuestionDetailPage from './pages/Questions/QuestionDetailPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from "./pages/Dashboard/Dashboardpage";




function App() {
  return (
    <Routes>
      <Route path="/" element={<QuestionListPage />} />
      <Route path="/ask" element={<AskQuestionPage />} />
      <Route path="/questions/:id" element={<QuestionDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      
    </Routes>
  );
}

export default App;
