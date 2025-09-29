import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { problemsApi, authApi } from "../services/api";
import { useQuestions } from "../context/QuestionsContext";
import { QuestionCard } from "./QuestionCard";
import { Button } from "./ui/button";
import { EditQuestionDialog } from "./EditQuestionDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

export function EnhancedUserProfile({ currentUser }) {
  const { id } = useParams(); // user id in the URL
  const navigate = useNavigate();
  const { questions, updateQuestion, deleteQuestion } = useQuestions();
  const [user, setUser] = useState(null);
  const [myQuestions, setMyQuestions] = useState([]);
  const DEMO_MODE = !import.meta.env.VITE_API_BASE;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

        if (DEMO_MODE) {
          const mine = questions.filter((q) => String(q.authorId) === String(id));
          if (alive) setMyQuestions(mine);
        } else {
          try {
            const list = await problemsApi.list({
              page: 1,
              per_page: 20,
              created_by: id,
            });
            const items = list.questions ?? list.problems ?? list.items ?? [];
            if (alive) setMyQuestions(items);
          } catch {
            if (alive) setMyQuestions([]);
          }
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
  }, [id, isMe, currentUser, DEMO_MODE, questions]);

  useEffect(() => {
    if (DEMO_MODE) {
      const mine = questions.filter((q) => String(q.authorId) === String(id));
      setMyQuestions(mine);
    }
  }, [DEMO_MODE, questions, id]);

  const renderableQuestions = useMemo(() => {
    if (DEMO_MODE) return myQuestions;
    const authoredInContext = questions.filter((q) => String(q.authorId) === String(id));
    const merged = [...myQuestions];
    authoredInContext.forEach((q) => {
      if (!merged.some((m) => String(m.id) === String(q.id))) merged.push(q);
    });
    return merged.map((q) => ({
      id: String(q.id),
      title: q.title,
      body: q.description ?? q.body ?? "",
      tags: q.tags?.map?.((t) => t.name ?? t) ?? [],
      votes: q.votes ?? 0,
      views: q.views ?? 0,
      bounty: q.bounty ?? 0,
      timestamp: q.created_at ? new Date(q.created_at) : new Date(),
      answers: q.answers ?? [],
      authorId: q.user_id ?? q.authorId ?? user?.id,
      authorName: q.author?.name ?? user?.name ?? "",
      isFollowing: false,
      status: q.status ?? "open",
    }));
  }, [DEMO_MODE, myQuestions, user, questions, id]);

  if (loading) return <div className="p-6">Loading profile���</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  const handleEditSave = async ({ title, body, tags }) => {
    const qid = editing?.id;
    try {
      if (!qid) return;
      if (!DEMO_MODE) {
        await problemsApi.update(qid, { title, description: body, tag_ids: [] });
      }
      updateQuestion(qid, { title, body, tags });
    } finally {
      setEditing(null);
      setEditOpen(false);
    }
  };

  const handleDelete = async () => {
    const qid = deletingId;
    try {
      if (!qid) return;
      if (!DEMO_MODE) {
        await problemsApi.remove(qid);
      }
      deleteQuestion(qid);
    } finally {
      setDeletingId(null);
    }
  };

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
        {renderableQuestions.length === 0 && (
          <div className="text-sm text-muted-foreground">No questions to display.</div>
        )}
        <div className="space-y-4">
          {renderableQuestions.map((q) => (
            <div key={q.id} className="space-y-2">
              <QuestionCard
                question={q}
                onClick={() => navigate(`/questions/${q.id}`)}
                onUserClick={() => {}}
                onVote={() => {}}
                currentUser={currentUser}
              />
              {String(currentUser?.id) === String(q.authorId) && (
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditing(q); setEditOpen(true); }}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeletingId(q.id)}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      {/* Edit dialog */}
      <EditQuestionDialog
        question={editing}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleEditSave}
      />

      {/* Delete confirm */}
      <AlertDialog open={Boolean(deletingId)} onOpenChange={(v)=>{ if(!v) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
