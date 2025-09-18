export async function fetchProfile(userId, token) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/${userId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}
