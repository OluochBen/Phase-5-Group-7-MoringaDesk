import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserProfile } from "../components/UserProfile";
import { fetchProfile } from "../api/profile";

export default function ProfilePage({ currentUser, token }) {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchProfile(userId, token);
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [userId, token]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <UserProfile
      userId={userId}
      questions={profileData.questions || []}
      currentUser={currentUser}
      onQuestionClick={(qid) => console.log("Navigate to question:", qid)}
    />
  );
}
