import React, { useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

// layout & shared
import { PublicNavbar } from "./components/PublicNavbar";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import PingProbe from "./components/dev/PingProbe";

// pages/components
import { Homepage } from "./components/Homepage";
import { AuthPage } from "./components/AuthPage";
import  UserHome  from "./components/UserHome";
import EnhancedQuestionDetails from "./components/EnhancedQuestionDetails";
import { AdminPanel } from "./components/AdminPanel";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { FAQScreen } from "./components/FAQScreen";
import NewQuestionForm from "./components/NewQuestionForm";
import { EnhancedUserProfile } from "./components/EnhancedUserProfile";
import { PasswordReset } from "./components/PasswordReset"; // ✅ added

// mock data (for demo mode)
import { mockNotifications, mockQuestions, mockUsers } from "./data/mockData";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);

  const navigate = useNavigate();

  // ---- auth handlers ----
  const handleLogin = (user) => {
    setCurrentUser(user);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const RequireAuth = ({ children }) => {
    if (!currentUser) return <Navigate to="/login" replace />;
    return children;
  };

  const RequireAdmin = ({ children }) => {
    if (!currentUser) return <Navigate to="/login" replace />;
    if (currentUser.role !== "admin") return <Navigate to="/dashboard" replace />;
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
          {/* ✅ Forgot password / reset flow */}
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

          {/* Alternative user home */}
          <Route
            path="/user"
            element={
              <RequireAuth>
                <UserHome currentUser={currentUser} />
              </RequireAuth>
            }
          />

          {/* Question details */}
          <Route
            path="/questions/:id"
            element={<EnhancedQuestionDetails currentUser={currentUser} />}
          />

          {/* New question form */}
          <Route
            path="/ask"
            element={
              <RequireAuth>
                <NewQuestionForm />
              </RequireAuth>
            }
          />

          {/* Enhanced user profile */}
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

          {/* Admin Panel */}
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

      {/* Footer for public pages */}
      {!currentUser && <Footer />}

      <Toaster />

      {/* Dev-only API ping badge */}
      {import.meta.env.DEV && import.meta.env.VITE_API_BASE && (
        <div className="dev-ping-probe fixed left-3 bottom-3 z-[9999]">
          <PingProbe />
        </div>
      )}
    </div>
  );
}

