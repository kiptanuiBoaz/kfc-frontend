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
  Tabs,
  Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExtendedCourseCard from "@/components/ExtendedCourseCard";
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
  learningMode: string;
  level: string;
  instructor: string;
};

const TAB_ALL = 0;
const TAB_LIKED = 1;
const TAB_SAVED = 2;

const BrowseCoursesPage: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    learningMode: defaultOptionValue,
    level: defaultOptionValue,
    instructor: defaultOptionValue,
  });
  // If not authenticated, force tab to TAB_ALL and prevent switching
  const [tab, setTab] = React.useState<number>(0);

  const { data: myCourses = [] } = useMyCourses();

  const {
    data: courses = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<TCourse[]>({
    queryKey: ["public-courses"],
    queryFn: () => apiClient.get<TCourse[]>("/main/v1/public/courses/"),
    select: (data) =>
      [...data].sort((a, b) => {
        const aDate = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bDate = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return bDate - aDate;
      }),
  });

  const learningModes = React.useMemo(
    () => [
      { value: defaultOptionValue, label: "All Modes" },
      ...Array.from(new Set(courses.map((course) => course.learning_mode)))
        .filter(Boolean)
        .map((mode) => ({
          value: mode,
          label: mode.charAt(0).toUpperCase() + mode.slice(1),
        })),
    ],
    [courses],
  );

  const levels = React.useMemo(
    () => [
      { value: defaultOptionValue, label: "All Levels" },
      ...Array.from(
        new Set(courses.map((course) => course.expertise_level)),
      ).map((level) => ({ value: level, label: level })),
    ],
    [courses],
  );

  const instructors = React.useMemo(
    () => [
      { value: defaultOptionValue, label: "All Instructors" },
      ...Array.from(
        new Set(courses.map((course) => `${course.instructor_name}`)),
      ).map((instructor) => ({ value: instructor, label: instructor })),
    ],
    [courses],
  );

  // If not authenticated, always show All Courses tab
  React.useEffect(() => {
    if (!isAuthenticated && tab !== TAB_ALL) {
      setTab(TAB_ALL);
    }
  }, [isAuthenticated, tab]);

  // Filtering logic for each tab
  const searchTerm = filters.search.trim().toLowerCase();

  const filterBySearch = (course: TCourse) =>
    searchTerm.length === 0 ||
    course.title.toLowerCase().includes(searchTerm) ||
    course.description.toLowerCase().includes(searchTerm) ||
    (course.tags || []).some((tag) => tag.toLowerCase().includes(searchTerm));

  const filteredCourses = React.useMemo(() => {
    if (tab === TAB_ALL) {
      return courses.filter((course) => {
        const matchesSearch = filterBySearch(course);
        const matchesLearningMode =
          filters.learningMode === defaultOptionValue ||
          course.learning_mode === filters.learningMode;
        const matchesLevel =
          filters.level === defaultOptionValue ||
          course.expertise_level === filters.level;
        const matchesInstructor =
          filters.instructor === defaultOptionValue ||
          `${course.instructor_name}` === filters.instructor;
        return (
          matchesSearch &&
          matchesLearningMode &&
          matchesLevel &&
          matchesInstructor
        );
      });
    } else if (tab === TAB_LIKED) {
      return courses.filter(
        (course) =>
          course.course_iteractions?.user_liked && filterBySearch(course),
      );
    } else if (tab === TAB_SAVED) {
      return courses.filter(
        (course) =>
          course.course_iteractions?.user_saved && filterBySearch(course),
      );
    }
    return courses;
  }, [filters, courses, tab]);

  // const { page, pageCount, pageData, isLoading, goToPage } =
  //   useServerPagination<Course>({ data: filteredCourses, pageSize: 8 });

  const handleFilterChange = (name: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      learningMode: defaultOptionValue,
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

        {/* Tabs for All, Liked, Saved - only show if authenticated */}
        {isAuthenticated && (
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 2 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Courses" />
            <Tab label="Liked Courses" />
            <Tab label="Saved Courses" />
          </Tabs>
        )}

        {/* Filters */}
        {tab === TAB_ALL ? (
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
                value={filters.learningMode}
                onChange={(event) =>
                  handleFilterChange("learningMode", event.target.value)
                }
                slotProps={{
                  select: {
                    displayEmpty: true,
                    renderValue: (value) =>
                      learningModes.find((option) => option.value === value)
                        ?.label ?? "All Modes",
                  },
                }}
                sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
              >
                {learningModes.map((option) => (
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
        ) : (
          // Only search bar for liked/saved tabs
          <Box sx={{ maxWidth: 400, mx: "auto", width: "100%", mb: 2 }}>
            <TextField
              fullWidth
              placeholder={`Search ${tab === TAB_LIKED ? "liked" : "saved"} courses...`}
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
          </Box>
        )}

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
                {tab === TAB_ALL && (
                  <Button variant="outlined" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                )}
              </Stack>
            ) : (
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {filteredCourses.map((course: TCourse) => {
                  const enrolled = isAuthenticated
                    ? isCourseEnrolled(myCourses, course.guid)
                    : false;
                  return (
                    <Grid item sm={12} md={6} lg={4} key={course.id}>
                      <ExtendedCourseCard
                        isEnrolled={enrolled}
                        // @ts-ignore
                        course={course as TEnrolledCourse}
                        refetch={refetch}
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
