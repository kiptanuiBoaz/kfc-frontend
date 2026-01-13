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
    queryFn: () => apiClient.get<TCoursePrviewDetails[]>("/main/v1/courses/"),
  });
  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
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
      {/* 
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: (theme) => `1px dashed ${theme.palette.divider}`,
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(PATHS.ADMIN_COURSE_LIST)}
            >
              Review Courses
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button variant="outlined" fullWidth>
              Invite Instructor
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button variant="outlined" fullWidth>
              View Reports
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button variant="outlined" fullWidth>
              System Settings
            </Button>
          </Grid>
        </Grid>
      </Paper> */}
    </Stack>
  );
};
