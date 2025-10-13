import React from "react";

const sections = [
  {
    heading: "1. Acceptance of Terms",
    body: [
      "By creating an account on MoringaDesk, you agree to these Terms of Service. If you are using the platform on behalf of an organisation, you confirm that you have authority to accept these terms on its behalf.",
      "We may update these terms from time to time. If material changes occur, we will notify you through the platform or email. Continued use of the service after updates means you accept the revised terms.",
    ],
  },
  {
    heading: "2. Eligibility",
    body: [
      "You must be at least 16 years old or have permission from a parent/guardian to use MoringaDesk.",
      "Accounts are personal. You are responsible for safeguarding your password and not sharing access with others.",
    ],
  },
  {
    heading: "3. Your Responsibilities",
    body: [
      "Provide accurate information when registering and keep it updated.",
      "Use MoringaDesk for lawful purposes only. Do not post content that infringes intellectual property, harasses others, contains malware, or violates local regulations.",
      "Respect community moderation decisions—including edits, closures, or removals—and appeal respectfully when needed.",
    ],
  },
  {
    heading: "4. Intellectual Property",
    body: [
      "You retain ownership of the original content you post. By contributing, you grant MoringaDesk a non-exclusive, worldwide licence to display, distribute, and adapt your content for the purpose of running the platform.",
      "You are responsible for ensuring that any material you upload (text, images, code snippets) can be shared under these terms.",
    ],
  },
  {
    heading: "5. Platform Availability",
    body: [
      "We strive to keep the service running smoothly but cannot guarantee uninterrupted access. Planned maintenance or unexpected outages may occur.",
      "We may modify or discontinue features with reasonable notice when possible.",
    ],
  },
  {
    heading: "6. Termination",
    body: [
      "We may suspend or terminate your account if you violate these terms, the Code of Conduct, or applicable laws.",
      "You may request account deletion at any time by contacting support@moringadesk.com. Some aggregated or anonymised data may remain for analytics or compliance purposes.",
    ],
  },
  {
    heading: "7. Disclaimers",
    body: [
      "MoringaDesk is provided “as is”. While we work hard to curate accurate solutions, we do not guarantee the completeness or suitability of any answer shared on the platform.",
      "We are not liable for damages arising from your use of the service, to the extent permitted by law.",
    ],
  },
  {
    heading: "8. Contact",
    body: [
      "Questions about these Terms can be sent to legal@moringadesk.com.",
    ],
  },
];

export function TermsPage() {
  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-16 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        <section className="space-y-8 rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-100/40">
          {sections.map((item) => (
            <article key={item.heading} className="space-y-3">
              <h2 className="text-lg font-semibold text-emerald-700 sm:text-xl">{item.heading}</h2>
              {item.body.map((paragraph, idx) => (
                <p key={idx} className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </section>

        <footer className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6 text-sm text-slate-700">
          <p>
            By accessing or using MoringaDesk, you confirm that you have read and understood these Terms of Service and agree to be bound by them.
          </p>
          <p className="mt-2">
            If you have questions or require clarifications, please contact our legal team at
            <a href="mailto:hello@moringadesk.com" className="ml-1 font-semibold text-emerald-700 hover:underline">
              hello@moringadesk.com
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}

export default TermsPage;
