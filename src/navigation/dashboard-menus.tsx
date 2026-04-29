import { PATHS } from "@/navigation/paths";
import { House, BookOpen, Users } from "lucide-react";
import React from "react";

export interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
}

export const adminMenus: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <House />,
    path: PATHS.ADMIN_DASHBOARD,
  },
  {
    title: "Courses",
    icon: <BookOpen />,
    path: PATHS.ADMIN_COURSE_LIST,
  },
  {
    title: "Users",
    icon: <Users />,
    path: PATHS.ADMIN_USERS,
  },
  // {
  //   title: "Roles",
  //   icon: <Settings />,
  //   path: PATHS.ADMIN_ROLES,
  // },
  // {
  //   title: "Analytics",
  //   icon: <BarChart3 />,
  //   path: "/dashboard/admin/analytics",
  // },
  // {
  //   title: "Reports",
  //   icon: <FileText />,
  //   path: "/dashboard/admin/reports",
  // },
  // {
  //   title: "Settings",
  //   icon: <Settings />,
  //   path: "/dashboard/admin/settings",
  // },
];

export const instructorMenus: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <House />,
    path: PATHS.INSTRUCTOR_DASHBOARD,
  },
  {
    title: "My Courses",
    icon: <BookOpen />,
    path: PATHS.INSTRUCTOR_COURSE_LIST,
  },
  // {
  //   title: "Schedule",
  //   icon: <Calendar />,
  //   path: "/dashboard/instructor/schedule",
  // },
  // {
  //   title: "Messages",
  //   icon: <MessageSquare />,
  //   path: "/dashboard/instructor/messages",
  // },
  // {
  //   title: "Analytics",
  //   icon: <BarChart3 />,
  //   path: "/dashboard/instructor/analytics",
  // },
  // {
  //   title: "Settings",
  //   icon: <Settings />,
  //   path: "/dashboard/instructor/settings",
  // },
];
export const orgMenus: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <House />,
    path: PATHS.ORG_DASHBOARD,
  },

  {
    title: "Users",
    icon: <Users />,
    path: PATHS.ORG_USERS,
  },
];
