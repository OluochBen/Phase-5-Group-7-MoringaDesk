import { useState } from "react";
import { authApi } from "../services/api";

export function RegisterScreen({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { access_token } = await authApi.register(name, email, password);
      localStorage.setItem("access_token", access_token);
      const me = await authApi.me();
      onRegister(me.user ?? me);
    } catch (e) {
      setErr(e.response?.data?.message || e.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="border rounded p-2 w-full" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Full name" />
        <input className="border rounded p-2 w-full" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
        <input className="border rounded p-2 w-full" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" />
        <button className="bg-black text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
