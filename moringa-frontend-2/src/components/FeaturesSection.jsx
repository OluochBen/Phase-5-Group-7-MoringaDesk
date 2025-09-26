export default function FeaturesSection() {
  const features = [
    {
      title: "Ask Questions",
      desc: "Post your questions and get answers from peers and mentors.",
    },
    {
      title: "Vote Answers",
      desc: "Upvote the most helpful answers to highlight quality content.",
    },
    {
      title: "Engage Community",
      desc: "Join discussions and collaborate with other students.",
    },
  ];

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">Why Use MoringaDesk?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
