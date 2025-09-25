export default function FAQsPage() {
  const faqs = [
    { question: "What is MoringaDesk?", answer: "A Q&A platform for students." },
    { question: "How do I ask a question?", answer: "Go to the 'Ask Question' page and fill the form." },
    { question: "Is registration required?", answer: "Yes, you need to register to ask or answer questions." },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <ul className="space-y-4">
        {faqs.map((faq, index) => (
          <li key={index} className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold">{faq.question}</h2>
            <p className="mt-2 text-gray-700">{faq.answer}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
