import React from "react";

const sections = [
  {
    title: "How to ask effective questions",
    list: [
      "Search first to see if a similar question has been answered.",
      "Provide enough context—describe the goal, what you tried, and where you got stuck.",
      "Share minimal reproducible examples when dealing with code (input, expected output, error messages).",
      "Use relevant tags so the right mentors and peers can find your post quickly.",
    ],
  },
  {
    title: "How to write high-quality answers",
    list: [
      "Address the original question directly before adding optional commentary.",
      "Explain the reasoning behind your solution so learners can internalise the concept.",
      "Format code blocks using backticks and highlight any assumptions or prerequisites.",
      "Cite articles, documentation, or class resources when referencing external knowledge.",
    ],
  },
  {
    title: "Voting and feedback",
    list: [
      "Upvote questions and answers that are clear, helpful, and follow the guidelines.",
      "Downvote constructively—pair it with a comment to help the author improve.",
      "Mark accepted answers once your issue is resolved to help others with similar challenges.",
    ],
  },
  {
    title: "Working with moderators",
    list: [
      "Moderators may edit titles, tags, and formatting to keep content discoverable.",
      "If your post is closed or flagged, review the moderator note and update the content before reposting.",
      "Use the report feature if you encounter spam, abuse, or content that violates the Code of Conduct.",
    ],
  },
  {
    title: "Staying organised as a cohort",
    list: [
      "Create collections or saved searches for frequently used resources.",
      "Use the “follow” feature to receive updates on important cohort threads.",
      "Encourage peers to document project learnings and tag them clearly for future cohorts.",
    ],
  },
];

export function CommunityGuidelinesPage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-16 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">MoringaDesk Community Guidelines</h1>
          <p className="mt-3 text-sm text-slate-500">
            Practical tips for keeping discussions focused, friendly, and useful to every learner.
          </p>
        </header>

        <section className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
          {sections.map((section) => (
            <article key={section.title} className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">{section.title}</h2>
              <ul className="ml-4 list-disc space-y-2 text-sm text-slate-600 sm:text-base">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <footer className="rounded-3xl border border-slate-200 bg-slate-100/60 p-6 text-sm text-slate-700">
          <p>
            These guidelines evolve with our community. Share your suggestions with the moderation team at
            <a href="mailto:hello@moringadesk.com" className="ml-1 font-semibold text-emerald-600 hover:underline">
              hello@moringadesk.com
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}

export default CommunityGuidelinesPage;
