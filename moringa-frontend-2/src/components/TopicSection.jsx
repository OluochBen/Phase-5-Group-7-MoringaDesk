export default function TopicsSection() {
  const topics = ["React", "JavaScript", "Python", "SQL", "CSS", "Other"];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">Popular Topics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {topics.map((topic, index) => (
            <a
              key={index}
              href={`/questions?tag=${topic.toLowerCase()}`}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg hover:scale-105 transition text-blue-600 font-medium"
            >
              {topic}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
