import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

// layout & shared
import { PublicNavbar } from "./components/PublicNavbar";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import PingProbe from "./components/dev/PingProbe";

// pages/components you already had
import { Homepage } from "./components/Homepage";
import { LoginScreen } from "./components/LoginScreen";
import { EnhancedDashboard } from "./components/EnhancedDashboard";
import { EnhancedQuestionDetails } from "./components/EnhancedQuestionDetails";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { FAQScreen } from "./components/FAQScreen";
import NewQuestionForm from "./components/NewQuestionForm";
import { EnhancedUserProfile } from "./components/EnhancedUserProfile";
import { mockNotifications, mockUsers } from "./data/mockData";

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
          onSignUp={() => navigate("/login")}
        />
      )}

      {/* Routes */}
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Homepage />} />

          <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />

          {/* Dashboard now fetches from /problems itself */}
          <Route
            path="/dashboard"
            element={<EnhancedDashboard currentUser={currentUser} />}
          />

          {/* Question details (loads question, solutions, allows posting/voting) */}
          <Route
            path="/questions/:id"
            element={<EnhancedQuestionDetails currentUser={currentUser} />}
          />

          {/* ✅ New question form */}
          <Route path="/ask" element={<NewQuestionForm />} />

          {/* ✅ Enhanced user profile */}
          <Route
            path="/profile/:id"
            element={<EnhancedUserProfile currentUser={currentUser} />}
          />

          <Route path="/faq" element={<FAQScreen currentUser={currentUser} />} />

          <Route
            path="/notifications"
            element={
              <NotificationsPanel
                notifications={notifications}
                onMarkAsRead={(id) =>
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                  )
                }
              />
            }
          />

        </Routes>
      </main>

      {/* Footer for public pages */}
      {!currentUser && <Footer />}

      <Toaster />

      {/* Dev-only API ping badge */}
Frontend
      {import.meta.env.DEV && import.meta.env.VITE_API_BASE && (
        <div className="dev-ping-probe fixed left-3 bottom-3 z-[9999]">
      {import.meta.env.DEV && (
        <div style={{ position: "fixed", left: 12, bottom: 12, zIndex: 9999 }}>
 main
          <PingProbe />
        </div>
      )}
    </div>
  );
}
