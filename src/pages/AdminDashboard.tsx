import React from "react";
import { Box, Button, Grid, Stack, Typography, Paper } from "@mui/material";
import { Users, BookOpenCheck, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  AnalyticsCard,
  AnalyticsCardProps,
} from "@/components/shared/AnalyticsCard";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/navigation/paths";
import { TCoursePrviewDetails } from "@/types/course.types";
import { apiClient } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";

const statsData: AnalyticsCardProps[] = [
  {
    title: "Active Instructors",
    value: 42,
    subtitle: "Verified creators",
    icon: <ShieldCheck size={24} />,
    color: "primary",
    trend: { value: "+6%", isPositive: true },
  },
  {
    title: "Pending Courses",
    value: 18,
    subtitle: "Awaiting approval",
    icon: <BookOpenCheck size={24} />,
    color: "warning",
    trend: { value: "-4", isPositive: true },
  },
  {
    title: "Total Learners",
    value: "5,203",
    subtitle: "Across the platform",
    icon: <Users size={24} />,
    color: "success",
    trend: { value: "+12%", isPositive: true },
  },
  {
    title: "Flagged Content",
    value: 3,
    subtitle: "Needs review",
    icon: <AlertTriangle size={24} />,
    color: "error",
  },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: courses = [],
    isLoading,
    isError,
  } = useQuery<TCoursePrviewDetails[]>({
    queryKey: ["adminCourses"],
    queryFn: async () => {
      const response = await apiClient.get<TCoursePrviewDetails[]>("/main/v1/courses/");
      return response || [];
    },
  });
  return (
    <Stack spacing={4} sx={{ mt: 1 }}>
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
          Platform Stats
        </Typography>
        <Grid container spacing={3}>
          {statsData.map((stat) => (
            <Grid item xs={12} sm={6} lg={3} key={stat.title}>
              <AnalyticsCard {...stat} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
};
