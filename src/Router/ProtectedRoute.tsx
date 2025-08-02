import { Navigate, useLocation } from "react-router-dom";
import { FC, ReactNode } from "react";

import { useAccessControl } from "@/utils/accessControl";
import { useStore } from "@/Store/useStore";
import { Loading } from "@/components";
import dir from "./dir";

interface ProtectedRouteProps {
  requiredPermissions?: string[];
  requireAnyPermission?: boolean;
  requiredMainAccess?: string[];
  fallbackPath?: string;
  children: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({
  requireAnyPermission = false,
  fallbackPath = dir.vehicles,
  requiredPermissions = [],
  requiredMainAccess = [],
  children,
}) => {
  const location = useLocation();
  const { hasMainAccess, hasAnyAccess, hasMultipleAccess } = useAccessControl();
  const isAccessesLoaded = useStore((state) => state.isAccessesLoaded);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  // اگر authenticated است اما userAccesses هنوز لود نشده، Loading نمایش بده
  if (
    isAuthenticated &&
    !isAccessesLoaded &&
    (requiredPermissions.length > 0 || requiredMainAccess.length > 0)
  ) {
    return <Loading />;
  }

  // بررسی دسترسی‌های اصلی
  const hasRequiredMainAccess =
    requiredMainAccess.length > 0
      ? requireAnyPermission
        ? requiredMainAccess.some((accessId) => hasMainAccess(accessId))
        : requiredMainAccess.every((accessId) => hasMainAccess(accessId))
      : true;

  // بررسی دسترسی‌های عملیاتی
  const hasRequiredPermissions =
    requiredPermissions.length > 0
      ? requireAnyPermission
        ? hasAnyAccess(requiredPermissions)
        : hasMultipleAccess(requiredPermissions)
      : true;

  // اگر هیچ دسترسی لازم نیست، اجازه دسترسی بده
  if (requiredPermissions.length === 0 && requiredMainAccess.length === 0) {
    return <>{children}</>;
  }

  // بررسی دسترسی کلی
  const hasAllRequiredAccess = hasRequiredMainAccess && hasRequiredPermissions;

  if (!hasAllRequiredAccess) {
    // Redirect به صفحه عدم دسترسی یا fallback
    return (
      <Navigate
        to="/access-denied"
        state={{ from: location.pathname, fallback: fallbackPath }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
