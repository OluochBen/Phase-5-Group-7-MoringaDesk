import { useEffect, useState } from "react";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/testimonials") // ✅ replace with your backend URL
      .then((res) => res.json())
      .then((data) => setTestimonials(data))
      .catch((err) => {
        console.error("Error fetching testimonials:", err);
      });
  }, []);

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">What Our Users Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.length > 0 ? (
            testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <p className="text-gray-600 italic">"{t.feedback}"</p>
                <p className="mt-4 font-semibold">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No testimonials yet...</p>
          )}
        </div>
      </div>
    </section>
  );
}
