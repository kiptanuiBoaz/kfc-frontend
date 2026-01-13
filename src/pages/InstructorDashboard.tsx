import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import {
  TrendingUp,
  Star,
  BookOpen,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/navigation/paths";
import {
  AnalyticsCard,
  AnalyticsCardProps,
} from "@/components/shared/AnalyticsCard";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { TCourse } from "@/types/course.types";
import CourseCard from "@/components/CourseCard";

const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Dummy analytics data
  const analyticsData: AnalyticsCardProps[] = [
    {
      title: "Total Students",
      value: 247,
      subtitle: "Across all courses",
      icon: <Users size={24} />,
      color: "primary",
      trend: { value: "+12%", isPositive: true },
    },
    {
      title: "Active Courses",
      value: 8,
      subtitle: "Currently running",
      icon: <BookOpen size={24} />,
      color: "success",
      trend: { value: "+2", isPositive: true },
    },
    {
      title: "Average Rating",
      value: 4.8,
      subtitle: "Based on 156 reviews",
      icon: <Star size={24} />,
      color: "warning",
      trend: { value: "+0.3", isPositive: true },
    },
    {
      title: "Monthly Revenue",
      value: "$12,540",
      subtitle: "This month",
      icon: <DollarSign size={24} />,
      color: "info",
      trend: { value: "+18%", isPositive: true },
    },
    {
      title: "Course Completion",
      value: "87%",
      subtitle: "Average completion rate",
      icon: <TrendingUp size={24} />,
      color: "secondary",
      trend: { value: "+5%", isPositive: true },
    },
    {
      title: "Upcoming Sessions",
      value: 12,
      subtitle: "Next 7 days",
      icon: <Calendar size={24} />,
      color: "error",
    },
  ];

  const {
    data: instructorCourses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery<TCourse[]>({
    queryKey: ["instructorCourses"],
    queryFn: async () => apiClient.get("/main/v1/my-courses/"),
  });

  const handleViewAllCourses = () => {
    navigate(PATHS.INSTRUCTOR_COURSE_LIST);
  };

  const handleCourseAction = (course: TCourse) => {
    // Handle individual course action
    console.log("Course action:", course);
  };

  if (coursesLoading) {
    return <Typography>Loading courses...</Typography>;
  }

  return (
    <Stack spacing={4}>
      {/* Analytics Cards */}
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Analytics Overview
        </Typography>
        <Grid container spacing={3}>
          {analyticsData.map((data, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <AnalyticsCard {...data} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Course Preview Section */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Your Courses
          </Typography>
          <Button
            variant="contained"
            onClick={handleViewAllCourses}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            View All Courses
          </Button>
        </Box>
        <Grid container spacing={3}>
          {instructorCourses?.slice(0, 3).map((course, index) => (
            <Grid item xs={12} sm={6} lg={4} key={course.id || index}>
              <CourseCard course={course} onAction={handleCourseAction} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Quick Actions */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 3,
          background: alpha(theme.palette.primary.main, 0.03),
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              sx={{
                py: 2,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Create New Course
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              sx={{
                py: 2,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Schedule Session
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              sx={{
                py: 2,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              View Messages
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              sx={{
                py: 2,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
};
export default InstructorDashboard;
