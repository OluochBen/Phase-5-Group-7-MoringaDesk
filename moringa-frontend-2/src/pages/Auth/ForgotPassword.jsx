import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const handleReset = () => {
    alert("Password reset instructions have been sent to your email.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-700">Reset Password</h1>
          <p className="text-gray-500 text-sm">
            Enter your email and we’ll send you instructions to reset it.
          </p>
        </div>

        {/* Reset Form */}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleReset();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 transition"
          >
            Send Reset Link
          </button>
        </form>

        <div className="text-center text-sm">
          <Link to="/login" className="text-green-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
