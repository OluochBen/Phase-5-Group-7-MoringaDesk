// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";

// layout & shared
import { PublicNavbar } from "./components/PublicNavbar";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import PingProbe from "./components/dev/PingProbe";

// pages/components
import { Homepage } from "./components/Homepage";
import { AuthPage } from "./components/AuthPage";
import UserHome from "./components/UserHome";
import EnhancedDashboard from "./components/EnhancedDashboard";
import EnhancedQuestionDetails from "./components/EnhancedQuestionDetails";
import { EnhancedAdminPanel } from "./components/EnhancedAdminPanel";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { FAQScreen } from "./components/FAQScreen";
import NewQuestionForm from "./components/NewQuestionForm";
import { EnhancedUserProfile } from "./components/EnhancedUserProfile";
import { PasswordReset } from "./components/PasswordReset";
import { SocialAuthCallback } from "./components/SocialAuthCallback";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { TermsPage } from "./pages/LegalTermsPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { CodeOfConductPage } from "./pages/CodeOfConductPage";
import { CommunityGuidelinesPage } from "./pages/GuidelinesPage";
import { SystemStatusPage } from "./pages/SystemStatusPage";
import { ApiDocsPage } from "./pages/ApiDocsPage";
import { BlogListPage } from "./pages/BlogListPage";
import { BlogPostPage } from "./pages/BlogPostPage";

// ✅ API
import { authApi, notificationsApi } from "./services/api";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const loadNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      return [];
    }

    try {
      const data = await notificationsApi.list({ page: 1, per_page: 50, unread_only: false });
      const list = data?.notifications ?? data?.items ?? (Array.isArray(data) ? data : []);
      const normalized = Array.isArray(list) ? list : [];
      setNotifications(normalized);
      return normalized;
    } catch (err) {
      console.error("Failed to load notifications", err);
      setNotifications([]);
      return [];
    }
  }, [currentUser]);

  // ---- bootstrap user on refresh ----
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

  // ---- sync notifications with current user ----
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    loadNotifications();
  }, [currentUser, loadNotifications]);

  // optional periodic refresh
  useEffect(() => {
    if (!currentUser) return undefined;
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser, loadNotifications]);

  // ---- auth handlers ----
  const handleLogin = (user) => {
    setCurrentUser(user);
    navigate(user.role === "admin" ? "/admin" : "/dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setNotifications([]);
    localStorage.removeItem("access_token");
    navigate("/");
  };

  // redirect authenticated users away from landing page
  useEffect(() => {
    if (loadingUser) return;
    if (currentUser && location.pathname === "/") {
      navigate(currentUser.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [loadingUser, currentUser, location.pathname, navigate]);

  const unreadCount = notifications.filter((n) => !n.read && !n.is_read).length;

  const handleLocalMarkRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, is_read: true } : n))
    );
  }, []);

  const handleLocalMarkAll = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, is_read: true })));
  }, []);

  // ---- route guards ----
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

  const currentScreen = (() => {
    if (location.pathname.startsWith("/admin")) return "admin";
    if (location.pathname.startsWith("/dashboard")) return "dashboard";
    if (location.pathname.startsWith("/questions")) return "questions";
    if (location.pathname.startsWith("/notifications")) return "notifications";
    if (location.pathname.startsWith("/faq")) return "faq";
    return "";
  })();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      {currentUser ? (
        <Navbar
          user={currentUser}
          onNavigate={navigate}
          onLogout={handleLogout}
          currentScreen={currentScreen}
          unreadNotifications={unreadCount}
        />
      ) : (
        <PublicNavbar onLogin={() => navigate("/login")} onSignUp={() => navigate("/register")} />
      )}

      {/* Routes */}
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/conduct" element={<CodeOfConductPage />} />
          <Route path="/guidelines" element={<CommunityGuidelinesPage />} />
          <Route path="/status" element={<SystemStatusPage />} />
          <Route path="/api-docs" element={<ApiDocsPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />

          {/* Auth */}
          <Route
            path="/login"
            element={<AuthPage defaultTab="login" onLogin={handleLogin} onRegister={handleLogin} />}
          />
          <Route
            path="/register"
            element={<AuthPage defaultTab="signup" onLogin={handleLogin} onRegister={handleLogin} />}
          />
          <Route path="/auth/callback" element={<SocialAuthCallback onComplete={handleLogin} />} />
          <Route
            path="/reset-password"
            element={<PasswordReset onSuccess={() => navigate("/login")} onClose={() => navigate("/login")} />}
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <EnhancedDashboard currentUser={currentUser} />
              </RequireAuth>
            }
          />

          <Route
            path="/questions"
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
                  onMarkAsRead={async (id) => {
                    handleLocalMarkRead(id);
                    await loadNotifications();
                  }}
                  onMarkAllRead={async () => {
                    handleLocalMarkAll();
                    await loadNotifications();
                  }}
                  onRefresh={loadNotifications}
                />
              </RequireAuth>
            }
          />

          {/* Admin-only */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <EnhancedAdminPanel currentUser={currentUser} />
              </RequireAdmin>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!currentUser && <Footer />}
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
