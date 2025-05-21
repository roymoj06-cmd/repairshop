import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { useStore } from "@/Store/useStore";
import { LoginForm } from "@/components";

const Login = () => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return <LoginForm />;
};

export default Login;
