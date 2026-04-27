import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DashboardLayout as DashboardLayoutWrapper } from "@/components/shared/DasboardLayout";
import {
  adminMenus,
  instructorMenus,
  orgMenus,
} from "@/navigation/dashboard-menus";
import { PATHS } from "@/navigation/paths";
import { useUser } from "@/hooks/useAuth";
import { isOrgRoute } from "@/utils/isOrgAdmin";

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const user = useUser();

  // Determine role and menu items based on current path
  const isAdminRoute = location.pathname.startsWith(
    PATHS.ADMIN_DASHBOARD.replace("/*", ""),
  );

  let userRole = "Instructor";
  let menuItems = instructorMenus;

  if (isAdminRoute) {
    userRole = "Admin";
    menuItems = adminMenus;
  }

  if (isOrgRoute(location.pathname)) {
    userRole = "Organization";
    const orgGuid = user?.organization?.guid || "";
    menuItems = orgMenus.map((item) => ({
      ...item,
      path: item.path.replace(":orgGuid", orgGuid),
    }));
  }

  return (
    <DashboardLayoutWrapper menuItems={menuItems} userRole={userRole}>
      <Outlet />
    </DashboardLayoutWrapper>
  );
};
