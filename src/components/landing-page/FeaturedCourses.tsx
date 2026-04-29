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

const mockCourses: TCourse[] = [
  {
    id: 1,
    guid: "course-1",
    title: "Production & Farm Operations",
    description: "Master the essentials of modern farm management and sustainable production practices.",
    tags: ["Agriculture", "Production"],
    expertise_level: "Beginner",
    prerequisites: [],
    objectives: ["Understand soil health", "Learn irrigation techniques"],
    isPaid: true,
    amount: "5000",
    currency: "KES",
    isFeatured: true,
    status: "PUBLISHED",
    category: "Production & Farm Operations",
    instructor: 1,
    instructor_name: "Dr. Jane Smith",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    instructor_details: {
      guid: "inst-1",
      email: "jane@example.com",
      first_name: "Jane",
      last_name: "Smith",
      image: "https://i.pravatar.cc/150?u=jane"
    },
    created_by: null,
    updated_by: null,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 2,
    guid: "course-2",
    title: "Post-Harvest & Logistics",
    description: "Optimize your supply chain and reduce waste with advanced post-harvest handling.",
    tags: ["Logistics", "Quality"],
    expertise_level: "Intermediate",
    prerequisites: ["Course 1"],
    objectives: ["Cold chain management", "Export standards"],
    isPaid: true,
    amount: "7500",
    currency: "KES",
    isFeatured: true,
    status: "PUBLISHED",
    category: "Post-Harvest, Quality & Logistics",
    instructor: 2,
    instructor_name: "John Doe",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    instructor_details: {
      guid: "inst-2",
      email: "john@example.com",
      first_name: "John",
      last_name: "Doe",
      image: "https://i.pravatar.cc/150?u=john"
    },
    created_by: null,
    updated_by: null,
    deleted_at: null,
    deleted_by: null
  },
  {
    id: 3,
    guid: "course-3",
    title: "Compliance & ESG Standards",
    description: "Ensure your operations meet international export readiness and sustainability criteria.",
    tags: ["Compliance", "ESG"],
    expertise_level: "Advanced",
    prerequisites: [],
    objectives: ["Global GAP standards", "Environmental impact assessment"],
    isPaid: false,
    amount: null,
    currency: "KES",
    isFeatured: true,
    status: "PUBLISHED",
    category: "Compliance & ESG (Export Readiness)",
    instructor: 3,
    instructor_name: "Sarah Williams",
    image: "https://images.unsplash.com/photo-1454165833767-027ffea7025c?auto=format&fit=crop&q=80&w=800",
    instructor_details: {
      guid: "inst-3",
      email: "sarah@example.com",
      first_name: "Sarah",
      last_name: "Williams",
      image: "https://i.pravatar.cc/150?u=sarah"
    },
    created_by: null,
    updated_by: null,
    deleted_at: null,
    deleted_by: null
  }
];

const FeaturedCourses = () => {
  const navigate = useNavigate();
  const {
    data: courses = [],
    isLoading,
  } = useQuery<TCourse[]>({
    queryKey: ["public-featured-courses"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<TCourse[]>("/main/v1/public/featured-courses/");
        return response || mockCourses;
      } catch (error) {
        console.error("API failed, using mock data", error);
        return mockCourses;
      }
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <CustomContainer>
        <Box>
          <Typography
            color="primary"
            gutterBottom
            textAlign={"center"}
            variant="h3"
          >
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
      <Box sx={{ py: 5 }}>
        <Typography
          gutterBottom
          textAlign={"center"}
          variant="h3"
          sx={{ py: 3 }}
        >
          Our Featured Courses
        </Typography>
        <Typography textAlign={"center"} variant="body1" color="text.secondary">
          Discover popular courses designed to address critical needs and latest
          trends in fresh produce industry.
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
