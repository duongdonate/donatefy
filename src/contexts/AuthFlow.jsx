import React, { useState } from "react";
import SignInForm from "../components/SignInForm";
import SignUpForm from "../components/SignUpForm";

const AuthFlow = () => {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <SignInForm onToggle={() => setIsLogin(false)} />
  ) : (
    <SignUpForm onToggle={() => setIsLogin(true)} />
  );
};

export default AuthFlow;
