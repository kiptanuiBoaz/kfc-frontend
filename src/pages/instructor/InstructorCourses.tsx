import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  IconButton,
} from "@mui/material";
import { Plus, Eye, Pencil, MoreVertical, Trash2 } from "lucide-react";
import { CourseModal } from "../../components/CourseModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TCoursePrviewDetails } from "@/types/course.types";
import { apiClient } from "@/api/apiClient";
import { useUser } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { CustomContainer } from "@/components/shared/CustomContainer";
import LoadingPage from "@/components/shared/LoadingPage";
import ErrorPage from "@/pages/errors/ErrorPage";
import dayjs from "dayjs";
import { truncateString } from "@/utils/truncateString";
import { Notify } from "notiflix";

const InstructorCourses = () => {
  const user = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCourseGuid, setMenuCourseGuid] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [coursePendingDelete, setCoursePendingDelete] =
    useState<TCoursePrviewDetails | null>(null);

  // Convert courses
  const {
    data: instructorCourses,
    isLoading: coursesLoading,
    isError,
  } = useQuery<TCoursePrviewDetails[]>({
    queryKey: ["instructorCourses"],
    queryFn: async () =>
      apiClient.get("/main/v1/courses/?instructor=" + user?.guid),
  });

  const courses = instructorCourses || [];

  const activeCourse = useMemo(
    () => courses.find((course) => course.guid === menuCourseGuid) || null,
    [courses, menuCourseGuid]
  );

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleModalSuccess = () => {
    navigate("/instructor/courses");
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    courseGuid: string
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuCourseGuid(courseGuid);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuCourseGuid(null);
  };

  const handleViewCourse = () => {
    if (!activeCourse) return;
    navigate(`/instructor/courses/${activeCourse.guid}`);
    handleMenuClose();
  };

  const isCoursePublished = (status?: string) =>
    status?.toUpperCase() === "PUBLISHED";

  const handleEditCourse = () => {
    if (!activeCourse || isCoursePublished(activeCourse.status)) return;
    setSelectedCourse(activeCourse);
    setIsModalOpen(true);
    handleMenuClose();
  };

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseGuid: string) => {
      return apiClient.delete(`/main/v1/courses/${courseGuid}/delete/`);
    },
    onSuccess: () => {
      Notify.success("Course deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["instructorCourses"] });
      setIsDeleteDialogOpen(false);
      setCoursePendingDelete(null);
    },
    onError: () => {
      Notify.failure("Failed to delete course. Please try again.");
    },
  });

  const handleDeleteCourseClick = () => {
    if (!activeCourse) return;
    setCoursePendingDelete(activeCourse);
    setIsDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (!coursePendingDelete) return;
    deleteCourseMutation.mutate(coursePendingDelete.guid);
  };

  const handleCloseDeleteDialog = () => {
    if (deleteCourseMutation.isPending) return;
    setIsDeleteDialogOpen(false);
    setCoursePendingDelete(null);
  };
  const renderStatusChip = (status: string) => {
    const colorMap: Record<
      string,
      "default" | "success" | "warning" | "info" | "error"
    > = {
      draft: "default",
      pending: "warning",
      published: "success",
      archived: "info",
      rejected: "error",
    };

    const key = status?.toLowerCase() || "default";

    return (
      <Chip
        size="small"
        label={status}
        color={colorMap[key] || "default"}
        sx={{ textTransform: "capitalize" }}
      />
    );
  };
  if (coursesLoading) {
    return <LoadingPage message="Loading courses" />;
  }

  if (isError) {
    return <ErrorPage message="Failed to load courses. Please try again." />;
  }
  return (
    <CustomContainer>
      <Stack spacing={2}>
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="h4">My Courses</Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={handleCreateCourse}
            >
              Create New Course
            </Button>
          </Box>
          <Typography variant="body2">
            Manage and track all your courses in one place.
          </Typography>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
          {courses.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((course, index) => (
                    <TableRow key={course.guid} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {truncateString(course.title, 60)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {truncateString(course.description ?? "", 60)}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{renderStatusChip(course.status)}</TableCell>
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
                              aria-haspopup="true"
                              aria-controls={
                                menuAnchorEl && menuCourseGuid === course.guid
                                  ? "instructor-course-menu"
                                  : undefined
                              }
                            >
                              <MoreVertical size={18} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
                px: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No courses found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You haven't created any courses yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={handleCreateCourse}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                Create Your First Course
              </Button>
            </Box>
          )}
        </Paper>
      </Stack>

      <Menu
        id="instructor-course-menu"
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
          onClick={handleEditCourse}
          disabled={!activeCourse || isCoursePublished(activeCourse.status)}
        >
          <ListItemIcon>
            <Pencil size={18} />
          </ListItemIcon>
          {activeCourse && isCoursePublished(activeCourse.status)
            ? "Published"
            : "Edit Course"}
        </MenuItem>
        <MenuItem onClick={handleDeleteCourseClick} disabled={!activeCourse}>
          <ListItemIcon>
            <Trash2 size={18} />
          </ListItemIcon>
          Delete Course
        </MenuItem>
      </Menu>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Course</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to delete "${
              coursePendingDelete?.title ?? "this course"
            }"? This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={deleteCourseMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            startIcon={
              deleteCourseMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
            disabled={deleteCourseMutation.isPending}
          >
            {deleteCourseMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Course Modal */}
      <CourseModal
        open={isModalOpen}
        onClose={handleModalClose}
        course={selectedCourse}
        onSuccess={handleModalSuccess}
      />
    </CustomContainer>
  );
};

export default InstructorCourses;
