import React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { Clock, Star, Info, Calendar } from "lucide-react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/api/apiClient";
import { TCourse } from "@/types/course.types";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useIsAuthenticated, useUser } from "@/hooks/useAuth";
import { useMyCourses } from "@/hooks/useMyCourses";
import { isCourseEnrolled } from "@/utils/isCourseEnrolled";
import ErrorPage from "@/pages/errors/ErrorPage";
import LoadingPage from "@/components/shared/LoadingPage";
import { ArrowRight, ArrowRightAlt } from "@mui/icons-material";
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || "";

export const CoursePreviewPage = () => {
  const { courseGuid } = useParams<{ courseGuid: string }>();
  const user = useUser();
  const theme = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = useQuery<TCourse | undefined>({
    queryKey: ["courseDetails", courseGuid],
    enabled: !!courseGuid,
    queryFn: async () =>
      await apiClient.get<TCourse>(`/main/v1/courses/${courseGuid}/`),
  });

  const { data: myCourses = [] } = useMyCourses();
  const isEnrolled = isCourseEnrolled(myCourses, courseGuid || "");
  const isInstructor = user?.role?.name?.toLowerCase() === "instructor";
  const isAdmin = user?.role?.name?.toLowerCase() === "admin";

  const primaryAction = React.useMemo(() => {
    if (isInstructor) {
      return {
        label: "Manage Course",
        onClick: () => navigate(`/instructor/courses/${course?.guid}`),
      };
    }

    if (!isAuthenticated && !isAdmin) {
      return {
        label: "Enroll Now",
        onClick: () => navigate(`/courses/${course?.guid}/enroll`),
      };
    }

    if (isEnrolled) {
      const isPhysical = course?.learning_mode === "PHYSICAL";
      return {
        label: isPhysical ? "View Content" : "Continue Learning",
        onClick: () => navigate(`/courses/${course?.guid}/learn`),
      };
    }

    return {
      label: "Enroll Now",
      onClick: () => navigate(`/courses/${course?.guid}/enroll`),
    };
  }, [
    course?.guid,
    isAuthenticated,
    isEnrolled,
    isInstructor,
    navigate,
    course?.learning_mode,
  ]);

  if (isCourseLoading) {
    return <LoadingPage message="Loading course details..." />;
  }

  if (isCourseError || !course) {
    return (
      <ErrorPage message="Failed to load course details. Please try again later." />
    );
  }

  return (
    <Box sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 6 } }}>
      <Stack spacing={{ xs: 2, md: 4 }}>
        {/* Header Section */}
        <Paper
          sx={{
            p: { xs: 1, sm: 2, md: 4 },
            borderRadius: 3,
            backgroundColor: "grey.50",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "center" },
              gap: { xs: 2, md: 4 },
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: { xs: "100%", md: 340 },
                minWidth: 0,
                mb: { xs: 2, md: 0 },
                alignSelf: { xs: "center", md: "flex-start" },
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src={
                  course?.image
                    ? `${MEDIA_BASE_URL}${course.image}`
                    : "/images/logos/horizontal_logo.png"
                }
                alt={course.title}
                sx={{
                  width: { xs: "100%", sm: 320, md: 340 },
                  maxWidth: { xs: "100%", sm: 320, md: 340 },
                  height: { xs: 160, sm: 200, md: 250 },
                  objectFit: "cover",
                  borderRadius: 2,
                  boxShadow: { xs: 1, md: 2 },
                }}
              />
              {/* Learning Mode Chip */}
              {course.learning_mode && (
                <Chip
                  label={
                    course.learning_mode.charAt(0) +
                    course.learning_mode.slice(1).toLowerCase()
                  }
                  size="small"
                  color={
                    course.learning_mode === "PHYSICAL" ? "warning" : "info"
                  }
                  variant="outlined"
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    fontWeight: 700,
                    zIndex: 2,
                    textTransform: "capitalize",
                  }}
                />
              )}
            </Box>
            <Box
              sx={{
                flex: 1,
                backgroundColor: { xs: "transparent", md: "gray.50" },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Stack spacing={2} sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: { xs: "center", md: "flex-start" },
                  }}
                >
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{
                      fontSize: { xs: "1.3rem", sm: "1.7rem", md: "2.2rem" },
                      textAlign: { xs: "center", md: "left" },
                      wordBreak: "break-word",
                    }}
                  >
                    {course.title}
                  </Typography>
                  <Tooltip
                    title={
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ mb: 0.5 }}
                        >
                          Expertise Guide
                        </Typography>
                        <Typography variant="body2">
                          Beginner: Entry-level awareness
                        </Typography>
                        <Typography variant="body2">
                          Intermediate: Operational compliance
                        </Typography>
                        <Typography variant="body2">
                          Advanced: Audit & certification readiness
                        </Typography>
                      </Box>
                    }
                    placement="top"
                    arrow
                  >
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <Info size={18} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ textAlign: { xs: "center", md: "left" } }}
                >
                  {course.category}
                </Typography>

                <Stack spacing={2} direction={"row"} alignItems="center">
                  <Calendar style={{ fontSize: "10px" }} />
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(course.created_at).toLocaleDateString()}
                  </Typography>
                  {course.learning_mode === "PHYSICAL" && course.venue && (
                    <>
                      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Location:</strong> {course.venue}
                      </Typography>
                      {course.training_date && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Date:</strong>{" "}
                          {new Date(course.training_date).toLocaleDateString()}
                        </Typography>
                      )}
                    </>
                  )}
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "center", sm: "center" }}
                  spacing={2}
                  sx={{
                    justifyContent: { xs: "center", md: "flex-start" },
                    textAlign: { xs: "center", md: "left" },
                  }}
                >
                  <Stack
                    direction={"row"}
                    alignItems="center"
                    flexWrap={"wrap"}
                    spacing={1}
                    flex={1}
                  >
                    <Chip
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.main,
                      }}
                      icon={<Star size={18} color="gold" />}
                      label={course.expertise_level}
                    />

                    <Chip
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.main,
                      }}
                      icon={<Clock size={18} />}
                      label={
                        course.total_duration === "0h"
                          ? "Self Paced"
                          : course.total_duration
                      }
                    />
                  </Stack>
                  {!isEnrolled && (
                    <>
                      {course.isPaid && course.amount && (
                        <Typography variant="h6" color="primary">
                          {course.currency ?? "USD"} {course.amount}
                        </Typography>
                      )}
                      {!course.isPaid && <Chip label="Free" color="success" />}
                    </>
                  )}
                </Stack>
                <Divider sx={{ display: { xs: "none", sm: "block" } }} />
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "center", sm: "center" }}
                  justifyContent="space-between"
                  spacing={2}
                  mt={2}
                  sx={{ gap: { xs: 2, sm: 0 } }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                      justifyContent: { xs: "center", sm: "flex-start" },
                    }}
                  >
                    <Avatar
                      src={`${MEDIA_BASE_URL}${course.instructor_details.image}`}
                      alt={`${course.instructor_details?.first_name} ${course.instructor_details?.last_name}`}
                      sx={{ width: 48, height: 48 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {course.instructor_details?.first_name}{" "}
                        {course.instructor_details?.last_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.instructor_details?.bio || " Instructor"}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                    <Button
                      sx={{
                        minWidth: { xs: "100%", sm: 200 },
                        width: { xs: "100%", sm: "auto" },
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                      }}
                      onClick={primaryAction.onClick}
                      variant="contained"
                      size="large"
                      fullWidth={true}
                      endIcon={<ArrowRight />}
                    >
                      {primaryAction.label}
                    </Button>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Paper>
        {/* About Section */}
        <Grid container spacing={{ xs: 2, md: 4 }}>
          <Grid item xs={12} md={8}>
            <Stack spacing={{ xs: 2, md: 3 }} direction={"column"}>
              <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3 }}>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  gutterBottom
                  sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" } }}
                >
                  About This Course
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  mb={3}
                  sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
                >
                  {course.description}
                </Typography>

                {course.tags && course.tags.length > 0 && (
                  <Box>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {course.tags.map((tag, index) => (
                        <Chip key={index} label={tag} />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Paper>{" "}
              {course.objectives && course.objectives.length > 0 && (
                <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    What You'll Learn
                  </Typography>
                  <Stack spacing={1}>
                    {course.objectives.map((objective, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                      >
                        <CheckCircleOutlineIcon color="secondary" />

                        <Typography variant="body2">{objective}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              )}{" "}
              {course.modules && course.modules.length > 0 && (
                <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, mt: 3 }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Course Syllabus
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    {course.modules.length} modules •{" "}
                    {course.modules.reduce(
                      (total, module) => total + (module.topics?.length || 0),
                      0,
                    )}{" "}
                    topics
                  </Typography>

                  <Stack spacing={2}>
                    {course.modules.map((module, moduleIndex) => (
                      <Accordion
                        key={module.guid}
                        sx={{
                          borderRadius: 2,
                          "&:before": { display: "none" },
                          boxShadow: "none",
                          //   border: "1px solid",
                          //   borderColor: "divider",
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            "& .MuiAccordionSummary-content": {
                              alignItems: "center",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              flex: 1,
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" alignItems="center">
                                <Box
                                  sx={{
                                    minWidth: 94,
                                    fontWeight: 600,
                                    color: "primary.main",
                                  }}
                                >
                                  Module {moduleIndex + 1}
                                </Box>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="bold"
                                >
                                  {module.name ||
                                    module.title ||
                                    "Untitled Module"}
                                </Typography>
                              </Stack>
                              {/* <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {module.description ||
                                  "No description available"}
                              </Typography> */}
                            </Box>
                            {module.duration_minutes && (
                              <Chip
                                label={`${module.duration_minutes}`}
                                size="small"
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0 }}>
                          {module.topics && module.topics.length > 0 ? (
                            <Stack spacing={1.5}>
                              {module.topics.map((topic, topicIndex) => (
                                <Box
                                  key={topic.guid}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    px: 2,
                                    borderRadius: 1,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: "50%",
                                      border: (theme) =>
                                        `1px solid ${theme.palette.grey[300]}`,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: 12,
                                      fontWeight: 600,
                                      color: "primary.main",
                                    }}
                                  >
                                    {topicIndex + 1}/{module.topics.length}
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography
                                      color="text.secondary"
                                      variant="body2"
                                      fontWeight={600}
                                    >
                                      {topic.name || "Untitled topic"}
                                    </Typography>
                                  </Box>
                                  {topic.duration && (
                                    <Chip
                                      label={`${topic.duration}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              ))}
                            </Stack>
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontStyle: "italic" }}
                            >
                              No topics available for this module
                            </Typography>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={{ xs: 2, md: 3 }}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  gutterBottom
                  sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }}
                >
                  Course Details
                </Typography>
                <Stack spacing={{ xs: 1, sm: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Expertise Level
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body1">
                        {course.expertise_level}
                      </Typography>
                      <Tooltip
                        title={
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ mb: 0.5 }}
                            >
                              Expertise Guide
                            </Typography>
                            <Typography variant="body2">
                              Beginner: Entry-level awareness
                            </Typography>
                            <Typography variant="body2">
                              Intermediate: Operational compliance
                            </Typography>
                            <Typography variant="body2">
                              Advanced: Audit & certification readiness
                            </Typography>
                          </Box>
                        }
                        placement="top"
                        arrow
                      >
                        <IconButton size="small">
                          <Info size={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Duration
                    </Typography>
                    <Typography variant="body1">
                      {course.total_duration}
                    </Typography>
                  </Box>

                  {isEnrolled && course.course_progress !== undefined && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body1">
                        {course.course_progress}%
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>

              {course.prerequisites && course.prerequisites.length > 0 && (
                <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Prerequisites
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {course.prerequisites.map((prereq, index) => (
                      <Chip
                        key={index}
                        label={prereq}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};
