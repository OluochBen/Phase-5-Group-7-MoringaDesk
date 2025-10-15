import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { feedbackApi } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const FEEDBACK_TYPES = {
  bug: {
    title: "Report a bug",
    description:
      "Spotted something broken? Share details so we can reproduce and squash it quickly.",
    priorityHint: "If this blocks learning or breaks a key feature, mark as high priority.",
  },
  feature: {
    title: "Request a feature",
    description:
      "Suggest enhancements that would make MoringaDesk more useful for learners and facilitators.",
    priorityHint: "Tell us how impactful this would be for your workflow.",
  },
};

const DEFAULT_FORM = {
  title: "",
  description: "",
  contact_name: "",
  contact_email: "",
  priority: "normal",
};

export function FeedbackPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("bug");
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam && (typeParam === "bug" || typeParam === "feature")) {
      setActiveTab(typeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    setForm({ ...DEFAULT_FORM });
  }, [activeTab]);

  const config = useMemo(() => FEEDBACK_TYPES[activeTab], [activeTab]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await feedbackApi.submit({
        feedback_type: activeTab,
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        contact_name: form.contact_name.trim() || undefined,
        contact_email: form.contact_email.trim() || undefined,
      });
      toast.success("Thanks for the feedback! We’ll review it shortly.");
      setForm({ ...DEFAULT_FORM });
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "We couldn’t submit your feedback. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("type", value);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-blue-50/30 pb-16 pt-24">
      <div className="mx-auto w-full max-w-4xl px-4 md:px-6 lg:px-8">
        <div className="text-center">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            Feedback hub
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
            Help us make MoringaDesk even better
          </h1>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Whether something broke or you have a dream feature in mind, we read every submission and keep the community updated as we act on them.
          </p>
        </div>

        <Card className="mt-10 border bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Share your idea</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 rounded-full bg-emerald-50 p-1">
                <TabsTrigger value="bug" className="rounded-full">
                  Report a bug
                </TabsTrigger>
                <TabsTrigger value="feature" className="rounded-full">
                  Request a feature
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-6">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-700">
                  <p className="font-medium">{config.title}</p>
                  <p className="mt-2 text-emerald-600/90">{config.description}</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="feedback-title">Title</Label>
                    <Input
                      id="feedback-title"
                      placeholder="Short summary"
                      value={form.title}
                      onChange={handleChange("title")}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback-description">Details</Label>
                    <Textarea
                      id="feedback-description"
                      placeholder="Describe the issue or idea with enough detail to help us reproduce or scope it."
                      value={form.description}
                      onChange={handleChange("description")}
                      rows={6}
                      required
                    />
                    <p className="text-xs text-slate-500">Include reproduction steps, expected behaviour, or use cases.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="feedback-priority">Priority</Label>
                      <select
                        id="feedback-priority"
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        value={form.priority}
                        onChange={handleChange("priority")}
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                      <p className="text-xs text-slate-500">{config.priorityHint}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feedback-email">Contact email (optional)</Label>
                      <Input
                        id="feedback-email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.contact_email}
                        onChange={handleChange("contact_email")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback-name">Name (optional)</Label>
                    <Input
                      id="feedback-name"
                      placeholder="Used if we need to follow up"
                      value={form.contact_name}
                      onChange={handleChange("contact_name")}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      We log submissions immediately and review them during weekly triage.
                    </p>
                    <Button type="submit" disabled={submitting} className="rounded-full px-6">
                      {submitting ? "Submitting…" : "Send feedback"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mt-6 border bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>Bug reports enter our triage board where we reproduce the issue and prioritise a fix.</p>
            <p>
              Feature requests go through discovery sessions with facilitators to gauge impact. We update the status in the admin console and share highlights during community syncs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FeedbackPage;
