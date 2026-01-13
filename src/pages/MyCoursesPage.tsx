import React from "react";
import {
  Button,
  Card,
  Grid,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExtendedCourseCard from "@/components/ExtendedCourseCard";
import { useMyCourses } from "@/hooks/useMyCourses";
import LoadingPage from "@/components/shared/LoadingPage";
import ErrorPage from "@/pages/errors/ErrorPage";
import { CustomContainer } from "@/components/shared/CustomContainer";

const defaultOptionValue = "all";

type FilterState = {
  search: string;
  tag: string;
  level: string;
  instructor: string;
};

const MyCoursesPage = () => {
  const { data: courses = [], isLoading, isError } = useMyCourses();

  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    tag: defaultOptionValue,
    level: defaultOptionValue,
    instructor: defaultOptionValue,
  });

  const tags = React.useMemo(
    () => [
      { value: defaultOptionValue, label: "All Tags" },
      ...Array.from(new Set(courses.flatMap((course) => course.tags || [])))
        .filter(Boolean)
        .map((tag) => ({ value: tag, label: tag })),
    ],
    [courses]
  );

  const levels = React.useMemo(
    () => [
      { value: defaultOptionValue, label: "All Levels" },
      ...Array.from(new Set(courses.map((course) => course.expertise_level)))
        .filter(Boolean)
        .map((level) => ({ value: level, label: level })),
    ],
    [courses]
  );

  const instructors = React.useMemo(
    () => [
      { value: defaultOptionValue, label: "All Instructors" },
      ...Array.from(new Set(courses.map((course) => course.instructor?.name)))
        .filter((name) => name.length > 0)
        .map((name) => ({ value: name, label: name })),
    ],
    [courses]
  );

  const filteredCourses = React.useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    return courses.filter((course) => {
      const instructorName = course.instructor?.name;

      const matchesSearch =
        searchTerm.length === 0 ||
        course.title.toLowerCase().includes(searchTerm) ||
        course.description?.toLowerCase().includes(searchTerm);

      const matchesTag =
        filters.tag === defaultOptionValue ||
        (course.tags || []).includes(filters.tag);

      const matchesLevel =
        filters.level === defaultOptionValue ||
        course.expertise_level === filters.level;

      const matchesInstructor =
        filters.instructor === defaultOptionValue ||
        instructorName === filters.instructor;

      return matchesSearch && matchesTag && matchesLevel && matchesInstructor;
    });
  }, [courses, filters]);

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

  if (isLoading) {
    return <LoadingPage message="Loading your courses..." />;
  }

  if (isError) return <ErrorPage message="Failed to load your courses." />;

  return (
    <CustomContainer>
      <Stack
        direction={"row"}
        justifyContent="space-between"
        alignItems="center"
        my={2}
      >
        <Typography variant="h4" fontWeight={700} mb={4}>
          My Courses
        </Typography>
        <Button variant="contained" href="/courses">
          Browse Courses
        </Button>
      </Stack>

      {courses.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            You haven't enrolled in any courses yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse our course catalog to find courses that interest you.
          </Typography>
          <Button variant="contained" sx={{ mt: 4 }} href="/courses">
            Browse Courses
          </Button>
        </Card>
      ) : (
        <React.Fragment>
          <Grid container spacing={2} mb={4}>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                fullWidth
                placeholder="Search courses by keyword..."
                type="search"
                value={filters.search}
                onChange={(event) =>
                  handleFilterChange("search", event.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                fullWidth
                select
                value={filters.tag}
                onChange={(event) =>
                  handleFilterChange("tag", event.target.value)
                }
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (value) =>
                    tags.find((option) => option.value === value)?.label ??
                    "All Tags",
                }}
              >
                {tags.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                fullWidth
                select
                value={filters.level}
                onChange={(event) =>
                  handleFilterChange("level", event.target.value)
                }
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (value) =>
                    levels.find((option) => option.value === value)?.label ??
                    "All Levels",
                }}
              >
                {levels.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                fullWidth
                select
                value={filters.instructor}
                onChange={(event) =>
                  handleFilterChange("instructor", event.target.value)
                }
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (value) =>
                    instructors.find((option) => option.value === value)
                      ?.label ?? "All Instructors",
                }}
              >
                {instructors.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {filteredCourses.length === 0 ? (
            <Stack alignItems="center" sx={{ py: 6 }} spacing={2}>
              <Typography variant="body1" color="text.secondary">
                No courses match your filters. Adjust your search or filters.
              </Typography>
              <Button variant="outlined" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </Stack>
          ) : (
            <Grid container spacing={3}>
              {filteredCourses.map((course) => (
                <Grid item xs={12} sm={6} lg={4} key={course.guid}>
                  <ExtendedCourseCard course={course} isEnrolled />
                </Grid>
              ))}
            </Grid>
          )}
        </React.Fragment>
      )}
    </CustomContainer>
  );
};

export default MyCoursesPage;
