import React from "react";
import {
  Box,
  Button,
  Grid,
  Stack,
  Typography,
  Paper,
  useTheme,
} from "@mui/material";
import {
  Users,
  BookOpenCheck,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  DollarSign,
  Clock,
  FileText,
  UserCheck,
  UserX,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  AnalyticsCard,
  AnalyticsCardProps,
} from "@/components/shared/AnalyticsCard";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/navigation/paths";
import { TCoursePrviewDetails } from "@/types/course.types";
import { apiClient } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { AuthUser } from "@/types/auth.types";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
  } = useQuery({
    queryKey: ["adminCourses"],
    queryFn: async () =>
      await apiClient.get<TCoursePrviewDetails[]>("/main/v1/courses/"),
  });

  const {
    data: users = [],
    isLoading: usersLoading,
    isError: usersError,
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => apiClient.get<AuthUser[]>("/main/v1/user/all/"),
  });

  // Calculate course statistics
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(
    (c) => c.status === "PUBLISHED",
  ).length;
  const draftCourses = courses.filter(
    (c) => c.status === "DRAFT" || c.status === "draft",
  ).length;
  const featuredCourses = courses.filter((c) => c.isFeatured).length;
  const paidCourses = courses.filter((c) => c.isPaid).length;
  const freeCourses = courses.filter((c) => !c.isPaid).length;

  // Calculate user statistics
  const totalUsers = users.length;
  const instructors = users.filter((u) => u.role?.name === "INSTRUCTOR").length;
  const admins = users.filter((u) => u.role?.name === "ADMIN").length;
  const learners = users.filter((u) => u.role?.name === "USER").length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = users.filter((u) => !u.is_active).length;

  // Calculate expertise level distribution
  const expertiseLevels = courses.reduce(
    (acc: Record<string, number>, course) => {
      const level = course.expertise_level || "Unknown";
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    },
    {},
  );

  // Calculate total course progress (average)
  const totalProgress = courses.reduce(
    (sum, course) => sum + (course.course_progress || 0),
    0,
  );
  const averageProgress =
    totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;

  // Get unique instructors count
  // @ts-ignore
  const uniqueInstructors = new Set(courses.map((c) => c.instructor)).size;

  // Calculate content metrics
  const coursesWithModules = courses.filter(
    (c) => c.modules && c.modules.length > 0,
  ).length;
  const totalModules = courses.reduce(
    (sum, c) => sum + (c.modules?.length || 0),
    0,
  );
  const totalTopics = courses.reduce((sum, c) => {
    return (
      sum +
      (c.modules?.reduce(
        (modSum, mod) => modSum + (mod.topics?.length || 0),
        0,
      ) || 0)
    );
  }, 0);

  const statsData: AnalyticsCardProps[] = [
    {
      title: "Total Courses",
      value: totalCourses,
      subtitle: `${publishedCourses} published • ${draftCourses} draft`,
      icon: <BookOpen size={24} />,
      color: "primary",
      trend: { value: `+${totalCourses}`, isPositive: true },
    },
    {
      title: "Total Users",
      value: totalUsers,
      subtitle: `${instructors} instructors • ${learners} learners`,
      icon: <Users size={24} />,
      color: "success",
      trend: { value: `+${totalUsers}`, isPositive: true },
    },
    {
      title: "Active Users",
      value: activeUsers,
      subtitle: `${inactiveUsers} inactive`,
      icon: <UserCheck size={24} />,
      color: "primary",
      trend: {
        value: `${Math.round((activeUsers / totalUsers) * 100)}%`,
        isPositive: true,
      },
    },
    {
      title: "Instructors",
      value: instructors,
      subtitle: `${uniqueInstructors} unique course creators`,
      icon: <GraduationCap size={24} />,
      color: "secondary",
    },
  ];

  const courseStatsData: AnalyticsCardProps[] = [
    {
      title: "Featured Courses",
      value: featuredCourses,
      subtitle: `${Math.round((featuredCourses / totalCourses) * 100)}% of total`,
      icon: <Award size={24} />,
      color: "warning",
    },
    {
      title: "Paid Courses",
      value: paidCourses,
      subtitle: `${freeCourses} free courses available`,
      icon: <DollarSign size={24} />,
      color: "success",
    },
    {
      title: "Average Progress",
      value: `${averageProgress}%`,
      subtitle: "Course completion rate",
      icon: <TrendingUp size={24} />,
      color: "primary",
    },
    {
      title: "Content Overview",
      value: totalModules,
      subtitle: `${totalTopics} topics across ${coursesWithModules} courses`,
      icon: <FileText size={24} />,
      color: "secondary",
    },
  ];

  const expertiseStats = Object.entries(expertiseLevels).map(
    ([level, count]) => ({
      title: level,
      value: count,
      subtitle: `${Math.round((count / totalCourses) * 100)}% of courses`,
      icon: <BookOpenCheck size={24} />,
      color:
        level === "Beginner"
          ? "success"
          : level === "Intermediate"
            ? "warning"
            : level === "Advanced"
              ? "primary"
              : "secondary",
    }),
  );

  const isLoading = coursesLoading || usersLoading;
  const hasError = coursesError || usersError;

  if (hasError) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Failed to load dashboard data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please try refreshing the page
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={4} sx={{ mt: 1 }}>
      {/* Main Stats */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 800,
            color: "text.primary",
            letterSpacing: "-0.01em",
          }}
        >
          Platform Overview
        </Typography>
        <Grid container spacing={3}>
          {statsData.map((stat) => (
            <Grid item xs={12} sm={6} lg={3} key={stat.title}>
              <AnalyticsCard {...stat} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Course Stats */}
      <Box>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 800,
            color: "text.primary",
            letterSpacing: "-0.01em",
          }}
        >
          Course Analytics
        </Typography>
        <Grid container spacing={3}>
          {courseStatsData.map((stat) => (
            <Grid item xs={12} sm={6} lg={3} key={stat.title}>
              <AnalyticsCard {...stat} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
};
