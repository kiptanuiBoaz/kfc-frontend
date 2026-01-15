import { apiClient } from "@/api/apiClient";
import CourseCard from "@/components/CourseCard";
import { CustomContainer } from "@/components/shared/CustomContainer";
import { TCourse } from "@/types/course.types";
import {
  Box,
  Container,
  Grid,
  Typography,
  Skeleton,
  Paper,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useNavigate } from "react-router-dom";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

const FeaturedCourses = () => {
  const navigate = useNavigate();
  const {
    data: courses = [],
    isLoading,
    isError,
  } = useQuery<TCourse[]>({
    queryKey: ["adminCourses"],
    queryFn: () => apiClient.get<TCourse[]>("/main/v1/public/featured-courses"),
  });
  if (isLoading) {
    return (
      <CustomContainer>
        <Box>
          <Typography gutterBottom textAlign={"center"} variant="h3">
            Our Featured Courses
          </Typography>
          <Typography
            textAlign={"center"}
            variant="body1"
            color="text.secondary"
          >
            Discover popular courses designed to address critical needs and
            latest trends in fresh produce industry.
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box>
                  <Skeleton
                    variant="rectangular"
                    height={200}
                    sx={{ borderRadius: 2 }}
                  />
                  <Skeleton variant="text" sx={{ mt: 2 }} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </CustomContainer>
    );
  }

  if (courses.length === 0) {
    return (
      <CustomContainer>
        <Box sx={{ py: 8 }}>
          <Typography
            gutterBottom
            textAlign={"center"}
            variant="h3"
            sx={{ mt: 3 }}
          >
            Our Featured Courses
          </Typography>
          <Typography
            textAlign={"center"}
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Discover popular courses designed to address critical needs and
            latest trends in fresh produce industry.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              maxWidth: 500,
              mx: "auto",
              p: 6,
              textAlign: "center",
              backgroundColor: "grey.50",
              borderRadius: 3,
            }}
          >
            <SchoolOutlinedIcon
              sx={{
                fontSize: 80,
                color: "text.secondary",
                mb: 2,
              }}
            />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              No Courses Yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We're currently preparing exciting courses for you. Check back
              soon to discover our featured learning opportunities!
            </Typography>
          </Paper>
        </Box>
      </CustomContainer>
    );
  }

  return (
    <CustomContainer>
      <Box>
        <Typography
          gutterBottom
          textAlign={"center"}
          variant="h3"
          sx={{ mt: 3 }}
        >
          Our Featured Courses
        </Typography>
        <Typography textAlign={"center"} variant="body1" color="text.secondary">
          Discover popular corses designed to address critical needs and latest
          trentds in fresh produce industry.
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {courses.slice(0, 3).map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <CourseCard
                onAction={() => navigate(`/courses/preview/${course.guid}`)}
                course={course}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </CustomContainer>
  );
};

export default FeaturedCourses;
