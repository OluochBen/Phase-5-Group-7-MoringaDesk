import { useState } from "react";
import { authApi } from "../services/api";

export function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      // Authenticate
      const { user, access_token } = await authApi.login(email, password);

      // Save JWT
      localStorage.setItem("access_token", access_token);

      // Fetch profile
      const me = await authApi.me();

      // Pass user to parent
      onLogin(me.user ?? user);
    } catch (e) {
      setErr(e.response?.data?.error || e.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="border rounded p-2 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
        />
        <input
          className="border rounded p-2 w-full"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50 w-full"
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
