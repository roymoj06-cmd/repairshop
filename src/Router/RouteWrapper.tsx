import { getRouteConfig } from "@/config/routes";
import ProtectedRoute from "./ProtectedRoute";
import { FC, ReactNode } from "react";

interface RouteWrapperProps {
  children: ReactNode;
  path: string;
}

/**
 * کامپوننت کمکی برای wrap کردن مسیرها با ProtectedRoute
 * بر اساس تنظیمات تعریف شده در routes.ts
 */
const RouteWrapper: FC<RouteWrapperProps> = ({ path, children }) => {
  const routeConfig = getRouteConfig(path);

  // اگر هیچ تنظیم دسترسی تعریف نشده، مسیر آزاد است
  if (!routeConfig?.requiredMainAccess && !routeConfig?.requiredPermissions) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute
      requiredMainAccess={routeConfig.requiredMainAccess}
      requiredPermissions={routeConfig.requiredPermissions}
      requireAnyPermission={routeConfig.requireAnyPermission}
    >
      {children}
    </ProtectedRoute>
  );
};

export default RouteWrapper;
