import { Navigate, useLocation } from "react-router-dom";
import { FC, ReactNode } from "react";
import dir from "./dir";

import { useStore } from "@/Store/useStore";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useStore();
  // Replace this with your actual authentication logic

  if (location.pathname !== dir.login && !isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to={dir.login} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
