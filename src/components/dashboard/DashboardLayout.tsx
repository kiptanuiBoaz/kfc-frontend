import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DashboardLayout as DashboardLayoutWrapper } from "@/components/shared/DasboardLayout";
import { adminMenus, instructorMenus } from "@/navigation/dashboard-menus";
import { PATHS } from "@/navigation/paths";

export const DashboardLayout: React.FC = () => {
  const location = useLocation();

  // Determine role and menu items based on current path
  const isAdminRoute = location.pathname.startsWith(PATHS.ADMIN_DASHBOARD.replace('/*', ''));
  const userRole = isAdminRoute ? "Admin" : "Instructor";
  const menuItems = isAdminRoute ? adminMenus : instructorMenus;

  return (
    <DashboardLayoutWrapper menuItems={menuItems} userRole={userRole}>
      <Outlet />
    </DashboardLayoutWrapper>
  );
};
