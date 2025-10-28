import React, { useState, useRef, useTransition } from "react";
import { useAuth } from "../contexts/AuthContext";
import AvatarUploader from "./AvatarUpload";

const SignUpForm = ({ onToggle }) => {
  const avatarInputRef = useRef(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(true);
  const { register } = useAuth();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e) => {
    e.preventDefault();

    const avatarFile = avatarInputRef.current.getFile();

    // Gọi API đăng ký
    startTransition(async () => {
      const { success, message } = await register(
        username,
        password,
        avatarFile
      );
      setSuccess(success);
      setMessage(message);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="bg-black/50 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md border border-white/10">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Join the Music
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col items-center"
        >
          <AvatarUploader ref={avatarInputRef} />
          <input
            type="text"
            tabIndex={0}
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="new-password"
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
            {isPending ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p className="text-gray-300 text-center mt-4">
          Already have an account?{" "}
          <button onClick={onToggle} className="text-green-500 hover:underline">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
