import React, { useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { CheckCircle2, MoreVertical, Star, StarOff, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { TCoursePrviewDetails } from "@/types/course.types";
import dayjs from "dayjs";
import { Notify } from "notiflix";
import { useNavigate } from "react-router-dom";
import LoadingPage from "@/components/shared/LoadingPage";
import ErrorPage from "@/pages/errors/ErrorPage";
import { truncateString } from "@/utils/truncateString";
import { toSentenceCase } from "@/utils/toSentenceCase";
import { renderStatusChip } from "@/utils/statusChip";
//local host
export const AdminCoursesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCourseGuid, setMenuCourseGuid] = useState<string | null>(null);

  const {
    data: courses = [],
    isLoading,
    isError,
  } = useQuery<TCoursePrviewDetails[]>({
    queryKey: ["adminCourses"],
    queryFn: async () => {
      const data = await apiClient.get<TCoursePrviewDetails[]>("/main/v1/courses/");
      return data ?? [];
    },
  });

  //admin courses
  const [pendingGuid, setPendingGuid] = React.useState<string | null>(null);
  const [featuringGuid, setFeaturingGuid] = React.useState<string | null>(null);

  const approveMutation = useMutation({
    mutationFn: async ({
      courseGuid,
      nextStatus,
    }: {
      courseGuid: string;
      nextStatus: "PUBLISHED" | "DRAFT";
    }) => {
      setPendingGuid(courseGuid);
      await apiClient.patch(`/main/v1/courses/${courseGuid}/update/`, {
        status: nextStatus,
      });
    },
    onSuccess: (_, variables) => {
      Notify.success(
        variables.nextStatus === "PUBLISHED"
          ? "Course approved (Published)"
          : "Course taken down (Draft)",
      );
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
    },
    onError: () => {
      Notify.failure("Failed to update course status. Please try again");
    },
    onSettled: () => {
      setPendingGuid(null);
    },
  });

  const featureMutation = useMutation({
    mutationFn: async ({
      courseGuid,
      nextFeatured,
    }: {
      courseGuid: string;
      nextFeatured: boolean;
    }) => {
      setFeaturingGuid(courseGuid);
      await apiClient.patch(`/main/v1/courses/${courseGuid}/update/`, {
        isFeatured: nextFeatured,
      });
    },
    onSuccess: (_, variables) => {
      Notify.success(
        variables.nextFeatured
          ? "Course marked as featured"
          : "Course unfeatured",
      );
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
    },
    onError: () => {
      Notify.failure("Failed to toggle featured state. Please try again");
    },
    onSettled: () => {
      setFeaturingGuid(null);
    },
  });

  const renderStatus = (status: string) => {
    const colorMap: Record<
      string,
      "default" | "success" | "warning" | "error"
    > = {
      draft: "default",
      active: "success",
      completed: "success",
      archived: "default",
      pending: "warning",
      rejected: "error",
    };

    return (
      <Chip
        size="small"
        label={status}
        color={colorMap[status] || "default"}
        sx={{ textTransform: "capitalize" }}
      />
    );
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    courseGuid: string,
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuCourseGuid(courseGuid);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuCourseGuid(null);
  };

  const activeCourse = React.useMemo(
    () => courses.find((course) => course.guid === menuCourseGuid) || null,
    [courses, menuCourseGuid],
  );

  const isApprovingSelectedCourse =
    approveMutation.isPending && pendingGuid === activeCourse?.guid;
  const isFeaturingSelectedCourse =
    featureMutation.isPending && featuringGuid === activeCourse?.guid;

  const handleViewCourse = () =>
    navigate(`/courses/${activeCourse?.guid}/learn`);

  const handleApproveCourse = () => {
    if (!activeCourse) return;
    const isCurrentlyPublished =
      (activeCourse.status || "").toUpperCase() === "PUBLISHED";
    const nextStatus = isCurrentlyPublished ? "DRAFT" : "PUBLISHED";
    approveMutation.mutate({ courseGuid: activeCourse.guid, nextStatus });
    handleMenuClose();
  };

  const handleFeatureCourse = () => {
    if (!activeCourse) return;
    const nextFeatured = !Boolean(activeCourse.isFeatured);
    featureMutation.mutate({ courseGuid: activeCourse.guid, nextFeatured });
    handleMenuClose();
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
        {isLoading && <LoadingPage message="Loading Courses..." />}

        {isError && (
          <ErrorPage message="Failed to load courses. Please try again." />
        )}

        {!isLoading && !isError && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Learning Mode</TableCell>
                  <TableCell align="left">Instructor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course, index) => (
                  <TableRow key={course.guid} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box
                        component="img"
                        src={
                          course.image || "/images/logos/horizontal_logo.png"
                        }
                        alt={course.title}
                        sx={{
                          width: 56,
                          height: 40,
                          objectFit: "cover",
                          borderRadius: 1,
                          boxShadow: 1,
                          bgcolor: "grey.100",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box>
                          <Typography variant="subtitle2">
                            {truncateString(course.title, 50)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {truncateString(course.description, 50) ??
                              "Uncategorized"}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          course.learning_mode
                            ? course.learning_mode.charAt(0).toUpperCase() +
                              course.learning_mode.slice(1)
                            : "Online"
                        }
                        sx={{ textTransform: "capitalize" }}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>
                        {course.instructor_details
                          ? `${course.instructor_details.first_name ?? ""} ${
                              course.instructor_details.last_name ?? ""
                            }`.trim() || "N/A"
                          : "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {renderStatusChip(toSentenceCase(course.status))}
                    </TableCell>
                    <TableCell>
                      {course.isPaid && course.amount
                        ? `${course.currency ?? "USD"} ${course.amount}`
                        : "Free"}
                    </TableCell>
                    <TableCell>
                      {course.created_at
                        ? dayjs(course.created_at).format("MMM D, YYYY")
                        : "--"}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Course actions">
                        <span>
                          <IconButton
                            onClick={(event) =>
                              handleMenuOpen(event, course.guid)
                            }
                            aria-controls={
                              menuAnchorEl && menuCourseGuid === course.guid
                                ? "course-action-menu"
                                : undefined
                            }
                            aria-haspopup="true"
                          >
                            <MoreVertical size={20} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {courses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">
                        No courses found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      <Menu
        id="course-action-menu"
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleViewCourse} disabled={!activeCourse}>
          <ListItemIcon>
            <Eye size={18} />
          </ListItemIcon>
          View Course
        </MenuItem>
        <MenuItem
          onClick={handleApproveCourse}
          disabled={!activeCourse || approveMutation.isPending}
        >
          <ListItemIcon>
            {isApprovingSelectedCourse ? (
              <CircularProgress size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
          </ListItemIcon>
          {activeCourse?.status?.toUpperCase() === "PUBLISHED"
            ? "Take Down Course"
            : "Approve Course"}
        </MenuItem>
        <MenuItem
          onClick={handleFeatureCourse}
          disabled={!activeCourse || featureMutation.isPending}
        >
          <ListItemIcon>
            {isFeaturingSelectedCourse ? (
              <CircularProgress size={18} />
            ) : activeCourse?.isFeatured ? (
              <Star size={18} />
            ) : (
              <StarOff size={18} />
            )}
          </ListItemIcon>
          {activeCourse?.isFeatured ? "Unfeature Course" : "Feature Course"}
        </MenuItem>
      </Menu>
    </Paper>
  );
};
