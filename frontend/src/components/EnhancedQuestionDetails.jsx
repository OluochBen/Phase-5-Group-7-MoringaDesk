// src/components/EnhancedQuestionDetails.jsx - FIXED VERSION
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { problemsApi } from "../services/api";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { QuestionDetails } from "./QuestionDetails";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function EnhancedQuestionDetails({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    
    const fetchQuestionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔄 Fetching question ID:", id);
        
        // Fetch problem data
        const problemData = await problemsApi.get(id);
        console.log("🔍 RAW API RESPONSE:", problemData);
        
        if (!alive) return;

        // Extract the actual data (handle both {item: data} and direct data)
        const actualData = problemData.item || problemData;
        console.log("🔍 ACTUAL DATA:", actualData);

        // Extract author information from all possible locations
        const authorInfo = actualData.author || {};
        console.log("🔍 AUTHOR INFO:", authorInfo);

        // Build the author name from all possible fields
        const authorName = 
          authorInfo.name || 
          authorInfo.username || 
          actualData.authorName || 
          actualData.user_name || 
          "Unknown User";

        console.log("🔍 FINAL AUTHOR NAME:", authorName);

        // Normalize problem data to match QuestionDetails expectations
        const normalizedProblem = {
          id: actualData.id,
          title: actualData.title || "(untitled)",
          description: actualData.description || actualData.body || "",
          body: actualData.description || actualData.body || "",
          tags: Array.isArray(actualData.tags) ? actualData.tags : [],
          votes: actualData.votes || actualData.follows_count || 0,
          views: actualData.views || 0,
          bounty: actualData.bounty || 0,
          createdAt: actualData.created_at || actualData.createdAt,
          updatedAt: actualData.updated_at || actualData.updatedAt,
          timestamp: actualData.created_at || actualData.createdAt || new Date().toISOString(),
          
          // CRITICAL: Author information for QuestionDetails
          authorId: authorInfo.id || actualData.user_id || actualData.authorId || 0,
          authorName: authorName, // This is what QuestionDetails uses
          
          // For compatibility with other components
          author: {
            id: authorInfo.id || actualData.user_id || actualData.authorId || 0,
            name: authorName,
            email: authorInfo.email || "",
            role: authorInfo.role || "user"
          },
          
          // Additional fields
          user_id: authorInfo.id || actualData.user_id || actualData.authorId || 0,
          solutions_count: actualData.solutions_count || 0,
          follows_count: actualData.follows_count || 0,
          isFollowing: actualData.isFollowing || false
        };

        console.log("✅ FINAL NORMALIZED PROBLEM:", normalizedProblem);

        setProblem(normalizedProblem);
        setAnswers([]);

      } catch (err) {
        console.error("❌ Error fetching question:", err);
        if (!alive) return;
        setError(err.response?.data?.error || err.message || "Failed to load question");
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchQuestionData();

    return () => {
      alive = false;
    };
  }, [id]);

  const handleAddAnswer = async (questionId, answerBody) => {
    const newAnswer = {
      id: Date.now(),
      authorId: currentUser?.id || 0,
      authorName: currentUser?.name || "Current User",
      body: answerBody,
      content: answerBody,
      votes: 0,
      userVote: 0,
      myVote: 0,
      timestamp: new Date().toISOString(),
      author: currentUser || {
        id: currentUser?.id || 0,
        name: currentUser?.name || "Current User"
      }
    };
    setAnswers(prev => [...prev, newAnswer]);
  };

  const handleAnswerVote = async (answerId, voteType) => {
    setAnswers(prev => prev.map(answer => 
      answer.id === answerId 
        ? { 
            ...answer, 
            votes: voteType === 'up' ? answer.votes + 1 : answer.votes - 1,
            userVote: voteType === 'up' ? 1 : -1,
            myVote: voteType === 'up' ? 1 : -1
          }
        : answer
    ));
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card><CardContent className="p-6">Loading question...</CardContent></Card>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center justify-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <div>
                <h3 className="font-semibold">Unable to load question</h3>
                <p className="text-sm">{error || "Question not found"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <QuestionDetails
        question={problem}
        answers={answers}
        onVote={() => {}} // Question-level voting not implemented yet
        onAddAnswer={handleAddAnswer}
        onUserClick={handleUserClick}
        currentUser={currentUser}
      />
    </div>
  );
}