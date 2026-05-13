import React, { lazy } from "react";
import LazyPage from "@/components/shared/LazyPage";
import { PATHS } from "./paths";
import AuthGuard from "@/guards/AuthGuard";
import RoleGuard from "@/guards/RoleGuard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Outlet } from "react-router-dom";
import MemberSignUpPage from "@/pages/auth/MemberSignUp";
import UserSignUpPage from "@/pages/auth/UserSignUpPage";
const OrgRegistrationPage = lazy(() => import("@/pages/OrgRegistrationPage"));

// Lazy imports
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const BrowseCoursesPage = lazy(() => import("@/pages/BrowseCoursesPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const SignUpPage = lazy(() => import("@/pages/auth/UserSignUpPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const ResetPasswordConfirmPage = lazy(
  () => import("@/pages/ResetPasswordConfirmPage"),
);
const InstructorDashboard = lazy(() => import("@/pages/InstructorDashboard"));
const InstructorCourses = lazy(
  () => import("@/pages/instructor/InstructorCourses"),
);
const AdminDashboard = lazy(() =>
  import("@/pages/AdminDashboard").then((module) => ({
    default: module.AdminDashboard,
  })),
);
const AdminCoursesPage = lazy(() =>
  import("@/pages/admin/AdminCoursesPage").then((module) => ({
    default: module.AdminCoursesPage,
  })),
);
const InstructorCourseDetailsPage = lazy(
  () => import("@/pages/instructor/InstructorCourseDetailsPage"),
);
const CoursePreviewPage = lazy(() =>
  import("@/pages/CoursePreviewPage").then((module) => ({
    default: module.CoursePreviewPage,
  })),
);
const EnrollCourse = lazy(() =>
  import("@/pages/EnrollCourse").then((module) => ({
    default: module.EnrollCourse,
  })),
);
const MyCoursesPage = lazy(() => import("@/pages/MyCoursesPage"));
const NotFoundPage = lazy(() => import("@/pages/errors/NotFoundPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminRolesPage = lazy(() =>
  import("@/pages/admin/AdminRolesPage").then((module) => ({
    default: module.AdminRolesPage,
  })),
);
const QuizManagementPage = lazy(() =>
  import("@/pages/instructor/QuizManagementPage").then((module) => ({
    default: module.QuizManagementPage,
  })),
);
const TakeCoursePage = lazy(() => import("@/pages/user/TakeCoursePage"));
const TakeQuizPage = lazy(() => import("@/pages/user/TakeQuizPage"));
const BlankDashboardPage = lazy(() => import("@/pages/dashboard/BlankDashboardPage"));
const OrgUsers = lazy(() => import("@/pages/org/OrgUsers"));
const OrgHome = lazy(() => import("@/pages/org/Home"));

export const routes = [
  {
    path: PATHS.HOME,
    element: <LazyPage component={LandingPage} />,
  },
  {
    path: PATHS.COURSES,
    element: <LazyPage component={BrowseCoursesPage} />,
  },
  {
    path: PATHS.MY_COURSES,
    element: (
      <AuthGuard>
        <LazyPage component={MyCoursesPage} />
      </AuthGuard>
    ),
  },
  {
    path: PATHS.LOGIN,
    element: <LazyPage component={LoginPage} />,
  },
  {
    path: PATHS.MEMBER_SIGN_UP,
    element: <LazyPage component={MemberSignUpPage} />,
  },
  {
    path: PATHS.USER_SIGN_UP,
    element: <LazyPage component={UserSignUpPage} />,
  },
  {
    path: PATHS.RESET_PASSWORD,
    element: <LazyPage component={ResetPasswordPage} />,
  },
  {
    path: PATHS.ORG_REGISTRATION,
    element: <LazyPage component={OrgRegistrationPage} />,
  },
  {
    path: PATHS.RESET_PASSWORD_CONFIRM,
    element: <LazyPage component={ResetPasswordConfirmPage} />,
  },
  {
    path: PATHS.TAKE_COURSE_PAGE,
    element: (
      // <AuthGuard>
      <LazyPage component={TakeCoursePage} />
      // </AuthGuard>
    ),
  },
  {
    path: PATHS.TAKE_QUIZ_PAGE,
    element: (
      <AuthGuard>
        <LazyPage component={TakeQuizPage} />
      </AuthGuard>
    ),
  },
  {
    path: `${PATHS.INSTRUCTOR_DASHBOARD}*`,
    element: (
      <AuthGuard>
        <RoleGuard requiredRoles={["instructor"]}>
          <Outlet />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      {
        path: "",
        element: <LazyPage component={InstructorDashboard} />,
      },
      {
        path: "courses",
        element: <LazyPage component={InstructorCourses} />,
      },
      {
        path: "courses/:courseGuid",
        element: <LazyPage component={InstructorCourseDetailsPage} />,
      },
      {
        path: "courses/:courseGuid/quizzes/:quizGuid",
        element: <LazyPage component={QuizManagementPage} />,
      },
    ],
  },
  {
    path: `${PATHS.ADMIN_DASHBOARD}*`,
    element: (
      <AuthGuard>
        <RoleGuard requiredRoles={["admin"]}>
          <DashboardLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      {
        path: "",
        element: <LazyPage component={AdminDashboard} />,
      },
      {
        path: "courses",
        element: <LazyPage component={AdminCoursesPage} />,
      },
      {
        path: "users",
        element: <LazyPage component={AdminUsersPage} />,
      },
      {
        path: "roles",
        element: <LazyPage component={AdminRolesPage} />,
      },
    ],
  },
  {
    path: `${PATHS.ORG_DASHBOARD}*`,
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "",
        element: <LazyPage component={OrgHome} />,
      },
      {
        path: "courses",
        element: (
          <LazyPage
            component={BlankDashboardPage}
            componentProps={{ title: "Courses" }}
          />
        ),
      },
      {
        path: "users",
        element: <LazyPage component={OrgUsers} />,
      },
    ],
  },
  {
    path: PATHS.INSTRUCTOR_QUIZZES,
    element: (
      <AuthGuard>
        <RoleGuard requiredRoles={["instructor"]}>
          <LazyPage component={QuizManagementPage} />
        </RoleGuard>
      </AuthGuard>
    ),
  },
  {
    path: PATHS.COURSE_PREVIEW,
    element: <LazyPage component={CoursePreviewPage} />,
  },
  {
    path: PATHS.COURSE_ENROLL,
    element: (
      <AuthGuard>
        <LazyPage component={EnrollCourse} />
      </AuthGuard>
    ),
  },
  {
    path: "*",
    element: <LazyPage component={NotFoundPage} />,
  },
];
