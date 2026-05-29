import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Plus,
  ArrowRight,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { AnalyticsCard } from "@/components/shared/AnalyticsCard";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "@/api/organizationApi";
import { OrganizationUser } from "@/types/organization.types";
import { TCoursePrviewDetails, TEnrolledCourse } from "@/types/course.types";
import { Notify } from "notiflix";
import { isCourseEnrolled } from "@/utils/isCourseEnrolled";

const DUMMY_ORG_USERS: OrganizationUser[] = [
  {
    guid: "dummy-user-1",
    first_name: "Junior",
    last_name: "Muri",
    email: "junimuri011@gmail.com",
    phone_number: "+254 723 45678",
    role: { guid: "role-user-guid", name: "USER" } as any,
    is_active: true,
    created_at: new Date().toISOString(),
    organization: null,
    image: null,
    is_first_time_login: false,
    bio: "",
  },
  {
    guid: "dummy-user-2",
    first_name: "Boaz",
    last_name: "Kiptanui",
    email: "kiptanuiboaz@gmail.com",
    phone_number: "+254 712 34567",
    role: { guid: "role-admin-guid", name: "ORG_ADMIN" } as any,
    is_active: true,
    created_at: "2026-05-10T12:00:00Z",
    organization: null,
    image: null,
    is_first_time_login: false,
    bio: "",
  },
  {
    guid: "dummy-user-3",
    first_name: "Alice",
    last_name: "Wambui",
    email: "alicewambui@gmail.com",
    phone_number: "+254 701 23456",
    role: { guid: "role-user-guid", name: "USER" } as any,
    is_active: false,
    created_at: "2026-05-12T14:30:00Z",
    organization: null,
    image: null,
    is_first_time_login: false,
    bio: "",
  }
];

type AssignmentHistoryItem = {
  id: string;
  userGuid: string;
  userName: string;
  courseGuid: string;
  courseTitle: string;
  assignedAt: string;
  mode: "user-first" | "course-first";
};

type AssignCoursesPayload = {
  userGuids: string[];
  courseGuids: string[];
  selectedUsers: OrganizationUser[];
  selectedCourse?: TCoursePrviewDetails | null;
};

const OrgDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const user = useUser();
  const queryClient = useQueryClient();
  const orgName = user?.organization?.org_name || "KFC Kenya";
  const orgGuid = user?.organization?.guid || "";
  const usersPath = `/org/${orgGuid}/users`;

  // Fetch users
  const { data: users = [] } = useQuery({
    queryKey: ["orgUsers"],
    queryFn: organizationApi.getOrganizationUsers,
  });

  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
  } = useQuery<TCoursePrviewDetails[]>({
    queryKey: ["orgCourses"],
    queryFn: organizationApi.getOrganizationCourses,
  });

  const displayUsers = Array.isArray(users) && users.length > 0 ? users : DUMMY_ORG_USERS;
  const activeCount = displayUsers.filter((u) => u.is_active).length;
  const inactiveCount = displayUsers.filter((u) => !u.is_active).length;

  const [selectedUsers, setSelectedUsers] = useState<OrganizationUser[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<TCoursePrviewDetails | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<"user-first" | "course-first">(
    "user-first"
  );
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistoryItem[]>(() => {
    // Load from localStorage on initial state
    try {
      const saved = localStorage.getItem("orgDashboardAssignmentHistory");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist assignment history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("orgDashboardAssignmentHistory", JSON.stringify(assignmentHistory));
  }, [assignmentHistory]);

  // Fetch enrolled courses for selected users when they change
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      const enrolledCoursesMap: Record<string, TEnrolledCourse[]> = {};
      
      for (const user of selectedUsers) {
        try {
          const enrolled = await organizationApi.getUserEnrolledCourses(user.guid);
          enrolledCoursesMap[user.guid] = enrolled;
        } catch (error) {
          console.error(`Failed to fetch enrolled courses for user ${user.guid}:`, error);
          enrolledCoursesMap[user.guid] = [];
        }
      }
      
      setSelectedUsersEnrolledCourses(enrolledCoursesMap);
    };

    if (selectedUsers.length > 0) {
      fetchEnrolledCourses();
    } else {
      setSelectedUsersEnrolledCourses({});
    }
  }, [selectedUsers]);

  // State for Add Course dialog
  const [addCourseDialog, setAddCourseDialog] = useState<{
    open: boolean;
    userGuid: string | null;
    userName: string | null;
  }>({
    open: false,
    userGuid: null,
    userName: null,
  });
  const [selectedCourseToAdd, setSelectedCourseToAdd] = useState<TCoursePrviewDetails | null>(null);
  const [userEnrolledCourses, setUserEnrolledCourses] = useState<TEnrolledCourse[]>([]);
  const [selectedUsersEnrolledCourses, setSelectedUsersEnrolledCourses] = useState<Record<string, TEnrolledCourse[]>>({});
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<OrganizationUser | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const recentHistorySeed = useMemo<AssignmentHistoryItem[]>(() => {
    const seedUsers = displayUsers.slice(0, 2);
    const seedCourses = courses.slice(0, 2);
    if (seedUsers.length === 0 || seedCourses.length === 0) return [];

    return seedUsers.flatMap((seedUser, index) =>
      seedCourses.slice(0, 1).map((seedCourse, innerIndex) => ({
        id: `seed-${seedUser.guid}-${seedCourse.guid}-${innerIndex}`,
        userGuid: seedUser.guid,
        userName: `${seedUser.first_name} ${seedUser.last_name}`,
        courseGuid: seedCourse.guid,
        courseTitle: seedCourse.title,
        assignedAt: new Date(Date.now() - (index + 1) * 60 * 60 * 1000).toISOString(),
        mode: "user-first",
      }))
    );
  }, [courses, displayUsers]);

  // Filter courses to include those that at least one selected user does not already have
  const availableCoursesForSelection = useMemo(() => {
    if (selectedUsers.length === 0) return courses;

    return courses.filter((course) =>
      selectedUsers.some((user) =>
        !(selectedUsersEnrolledCourses[user.guid] || []).some((enrolledCourse) => enrolledCourse.guid === course.guid)
      )
    );
  }, [courses, selectedUsers, selectedUsersEnrolledCourses]);

  // Group assignment history by user
  const groupedAssignmentHistory = useMemo(() => {
    const history = assignmentHistory.length > 0 ? assignmentHistory : recentHistorySeed;
    const grouped = new Map<string, { user: AssignmentHistoryItem; courses: AssignmentHistoryItem[] }>();

    history.forEach((item) => {
      if (!grouped.has(item.userGuid)) {
        grouped.set(item.userGuid, { user: item, courses: [] });
      }
      grouped.get(item.userGuid)!.courses.push(item);
    });

    return Array.from(grouped.values());
  }, [assignmentHistory, recentHistorySeed]);

  const selectedModeText = useMemo(() => {
    if (selectedUsers.length === 0 && !selectedCourse) {
      return "Choose one or more users and a course to assign.";
    }
    if (selectedUsers.length > 0 && selectedCourse) {
      return `Assigning 1 course to ${selectedUsers.length} user(s).`;
    }
    return assignmentMode === "user-first"
      ? `Selected ${selectedUsers.length} user(s). Now choose a course.`
      : `Selected a course. Now choose user(s).`;
  }, [assignmentMode, selectedCourse, selectedUsers.length]);

  const assignMutation = useMutation({
    mutationFn: ({ userGuids, courseGuids }: AssignCoursesPayload) =>
      organizationApi.assignCoursesToUsers(userGuids, courseGuids),
    onSuccess: (_, variables) => {
      const selectedUserMap = new Map(
        variables.selectedUsers.map((selectedUser) => [
          selectedUser.guid,
          `${selectedUser.first_name} ${selectedUser.last_name}`,
        ])
      );
      const selectedCourseMap = new Map([
        [variables.selectedCourse?.guid, variables.selectedCourse?.title],
      ] as [string | undefined, string | undefined][]);
      const assignedAt = new Date().toISOString();

      const newHistoryRows: AssignmentHistoryItem[] = variables.userGuids.flatMap((userGuid) => {
        const courseGuid = variables.courseGuids[0];
        return [
          {
            id: `${userGuid}-${courseGuid}-${assignedAt}`,
            userGuid,
            userName: selectedUserMap.get(userGuid) || userGuid,
            courseGuid,
            courseTitle: selectedCourseMap.get(courseGuid) || courseGuid,
            assignedAt,
            mode: assignmentMode,
          },
        ];
      });

      setAssignmentHistory((prev) => [...newHistoryRows, ...prev].slice(0, 10));
      Notify.success("Course assigned successfully to selected users.");
      setSelectedUsers([]);
      setSelectedCourse(null);
    },
    onError: (error: any) => {
      // Check if the error is about already enrolled courses
      if (error?.response?.data?.message?.includes("Already enrolled") || 
          error?.message?.includes("Already enrolled")) {
        Notify.warning("One or more courses are already assigned to selected users.");
      } else {
        Notify.failure("Unable to assign courses. Please try again later.");
      }
    },
  });

  const hasSelection = selectedUsers.length > 0 && Boolean(selectedCourse);

  // Mutation for removing a course from a user
  const removeCourseMutation = useMutation({
    mutationFn: ({ userGuid, courseGuid }: { userGuid: string; courseGuid: string }) =>
      organizationApi.removeCourseFromUser(userGuid, courseGuid),
    onSuccess: (_, variables) => {
      // Remove from history using courseGuid for exact matching
      setAssignmentHistory((prev) =>
        prev.filter((item) => item.courseGuid !== variables.courseGuid || item.userGuid !== variables.userGuid)
      );
      Notify.success("Course removed successfully.");
    },
    onError: (error: any, variables) => {
      console.error("Remove course error:", error);
      // If the enrollment doesn't exist, still remove it from history since it's already not enrolled
      if (error?.response?.data?.data?.includes("No UsersCourseEnrollment matches the given query") ||
          error?.response?.data?.message?.includes("Unenrollment failed")) {
        setAssignmentHistory((prev) =>
          prev.filter((item) => item.courseGuid !== variables.courseGuid || item.userGuid !== variables.userGuid)
        );
        Notify.info("Course enrollment not found in system. Removed from history.");
      } else {
        Notify.failure("Failed to remove course. Please try again.");
      }
    },
  });

  // Mutation for adding a course to a user
  const addCourseMutation = useMutation({
    mutationFn: ({ userGuid, courseGuid, courseName, userName }: { userGuid: string; courseGuid: string; courseName: string; userName: string }) =>
      organizationApi.assignCourseToUser(userGuid, courseGuid).then(() => ({ userGuid, courseGuid, courseName, userName })),
    onSuccess: (data) => {
      // Add to history
      const newItem: AssignmentHistoryItem = {
        id: `${data.userGuid}-${data.courseGuid}-${new Date().toISOString()}`,
        userGuid: data.userGuid,
        userName: data.userName,
        courseGuid: data.courseGuid,
        courseTitle: data.courseName,
        assignedAt: new Date().toISOString(),
        mode: "user-first",
      };
      setAssignmentHistory((prev) => [newItem, ...prev]);
      setAddCourseDialog({ open: false, userGuid: null, userName: null });
      setSelectedCourseToAdd(null);
      setUserEnrolledCourses([]);
      Notify.success("Course added successfully.");
    },
    onError: (error: any) => {
      // Check if the error is about already enrolled courses
      if (error?.response?.data?.message?.includes("Already enrolled") || 
          error?.message?.includes("Already enrolled") ||
          error?.response?.data?.data?.includes("Already enrolled")) {
        Notify.warning("This course is already assigned to the user.");
      } else {
        Notify.failure("Failed to add course. Please try again.");
      }
    },
  });

  const handleRemoveCourse = (historyItem: AssignmentHistoryItem) => {
    if (window.confirm(`Remove "${historyItem.courseTitle}" from ${historyItem.userName}?`)) {
      removeCourseMutation.mutate({ userGuid: historyItem.userGuid, courseGuid: historyItem.courseGuid });
    }
  };

  // Mutation for deleting a user
  const deleteUserMutation = useMutation({
    mutationFn: (guid: string) => organizationApi.deleteUser(guid),
    onSuccess: () => {
      Notify.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
      setDeleteUserDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      Notify.failure(error?.response?.data?.message || "Failed to delete user");
    },
  });

  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.guid);
    }
  };

  const openDeleteUserDialog = (user: OrganizationUser) => {
    setUserToDelete(user);
    setDeleteUserDialogOpen(true);
  };

  const toggleUserExpansion = (userGuid: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userGuid)) {
        newSet.delete(userGuid);
      } else {
        newSet.add(userGuid);
      }
      return newSet;
    });
  };

  const handleOpenAddCourseDialog = async (userGuid: string, userName: string) => {
    setAddCourseDialog({ open: true, userGuid, userName });
    setSelectedCourseToAdd(null);
    // Fetch user's enrolled courses to filter them out
    try {
      const enrolled = await organizationApi.getUserEnrolledCourses(userGuid);
      setUserEnrolledCourses(enrolled);
    } catch (error) {
      console.error("Failed to fetch enrolled courses:", error);
      setUserEnrolledCourses([]);
    }
  };

  const handleAddCourseConfirm = () => {
    if (!selectedCourseToAdd || !addCourseDialog.userGuid || !addCourseDialog.userName) {
      Notify.warning("Please select a course.");
      return;
    }
    
    // Double-check if course is already enrolled before making API call
    if (isCourseEnrolled(userEnrolledCourses, selectedCourseToAdd.guid)) {
      Notify.warning("This course is already assigned to the user.");
      return;
    }
    
    addCourseMutation.mutate({
      userGuid: addCourseDialog.userGuid,
      courseGuid: selectedCourseToAdd.guid,
      courseName: selectedCourseToAdd.title,
      userName: addCourseDialog.userName,
    });
  };

  const handleAssignCourses = () => {
    if (!hasSelection || !selectedCourse) return;

    const usersToAssign = selectedUsers.filter(
      (user) => !isCourseEnrolled(selectedUsersEnrolledCourses[user.guid] || [], selectedCourse.guid)
    );

    if (usersToAssign.length === 0) {
      Notify.warning("All selected users already have this course.");
      return;
    }

    assignMutation.mutate({
      userGuids: usersToAssign.map((user) => user.guid),
      courseGuids: [selectedCourse.guid],
      selectedUsers: usersToAssign,
      selectedCourse,
    });
  };

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, value: "user-first" | "course-first" | null) => {
    if (value) setAssignmentMode(value);
  };

  return (
    <Stack spacing={4} sx={{ py: 3, px: { xs: 2, md: 4 } }}>
      {/* Welcome Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              letterSpacing: "-0.02em",
              mb: 0.5,
            }}
          >
            Welcome back, Admin!
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Here is the learning and member overview for{" "}
            <Box component="span" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
              {orgName}
            </Box>
            .
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => navigate(usersPath)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Manage Users
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => navigate(usersPath, { state: { openInvite: true } })}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Invite Member
          </Button>
        </Stack>
      </Box>

      {/* Analytics Cards Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <AnalyticsCard
            title="Total Members"
            value={displayUsers.length}
            subtitle="Registered staff"
            icon={<Users />}
            color="primary"
            trend={{ value: "+15%", isPositive: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <AnalyticsCard
            title="Active Learners"
            value={activeCount}
            subtitle="Engaged in training"
            icon={<ShieldCheck />}
            color="success"
            trend={{ value: "100% active", isPositive: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <AnalyticsCard
            title="Pending/Inactive"
            value={inactiveCount}
            subtitle="Awaiting sign-in"
            icon={<AlertTriangle />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <AnalyticsCard
            title="Courses Enrolled"
            value={4}
            subtitle="Assigned training programs"
            icon={<BookOpen />}
            color="info"
            trend={{ value: "85% Compliance", isPositive: true }}
          />
        </Grid>
      </Grid>

      {/* Grid for Quick Overviews */}
      <Grid container spacing={4}>
        {/* Left Side: Compliance & Analytics */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
            }}
          >
            <Stack spacing={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700}>
                  Training Progress Overview
                </Typography>
                <Chip
                  icon={<TrendingUp size={16} />}
                  label="On Track"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Divider />

              {/* Mock learning track progress */}
              <Stack spacing={2.5}>
                {[
                  { name: "KFC Brand Standards Training", progress: 95, color: "success" },
                  { name: "Food Safety & Hygiene Protocol", progress: 80, color: "primary" },
                  { name: "Customer Service Excellence", progress: 60, color: "info" },
                  { name: "Managerial Leadership Program", progress: 45, color: "warning" },
                ].map((track) => (
                  <Box key={track.name}>
                    <Box display="flex" justifyContent="space-between" mb={0.75}>
                      <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                        {track.name}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="text.secondary">
                        {track.progress}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: "100%",
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "grey.100",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${track.progress}%`,
                          height: "100%",
                          borderRadius: 4,
                          bgcolor: `${track.color}.main`,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Side: Latest Members */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Active Members
            </Typography>

            <Divider sx={{ mb: 1 }} />

            <List sx={{ flexGrow: 1 }}>
              {displayUsers.slice(0, 3).map((orgUser) => (
                <ListItem
                  key={orgUser.guid}
                  disableGutters
                  secondaryAction={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={orgUser.is_active ? "Active" : "Inactive"}
                        color={orgUser.is_active ? "success" : "default"}
                        variant={orgUser.is_active ? "filled" : "outlined"}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openDeleteUserDialog(orgUser)}
                        disabled={deleteUserMutation.isPending}
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "primary.light", color: "primary.main", fontWeight: 700 }}>
                      {orgUser.first_name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${orgUser.first_name} ${orgUser.last_name}`}
                    secondary={orgUser.email}
                    primaryTypographyProps={{ fontWeight: 600, variant: "subtitle2" }}
                    secondaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                  />
                </ListItem>
              ))}
            </List>

            <Button
              fullWidth
              variant="text"
              color="primary"
              endIcon={<ArrowRight size={18} />}
              onClick={() => navigate(usersPath)}
              sx={{
                mt: 2,
                textTransform: "none",
                fontWeight: 700,
                justifyContent: "center",
              }}
            >
              View all members
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Bulk Course Assignment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assign one or more courses to one or more users directly from the org admin dashboard.
                  </Typography>
                </Box>
                <Chip
                  label={selectedModeText}
                  color={hasSelection ? "success" : "default"}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <ToggleButtonGroup
                value={assignmentMode}
                exclusive
                size="small"
                onChange={handleModeChange}
                aria-label="assignment-mode"
              >
                <ToggleButton value="user-first">
                  User(s) → Course(s)
                </ToggleButton>
                <ToggleButton value="course-first">
                  Course(s) → User(s)
                </ToggleButton>
              </ToggleButtonGroup>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={displayUsers}
                    value={selectedUsers}
                    getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.email})`}
                    isOptionEqualToValue={(option, value) => option.guid === value.guid}
                    onChange={(_, value) => setSelectedUsers(value)}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          style={{ marginRight: 8 }}
                          checked={selected}
                          size="small"
                        />
                        {option.first_name} {option.last_name} — {option.email}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          assignmentMode === "course-first"
                            ? "Select Users (target users)"
                            : "Select Users"
                        }
                        placeholder={
                          assignmentMode === "course-first"
                            ? "Choose one or more users to receive selected courses"
                            : "Choose users"
                        }
                        helperText="Pick one or more users to enroll in courses."
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={availableCoursesForSelection}
                    value={selectedCourse}
                    getOptionLabel={(option) => option.title}
                    isOptionEqualToValue={(option, value) => option.guid === value.guid}
                    onChange={(_, value) => setSelectedCourse(value)}
                    loading={coursesLoading}
                    noOptionsText={
                      coursesError
                        ? "Could not load courses from API."
                        : selectedUsers.length > 0 && availableCoursesForSelection.length === 0
                        ? "All courses are already assigned to selected users"
                        : "No courses available."
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          assignmentMode === "user-first"
                            ? "Select Course (course to assign)"
                            : "Select Course"
                        }
                        placeholder={
                          assignmentMode === "user-first"
                            ? "Choose a course for selected users"
                            : "Choose a course"
                        }
                        helperText={selectedUsers.length > 0 
                          ? "Choose a course that none of the selected users already have."
                          : "Pick a course available in your org."}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Alert severity="info" iconMapping={{ info: <ShieldCheck size={18} /> }}>
                Selected users who do not already have the chosen course will be enrolled.
              </Alert>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAssignCourses}
                  disabled={!hasSelection || assignMutation.isPending}
                  sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}
                >
                  {assignMutation.isPending ? "Assigning..." : "Assign Course"}
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => {
                    setSelectedUsers([]);
                    setSelectedCourse(null);
                  }}
                  sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
                >
                  Clear Selection
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {selectedUsers.length} user(s) selected · {selectedCourse ? 1 : 0} course(s) selected
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Recent Assignment History
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Latest course enrollments made from the org admin dashboard.
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${(assignmentHistory.length > 0 ? assignmentHistory : recentHistorySeed).length} recent record(s)`}
                />
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Courses</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupedAssignmentHistory.map(({ user, courses: userCourses }) => (
                      <React.Fragment key={user.userGuid}>
                        <TableRow hover>
                          <TableCell sx={{ fontWeight: 600 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <IconButton
                                size="small"
                                onClick={() => toggleUserExpansion(user.userGuid)}
                              >
                                {expandedUsers.has(user.userGuid) ? <BookOpen size={16} /> : <BookOpen size={16} />}
                              </IconButton>
                              {user.userName}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {userCourses.length} course{userCourses.length !== 1 ? 's' : ''}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Plus size={14} />}
                                onClick={() => handleOpenAddCourseDialog(user.userGuid, user.userName)}
                                disabled={addCourseMutation.isPending}
                                sx={{ textTransform: "none" }}
                              >
                                Add Course
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                        {expandedUsers.has(user.userGuid) && userCourses.map((course) => (
                          <TableRow key={course.id} hover sx={{ bgcolor: "grey.50" }}>
                            <TableCell sx={{ pl: 6 }}>
                              <Typography variant="body2">{course.courseTitle}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(course.assignedAt).toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                variant="outlined"
                                color={course.mode === "user-first" ? "primary" : "secondary"}
                                label={course.mode === "user-first" ? "User(s) -> Course(s)" : "Course(s) -> User(s)"}
                              />
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveCourse(course)}
                                disabled={removeCourseMutation.isPending}
                                title="Remove course"
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                    {groupedAssignmentHistory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography variant="body2" color="text.secondary">
                            No assignments yet. Assign courses above to populate history.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Course Dialog */}
      <Dialog
        open={addCourseDialog.open}
        onClose={() => setAddCourseDialog({ open: false, userGuid: null, userName: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Course to {addCourseDialog.userName}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Autocomplete
            options={courses.filter(course => !isCourseEnrolled(userEnrolledCourses, course.guid))}
            getOptionLabel={(option) => option.title}
            value={selectedCourseToAdd}
            onChange={(_, value) => setSelectedCourseToAdd(value)}
            noOptionsText={courses.filter(course => !isCourseEnrolled(userEnrolledCourses, course.guid)).length === 0 
              ? "All courses are already assigned to this user" 
              : "No courses available"}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Course"
                placeholder="Choose a course to add"
                fullWidth
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddCourseDialog({ open: false, userGuid: null, userName: null });
              setSelectedCourseToAdd(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddCourseConfirm}
            disabled={!selectedCourseToAdd || addCourseMutation.isPending}
          >
            {addCourseMutation.isPending ? "Adding..." : "Add Course"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog
        open={deleteUserDialogOpen}
        onClose={() => setDeleteUserDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>
              {userToDelete?.first_name} {userToDelete?.last_name}
            </strong>
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteUserDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default OrgDashboard;
