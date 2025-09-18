export async function fetchProfile(userId, token) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch profile: ${res.statusText}`);
  }

  return await res.json();
}
