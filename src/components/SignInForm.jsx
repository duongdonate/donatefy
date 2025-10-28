import React, { useState, useTransition } from "react";
import { useAuth } from "../contexts/AuthContext";

const SignInForm = ({ onToggle }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(true);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    startTransition(async () => {
      const { success, message } = await login(username, password);
      setSuccess(success);
      setMessage(message);
    });
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="bg-black/50 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md border border-white/10">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Welcome Back
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col items-center"
        >
          <input
            type="text"
            placeholder="Username"
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          {message && success ? (
            <p className="text-green-400 text-sm">{message}</p>
          ) : (
            <p className="text-red-400 text-sm">{message}</p>
          )}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isPending ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <p className="text-gray-300 text-center mt-4">
          Don't have an account?{" "}
          <button onClick={onToggle} className="text-green-500 hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;
