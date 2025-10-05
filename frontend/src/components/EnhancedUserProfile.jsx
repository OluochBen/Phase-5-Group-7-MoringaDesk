import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { profileApi } from "../services/api";

export function EnhancedUserProfile({ currentUser }) {
  const { id } = useParams(); // user id in the URL
  const [user, setUser] = useState(null);
  const [myQuestions, setMyQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
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

        const targetId = String(id).toLowerCase() === "me" ? currentUser?.id : id;
        if (!targetId) {
          if (alive) {
            setErr("User not found");
            setLoading(false);
          }
          return;
        }

        const data = await profileApi.get(targetId);
        if (!alive) return;

        const profileData = data?.user || data;
        setUser(profileData || { id: targetId, name: `User #${targetId}` });
        setMyQuestions(Array.isArray(data?.questions) ? data.questions : []);
        setAnswers(Array.isArray(data?.answers) ? data.answers : []);
      } catch (error) {
        if (alive) {
          console.error('Failed to load profile', error);
          setErr("Failed to load profile");
        }
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

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Answers</h2>
        {answers.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No answers to display.
          </div>
        )}
        {answers.map((a) => (
          <div key={a.id} className="border rounded p-4">
            <div className="text-sm font-medium text-slate-700">
              {a.content || a.body || "Answer"}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Votes: {a.vote_count ?? a.votes ?? 0}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
