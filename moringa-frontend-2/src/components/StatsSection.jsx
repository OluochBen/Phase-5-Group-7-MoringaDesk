export default function StatsSection() {
  const stats = [
    { label: "Questions Asked", value: 120 },
    { label: "Answers Given", value: 340 },
    { label: "Active Users", value: 75 },
    { label: "Topics Covered", value: 12 },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, index) => (
          <div key={index}>
            <p className="text-4xl font-bold text-blue-600">{stat.value}</p>
            <p className="mt-2 text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
