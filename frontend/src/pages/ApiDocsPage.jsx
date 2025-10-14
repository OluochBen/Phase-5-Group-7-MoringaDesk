import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const sections = [
  {
    title: "Authentication",
    description: "JWT-based authentication for login, registration, and profile introspection.",
    endpoints: [
      { method: "POST", path: "/auth/register", summary: "Create a new user account." },
      { method: "POST", path: "/auth/login", summary: "Obtain an access token." },
      { method: "GET", path: "/auth/me", summary: "Fetch current user details." },
      { method: "POST", path: "/auth/oauth/<provider>", summary: "Kick off social login." },
    ],
  },
  {
    title: "Q&A",
    description: "Core endpoints for questions, solutions, and votes.",
    endpoints: [
      { method: "GET", path: "/problems", summary: "List questions with pagination." },
      { method: "POST", path: "/problems", summary: "Create a new question." },
      { method: "GET", path: "/problems/<id>", summary: "Retrieve a single question." },
      { method: "POST", path: "/problems/<id>/solutions", summary: "Add a solution." },
      { method: "POST", path: "/solutions/<id>/vote", summary: "Vote on a solution." },
    ],
  },
  {
    title: "FAQ",
    description: "Frequently asked questions curated by facilitators and the community.",
    endpoints: [
      { method: "GET", path: "/faqs", summary: "List FAQs with search and filtering." },
      { method: "GET", path: "/faqs/stats", summary: "Aggregate FAQ statistics." },
      { method: "POST", path: "/faqs", summary: "Create an FAQ (admin)." },
      { method: "PUT", path: "/faqs/<id>", summary: "Update an FAQ (admin)." },
    ],
  },
  {
    title: "Blog",
    description: "Community stories, product updates, and facilitator spotlights.",
    endpoints: [
      { method: "GET", path: "/blog/posts", summary: "List published blog posts." },
      { method: "GET", path: "/blog/posts/<slug>", summary: "Retrieve a blog post by slug." },
      { method: "POST", path: "/blog/posts", summary: "Create a blog post (admin)." },
      { method: "PUT", path: "/blog/posts/<id>", summary: "Update a blog post (admin)." },
    ],
  },
  {
    title: "Public",
    description: "Utility endpoints available without authentication.",
    endpoints: [
      { method: "GET", path: "/ping", summary: "Health check." },
      { method: "GET", path: "/stats", summary: "Landing page metrics." },
      { method: "POST", path: "/subscribe", summary: "Subscribe to updates." },
      { method: "GET", path: "/status", summary: "System status overview." },
    ],
  },
];

const METHOD_COLORS = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-emerald-100 text-emerald-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-rose-100 text-rose-700",
};

export function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-green-50/30 pb-16 pt-24">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6 lg:px-8">
        <header className="text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">API reference</Badge>
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
            MoringaDesk REST API documentation
          </h1>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Use these endpoints to integrate dashboards, automation scripts, or custom bots with
            the Q&A platform.
          </p>
        </header>

        <section className="mt-10 grid gap-6">
          {sections.map((section) => (
            <Card key={section.title} className="border bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">{section.title}</CardTitle>
                <p className="text-sm text-slate-600">{section.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.endpoints.map((endpoint) => (
                  <div
                    key={`${endpoint.method}-${endpoint.path}`}
                    className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex min-w-[68px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                          METHOD_COLORS[endpoint.method] || METHOD_COLORS.GET
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="text-xs md:text-sm">{endpoint.path}</code>
                    </div>
                    <p className="text-xs md:text-sm text-slate-500 md:text-right">
                      {endpoint.summary}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-8">
          <Card className="border bg-white">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Authentication & headers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>
                All protected endpoints require the `Authorization: Bearer &lt;token&gt;` header. Tokens
                are obtained via `/auth/login` or the social login callback.
              </p>
              <p>
                The API speaks JSON exclusively. Include `Content-Type: application/json` on POST
                and PUT requests.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

export default ApiDocsPage;
