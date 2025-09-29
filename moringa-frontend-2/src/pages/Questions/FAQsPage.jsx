export default function FAQsPage() {
  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "Go to the login page and click on 'Forgot Password'.",
    },
    {
      question: "Can I edit my question?",
      answer: "Yes, go to your question and click 'Edit'.",
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-600">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border p-4 rounded-lg">
              <h3 className="font-semibold text-green-700 mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
