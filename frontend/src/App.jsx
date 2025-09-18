import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import { Homepage } from "./components/Homepage";
import { PublicNavbar } from "./components/PublicNavbar";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { EnhancedDashboard } from "./components/EnhancedDashboard";
import { LoginScreen } from "./components/LoginScreen";
import { EnhancedQuestionDetails } from "./components/EnhancedQuestionDetails";
import { EnhancedUserProfile } from "./components/EnhancedUserProfile";
import { EnhancedAdminPanel } from "./components/EnhancedAdminPanel";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { FAQScreen } from "./components/FAQScreen";
import { Toaster } from "./components/ui/sonner";

import {
  mockQuestions,
  mockUsers,
  mockNotifications,
} from "./data/mockData.js";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [questions, setQuestions] = useState(mockQuestions);
  const [notifications, setNotifications] = useState(mockNotifications);

  const navigate = useNavigate();

  // ---- Handlers ----
  const handleLogin = (user) => {
    setCurrentUser(user);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  const handleVote = (questionId, delta) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, votes: q.votes + delta } : q
      )
    );
  };

  const handleAddAnswer = (questionId, answerBody) => {
    if (!currentUser) return;

    const newAnswer = {
      id: Date.now().toString(),
      body: answerBody,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorReputation: currentUser.reputation,
      votes: 0,
      timestamp: new Date(),
      comments: [],
    };

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, answers: [...q.answers, newAnswer] }
          : q
      )
    );

    // Add notification for question author
    const question = questions.find((q) => q.id === questionId);
    if (question && currentUser.id !== question.authorId) {
      const newNotification = {
        id: Date.now().toString(),
        type: "answer",
        title: "New Answer",
        message: `${currentUser.name} answered your question`,
        timestamp: new Date(),
        read: false,
        actionUrl: `/questions/${questionId}`,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    }
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

      {/* Main Routes */}
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />
          <Route
            path="/dashboard"
            element={
              <EnhancedDashboard
                questions={questions}
                onVote={handleVote}
                currentUser={currentUser}
              />
            }
          />
          <Route
            path="/questions/:id"
            element={
              <EnhancedQuestionDetails
                questions={questions}
                onVote={handleVote}
                onAddAnswer={handleAddAnswer}
                currentUser={currentUser}
              />
            }
          />
          <Route
            path="/profile/:id"
            element={
              <EnhancedUserProfile
                questions={questions}
                currentUser={currentUser}
              />
            }
          />
          <Route
            path="/admin"
            element={
              currentUser?.role === "admin" ? (
                <EnhancedAdminPanel
                  questions={questions}
                  users={mockUsers}
                  currentUser={currentUser}
                />
              ) : (
                <div className="p-8 text-center">Unauthorized</div>
              )
            }
          />
          <Route
            path="/faq"
            element={<FAQScreen currentUser={currentUser} />}
          />
          <Route
            path="/notifications"
            element={
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
            }
          />
        </Routes>
      </main>

      {/* Footer only for public pages */}
      {!currentUser && <Footer />}

      <Toaster />
    </div>
  );
}
