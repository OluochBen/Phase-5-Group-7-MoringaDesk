import React from "react";

const sections = [
  {
    heading: "Information We Collect",
    list: [
      "Account details such as name, email address, and password (hashed).",
      "Profile information that you choose to share on MoringaDesk.",
      "Usage data including pages viewed, search queries, device information, and approximate location based on IP address.",
      "Content you submit, such as questions, answers, comments, and attachments.",
    ],
  },
  {
    heading: "How We Use Your Information",
    list: [
      "Provide, maintain, and improve the MoringaDesk platform.",
      "Send notifications about updates to your posts, password reset emails, and service announcements.",
      "Monitor usage, prevent abuse, and enhance security.",
      "Generate anonymised analytics to improve curriculum support for Moringa School cohorts.",
      "Comply with legal obligations and enforce our Terms of Service.",
    ],
  },
  {
    heading: "Sharing of Information",
    body: [
      "We do not sell your personal data. We share information only in the following scenarios:",
    ],
    list: [
      "With service providers who support hosting, analytics, and email delivery (bound by confidentiality agreements).",
      "With Moringa School staff and approved facilitators to deliver cohort support.",
      "When required by law, such as responding to subpoenas or protecting user safety.",
    ],
  },
  {
    heading: "Cookies & Tracking",
    body: [
      "MoringaDesk uses cookies and similar technologies to keep you signed in, remember preferences, and measure performance. You can adjust cookie settings in your browser, but some features may not function properly if cookies are disabled.",
    ],
  },
  {
    heading: "Data Retention",
    body: [
      "We retain account data while your profile is active. You may request deletion at any time; certain information may remain in backup copies or aggregated reports for compliance, security, or academic research purposes.",
    ],
  },
  {
    heading: "Your Rights",
    list: [
      "Access, correct, or delete your personal data by contacting support@moringadesk.com.",
      "Opt out of email notifications via settings or the unsubscribe link.",
      "Request a copy of your data in a portable format.",
    ],
  },
  {
    heading: "International Data Transfers",
    body: [
      "MoringaDesk processes data in Kenya. If data is transferred outside your region, we implement appropriate safeguards in line with applicable regulations.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "For privacy-related questions or requests, email privacy@moringadesk.com.",
    ],
  },
];

export function PrivacyPolicyPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-16 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
        </header>

        <section className="space-y-8 rounded-3xl border border-blue-100 bg-white p-8 shadow-xl shadow-blue-100/40">
          {sections.map((section) => (
            <article key={section.heading} className="space-y-3">
              <h2 className="text-lg font-semibold text-blue-700 sm:text-xl">{section.heading}</h2>
              {section.body &&
                section.body.map((paragraph, idx) => (
                  <p key={idx} className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    {paragraph}
                  </p>
                ))}
              {section.list && (
                <ul className="ml-4 list-disc space-y-2 text-sm text-slate-600 sm:text-base">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>

        <footer className="rounded-3xl border border-blue-100 bg-blue-50/60 p-6 text-sm text-slate-700">
          <p>
            MoringaDesk respects your privacy and is committed to protecting your personal information. If you have concerns or need assistance exercising your rights, contact
            <a href="mailto:hello@moringadesk.com" className="ml-1 font-semibold text-blue-600 hover:underline">
              hello@moringadesk.com
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
