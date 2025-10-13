import React from "react";

const guidelines = [
  {
    title: "Be respectful and inclusive",
    details: [
      "Treat every learner, mentor, and alumni with courtesy. Offensive language, harassment, or discrimination based on gender, race, religion, or any protected characteristic is not tolerated.",
      "Assume good intent. If a contribution seems unclear, ask for clarification before criticising.",
    ],
  },
  {
    title: "Keep discussions constructive",
    details: [
      "Focus feedback on the idea or solution—not on the person sharing it.",
      "Use downvotes sparingly and provide context so authors can learn and improve.",
    ],
  },
  {
    title: "Share responsibly",
    details: [
      "Cite sources or credit collaborators when sharing content from external references.",
      "Do not post sensitive personal information (yours or others’) or proprietary client data.",
    ],
  },
  {
    title: "Support academic integrity",
    details: [
      "Offer hints and guidance rather than complete solutions for graded assignments unless instructors permit full answers.",
      "Report suspected plagiarism or abuse using the “Report” feature so moderators can review quickly.",
    ],
  },
  {
    title: "Moderation and enforcement",
    details: [
      "Moderators may edit, hide, or delete content that violates these guidelines.",
      "Repeated or severe violations can lead to temporary suspensions or permanent removal from MoringaDesk.",
    ],
  },
];

export function CodeOfConductPage() {
  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 py-16 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Community Code of Conduct</h1>
          <p className="mt-3 text-sm text-slate-500">
            We’re building a welcoming space for Moringa learners to ask, answer, and grow together.
          </p>
        </header>

        <section className="space-y-8 rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-100/40">
          {guidelines.map((item) => (
            <article key={item.title} className="space-y-3">
              <h2 className="text-lg font-semibold text-emerald-700 sm:text-xl">{item.title}</h2>
              <ul className="ml-4 list-disc space-y-2 text-sm text-slate-600 sm:text-base">
                {item.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <footer className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6 text-sm text-slate-700">
          <p>
            If you believe someone is violating this Code of Conduct, please report it via the in-product report feature or email
            <a href="mailto:hello@moringadesk.com" className="mx-1 font-semibold text-emerald-600 hover:underline">
              hello@moringadesk.com
            </a>
            so we can investigate promptly.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default CodeOfConductPage;
