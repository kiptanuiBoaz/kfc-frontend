import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing-page/Footer";
import ExtendedCourseCard from "@/components/ExtendedCourseCard";
import ServerPagination from "@/components/pagination/ServerPagination";
import { COURSES, Course } from "@/constants/courses";
import { useServerPagination } from "@/hooks/useServerPagination";
import { TCourse, TEnrolledCourse } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { CustomContainer } from "@/components/shared/CustomContainer";
import { isCourseEnrolled } from "@/utils/isCourseEnrolled";
import { useIsAuthenticated, useUser } from "@/hooks/useAuth";
import { useMyCourses } from "@/hooks/useMyCourses";
import LoadingPage from "@/components/shared/LoadingPage";

const defaultOptionValue = "all";

type FilterState = {
  search: string;
  tag: string;
  level: string;
  instructor: string;
};

const BrowseCoursesPage: React.FC = () => {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    tag: defaultOptionValue,
    level: defaultOptionValue,
    instructor: defaultOptionValue,
  });

  const { data: myCourses = [] } = useMyCourses();

  const {
    data: courses = [],
    isLoading,
    isError,
  } = useQuery<TCourse[]>({
    queryKey: ["adminCourses"],
    queryFn: () => apiClient.get<TCourse[]>("/main/v1/public/courses/"),
    select: (data) =>
      [...data].sort((a, b) => {
        const aDate = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bDate = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return bDate - aDate;
      }),
  });

  const tags = React.useMemo(
    () => [
      { value: defaultOptionValue, label: "All Tags" },
      ...Array.from(
        new Set(courses.flatMap((course) => course.tags || []))
      ).map((tag) => ({ value: tag, label: tag })),
    ],
    [courses]
  );

  const levels = React.useMemo(
    () => [
      { value: defaultOptionValue, label: "All Levels" },
      ...Array.from(
        new Set(courses.map((course) => course.expertise_level))
      ).map((level) => ({ value: level, label: level })),
    ],
    [courses]
  );

  const instructors = React.useMemo(
    () => [
      { value: defaultOptionValue, label: "All Instructors" },
      ...Array.from(
        new Set(courses.map((course) => `${course.instructor_name}`))
      ).map((instructor) => ({ value: instructor, label: instructor })),
    ],
    [courses]
  );

  const filteredCourses = React.useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        searchTerm.length === 0 ||
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm);

      const matchesTag =
        filters.tag === defaultOptionValue ||
        course.tags?.includes(filters.tag);

      const matchesLevel =
        filters.level === defaultOptionValue ||
        course.expertise_level === filters.level;

      const matchesInstructor =
        filters.instructor === defaultOptionValue ||
        `${course.instructor_name}` === filters.instructor;

      return matchesSearch && matchesTag && matchesLevel && matchesInstructor;
    });
  }, [filters, courses]);

  // const { page, pageCount, pageData, isLoading, goToPage } =
  //   useServerPagination<Course>({ data: filteredCourses, pageSize: 8 });

  const handleFilterChange = (name: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      tag: defaultOptionValue,
      level: defaultOptionValue,
      instructor: defaultOptionValue,
    });
  };

  return (
    <CustomContainer>
      <Stack spacing={{ xs: 1.5, md: 2 }}>
        <Stack spacing={1.5} textAlign={{ xs: "center", md: "left" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.6rem", sm: "2.2rem", md: "2.5rem" },
            }}
          >
            Browse Courses
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
          >
            Filter by category, level, or instructor to find the perfect course
            for your learning goals.
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <TextField
              fullWidth
              placeholder="Search courses by keyword..."
              type="search"
              value={filters.search}
              onChange={(event) =>
                handleFilterChange("search", event.target.value)
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={2}>
            <TextField
              fullWidth
              select
              value={filters.tag}
              onChange={(event) =>
                handleFilterChange("tag", event.target.value)
              }
              slotProps={{
                select: {
                  displayEmpty: true,
                  renderValue: (value) =>
                    tags.find((option) => option.value === value)?.label ??
                    "All",
                },
              }}
              sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
            >
              {tags.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={2}>
            <TextField
              fullWidth
              select
              value={filters.level}
              onChange={(event) =>
                handleFilterChange("level", event.target.value)
              }
              slotProps={{
                select: {
                  displayEmpty: true,
                  renderValue: (value) =>
                    levels.find((option) => option.value === value)?.label ??
                    "All Levels",
                },
              }}
              sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
            >
              {levels.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={2}>
            <TextField
              fullWidth
              select
              value={filters.instructor}
              onChange={(event) =>
                handleFilterChange("instructor", event.target.value)
              }
              slotProps={{
                select: {
                  displayEmpty: true,
                  renderValue: (value) =>
                    instructors.find((option) => option.value === value)
                      ?.label ?? "All Instructors",
                },
              }}
              sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
            >
              {instructors.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {isLoading ? (
          <LoadingPage message="Loading Courses..." />
        ) : (
          <React.Fragment>
            {filteredCourses.length === 0 ? (
              <Stack alignItems="center" sx={{ py: 6 }} spacing={2}>
                <Typography variant="body1" color="text.secondary">
                  No courses match your filters. Try adjusting the search or
                  filter criteria.
                </Typography>
                <Button variant="outlined" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </Stack>
            ) : (
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {filteredCourses.map((course: TCourse) => {
                  const enrolled = isAuthenticated
                    ? isCourseEnrolled(myCourses, course.guid)
                    : false;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={course.id}>
                      <ExtendedCourseCard
                        isEnrolled={enrolled}
                        // @ts-ignore
                        course={course as TEnrolledCourse}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </React.Fragment>
        )}
      </Stack>
    </CustomContainer>
  );
};

export default BrowseCoursesPage;
