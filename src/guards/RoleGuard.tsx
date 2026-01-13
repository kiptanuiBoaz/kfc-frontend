import React from "react";
import { useUser } from "@/hooks/useAuth";
import UnauthorizedPage from "@/pages/errors/UnauthorizedPage";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: string[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, requiredRoles }) => {
  const user = useUser();

  const userRole = user?.role?.name?.toLowerCase();

  if (!userRole || !requiredRoles.includes(userRole)) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};

export default RoleGuard;
