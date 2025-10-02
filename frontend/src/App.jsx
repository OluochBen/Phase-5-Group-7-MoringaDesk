// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

// layout & shared
import { PublicNavbar } from "./components/PublicNavbar";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import PingProbe from "./components/dev/PingProbe";
import ContactPage from "./components/ui/ContactPage"; // ✅ contact page import

// pages/components
import { Homepage } from "./components/Homepage";
import { AuthPage } from "./components/AuthPage";
import UserHome from "./components/UserHome";
import EnhancedQuestionDetails from "./components/EnhancedQuestionDetails";
import { AdminPanel } from "./components/AdminPanel";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { FAQScreen } from "./components/FAQScreen";
import NewQuestionForm from "./components/NewQuestionForm";
import { EnhancedUserProfile } from "./components/EnhancedUserProfile";
import { PasswordReset } from "./components/PasswordReset";

// mock data
import { mockNotifications, mockQuestions, mockUsers } from "./data/mockData";

// API
import { authApi } from "./services/api";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [loadingUser, setLoadingUser] = useState(true);

  const navigate = useNavigate();

  // bootstrap user on refresh
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoadingUser(false);
      return;
    }

    (async () => {
      try {
        const me = await authApi.me();
        setCurrentUser(me.user ?? me);
      } catch (err) {
        console.error("Token invalid, logging out", err);
        localStorage.removeItem("access_token");
        setCurrentUser(null);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  // auth handlers
  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("access_token");
    navigate("/");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // route guards
  const RequireAuth = ({ children }) => {
    if (loadingUser) return <div className="p-8 text-center">Loading...</div>;
    if (!currentUser) return <Navigate to="/login" replace />;
    return children;
  };

  const RequireAdmin = ({ children }) => {
    if (loadingUser) return <div className="p-8 text-center">Loading...</div>;
    if (!currentUser) return <Navigate to="/login" replace />;
    if (currentUser.role !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      {currentUser ? (
        <Navbar
          user={currentUser}
          onNavigate={navigate}
          onLogout={handleLogout}
          unreadNotifications={unreadCount}
        />
      ) : (
        <PublicNavbar
          onLogin={() => navigate("/login")}
          onSignUp={() => navigate("/register")}
        />
      )}

      {/* Routes */}
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Homepage />} />

          {/* Contact Page ✅ */}
          <Route path="/contact" element={<ContactPage />} />

          {/* Auth */}
          <Route
            path="/login"
            element={
              <AuthPage
                defaultTab="login"
                onLogin={handleLogin}
                onRegister={handleLogin}
              />
            }
          />
          <Route
            path="/register"
            element={
              <AuthPage
                defaultTab="signup"
                onLogin={handleLogin}
                onRegister={handleLogin}
              />
            }
          />
          <Route
            path="/reset-password"
            element={
              <PasswordReset
                onSuccess={() => navigate("/login")}
                onClose={() => navigate("/login")}
              />
            }
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <UserHome currentUser={currentUser} />
              </RequireAuth>
            }
          />

          {/* Ask a Question */}
          <Route
            path="/ask"
            element={
              <RequireAuth>
                <NewQuestionForm />
              </RequireAuth>
            }
          />

          {/* Single Question */}
          <Route
            path="/questions/:id"
            element={
              <RequireAuth>
                <EnhancedQuestionDetails currentUser={currentUser} />
              </RequireAuth>
            }
          />

          {/* User profile */}
          <Route
            path="/profile/:id"
            element={
              <RequireAuth>
                <EnhancedUserProfile currentUser={currentUser} />
              </RequireAuth>
            }
          />

          {/* FAQs */}
          <Route path="/faq" element={<FAQScreen currentUser={currentUser} />} />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              <RequireAuth>
                <NotificationsPanel
                  notifications={notifications}
                  onMarkAsRead={(id) =>
                    setNotifications((prev) =>
                      prev.map((n) =>
                        n.id === id ? { ...n, read: true } : n
                      )
                    )
                  }
                />
              </RequireAuth>
            }
          />

          {/* Admin-only */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPanel
                  questions={mockQuestions}
                  users={mockUsers}
                  currentUser={currentUser}
                />
              </RequireAdmin>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ✅ Footer always visible */}
      <Footer />

      <Toaster />

      {/* Dev-only ping */}
      {import.meta.env.DEV && import.meta.env.VITE_API_BASE && (
        <div className="dev-ping-probe fixed left-3 bottom-3 z-[9999]">
          <PingProbe />
        </div>
      )}
    </div>
  );
}
