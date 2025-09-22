import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { problemsApi, authApi } from "../services/api";

export function EnhancedUserProfile({ currentUser }) {
  const { id } = useParams(); // user id in the URL
  const [user, setUser] = useState(null);
  const [myQuestions, setMyQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const isMe =
    currentUser &&
    (String(currentUser.id) === String(id) || String(id).toLowerCase() === "me");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        // If the route is my profile, prefer the already-known currentUser
        let u = isMe ? currentUser : null;

        // If we don't have a user object, try to fetch the authenticated user as a fallback
        if (!u) {
          try {
            const me = await authApi.me(); // requires a valid token
            if (String(me?.id) === String(id)) u = me;
          } catch {
            // not logged in or not the same user; we’ll render minimal info
          }
        }

        if (!u) {
          // minimal object so the header can render something
          u = { id, name: `User #${id}` };
        }

        if (alive) setUser(u);

        // Try loading this user's questions using a filter (backend may ignore it gracefully)
        try {
          const list = await problemsApi.list({
            page: 1,
            per_page: 20,
            created_by: id,
          });
          const items = list.questions ?? list.problems ?? list.items ?? [];
          if (alive) setMyQuestions(items);
        } catch {
          // If the API doesn't support created_by yet, just skip the list
          if (alive) setMyQuestions([]);
        }
      } catch (e) {
        if (alive) setErr("Failed to load profile");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id, isMe, currentUser]);

  if (loading) return <div className="p-6">Loading profile…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="border rounded p-4">
        <h1 className="text-2xl font-semibold">
          {user?.name ?? `User #${id}`}
        </h1>
        <div className="text-sm text-muted-foreground">
          ID: {user?.id}
          {user?.email ? <> · {user.email}</> : null}
          {user?.role ? <> · {user.role}</> : null}
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Questions</h2>
        {myQuestions.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No questions to display.
          </div>
        )}
        {myQuestions.map((q) => (
          <div key={q.id} className="border rounded p-4">
            <div className="flex items-center justify-between">
              <Link
                to={`/questions/${q.id}`}
                className="font-medium text-lg hover:underline"
              >
                {q.title}
              </Link>
              <div className="text-sm text-muted-foreground">
                {q.problem_type ?? q.type ?? "technical"}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {q.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
