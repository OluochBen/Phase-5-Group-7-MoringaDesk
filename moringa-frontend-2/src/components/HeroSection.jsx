export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
      <div className="max-w-6xl mx-auto text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Welcome to MoringaDesk
        </h1>
        <p className="text-lg md:text-xl mb-8">
          A collaborative Q&A platform where students and mentors connect.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/register"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-gray-100"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="px-6 py-3 border border-white font-semibold rounded-lg hover:bg-white hover:text-blue-600"
          >
            Login
          </a>
        </div>
      </div>
    </section>
  );
}
