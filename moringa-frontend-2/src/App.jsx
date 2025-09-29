import { Routes, Route } from "react-router-dom";

// ✅ Import page components
import HomePage from "./pages/HomePage/HomePage";
import AskQuestionPage from './pages/Questions/AskQuestionPage';
import QuestionListPage from './pages/Questions/QuestionListPage';
import QuestionDetailPage from './pages/Questions/QuestionDetailPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from "./pages/Dashboard/Dashboardpage";
import FAQsPage from "./pages/Questions/FAQsPage";
import QuestionPage from "./pages/Questions/QuestionPage";
import UserProfilePage from "./pages/Profile/UserProfilePage";
import AdminProfile from "./pages/Admin/AdminProfile";
import ForgotPassword from "./pages/Auth/ForgotPassword";

function App() {
  return (
    <>
      {/* ✅ Navbar always visible */}
      

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/questions" element={<QuestionListPage />} />
        <Route path="/ask" element={<AskQuestionPage />} />
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/faqs" element={<FAQsPage />} />
        <Route path="/question/:id" element={<QuestionPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </>
  );
}

export default App;
