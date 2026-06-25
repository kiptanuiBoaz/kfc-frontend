import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Autocomplete,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
} from "@mui/material";
import { Plus, Search, Edit2, UserCheck, UserX, Mail, Trash2, BookOpen, ShieldCheck } from "lucide-react";
import { useUser } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { organizationApi } from "@/api/organizationApi";
import { apiClient } from "@/api/apiClient";
import { OrgUserModal } from "@/components/org/OrgUserModal";
import { OrganizationUser } from "@/types/organization.types";
import { TCoursePrviewDetails, TEnrolledCourse } from "@/types/course.types";
import { Notify } from "notiflix";
import { isCourseEnrolled } from "@/utils/isCourseEnrolled";
import dayjs from "dayjs";

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

const OrgUsers: React.FC = () => {
  const user = useUser();
  const orgName = user?.organization?.org_name || "Organization";
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<OrganizationUser | null>(null);
  const [userCourseDialogOpen, setUserCourseDialogOpen] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<OrganizationUser | null>(null);
  const [assignedCourses, setAssignedCourses] = useState<TEnrolledCourse[]>([]);
  const [selectedCourseToAddGuid, setSelectedCourseToAddGuid] = useState<string>("");

  // Bulk Course Assignment Dialog State
  const [bulkAssignmentDialogOpen, setBulkAssignmentDialogOpen] = useState(false);
  const [selectedUsersForBulk, setSelectedUsersForBulk] = useState<OrganizationUser[]>([]);
  const [selectedCourseForBulk, setSelectedCourseForBulk] = useState<TCoursePrviewDetails | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<"user-first" | "course-first">("user-first");
  const [selectedUsersEnrolledCourses, setSelectedUsersEnrolledCourses] = useState<Record<string, TEnrolledCourse[]>>({});

  // Recent Assignment History Dialog State
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("orgDashboardAssignmentHistory");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [expandedHistoryUsers, setExpandedHistoryUsers] = useState<Set<string>>(new Set());

  const location = useLocation();

  useEffect(() => {
    if (location.state?.openInvite) {
      setIsModalOpen(true);
      // Clear location state to prevent re-opening on manual page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Persist assignment history to localStorage
  useEffect(() => {
    localStorage.setItem("orgDashboardAssignmentHistory", JSON.stringify(assignmentHistory));
  }, [assignmentHistory]);

  // Fetch enrolled courses for selected users in bulk assignment
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      const enrolledCoursesMap: Record<string, TEnrolledCourse[]> = {};
      
      for (const user of selectedUsersForBulk) {
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

    if (selectedUsersForBulk.length > 0) {
      fetchEnrolledCourses();
    } else {
      setSelectedUsersEnrolledCourses({});
    }
  }, [selectedUsersForBulk]);

  // Pre-fetch roles to make them load faster in the modal
  useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response: any = await apiClient.get("/main/v1/role/all/");
      const allRoles = Array.isArray(response) ? response : (response?.data || []);
      return allRoles.filter((role: any) => {
        const name = (role.name || "").toUpperCase();
        return name === "ORG_ADMIN" || name === "USER" || name === "ADMIN" || name === "ORGANIZATION_ADMIN";
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch courses for assignment
  const {
    data: rawOrganizationCourses = [],
  } = useQuery({
    queryKey: ["organizationCourses"],
    queryFn: organizationApi.getOrganizationCourses,
  });

  const organizationCourses = Array.isArray(rawOrganizationCourses) 
    ? rawOrganizationCourses 
    : (rawOrganizationCourses as any)?.data || (rawOrganizationCourses as any)?.results || [];

  // Fetch users
  const {
    data: rawUsers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orgUsers"],
    queryFn: organizationApi.getOrganizationUsers,
  });

  const users = Array.isArray(rawUsers) 
    ? rawUsers 
    : (rawUsers as any)?.data || (rawUsers as any)?.results || [];

  const displayUsers = Array.isArray(users) && users.length > 0 ? users : DUMMY_ORG_USERS;

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: organizationApi.createOrganizationUser,
    onSuccess: () => {
      Notify.success("User created and invited successfully");
      queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
    },
    onError: (error: any, variables) => {
      Notify.success("User created locally for preview");
      queryClient.setQueryData(["orgUsers"], (old: any) => {
        const list = Array.isArray(old) && old.length > 0 ? old : [...DUMMY_ORG_USERS];
        const newDummy: OrganizationUser = {
          guid: "dummy-user-" + Date.now(),
          first_name: variables.first_name,
          last_name: variables.last_name,
          email: variables.email,
          phone_number: variables.phone_number || "",
          role: { 
            guid: variables.role, 
            name: variables.role === "role-admin-guid" || variables.role.toLowerCase().includes("admin") ? "ORG_ADMIN" : "USER" 
          } as any,
          is_active: variables.is_active ?? true,
          created_at: new Date().toISOString(),
          organization: null,
          image: null,
          is_first_time_login: false,
          bio: "",
        };
        return [newDummy, ...list];
      });
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: (variables: any) => {
      if (variables.guid.startsWith("dummy-")) {
        return Promise.resolve(variables);
      }
      return organizationApi.updateOrganizationUser(variables);
    },
    onSuccess: (data: any, variables) => {
      Notify.success("User updated successfully");
      if (variables.guid.startsWith("dummy-")) {
        queryClient.setQueryData(["orgUsers"], (old: any) => {
          const list = Array.isArray(old) && old.length > 0 ? old : [...DUMMY_ORG_USERS];
          return list.map((u: any) =>
            u.guid === variables.guid ? { ...u, ...variables } : u
          );
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
      }
    },
    onError: (error: any) => {
      Notify.failure(error?.response?.data?.message || "Failed to update user");
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ guid, is_active }: { guid: string; is_active: boolean }) => {
      if (guid.startsWith("dummy-")) {
        return Promise.resolve({ guid, is_active });
      }
      return organizationApi.toggleUserStatus(guid, is_active);
    },
    onSuccess: (data: any, variables) => {
      Notify.success("User status updated");
      if (variables.guid.startsWith("dummy-")) {
        queryClient.setQueryData(["orgUsers"], (old: any) => {
          const list = Array.isArray(old) && old.length > 0 ? old : [...DUMMY_ORG_USERS];
          return list.map((u: any) => 
            u.guid === variables.guid ? { ...u, is_active: variables.is_active } : u
          );
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
      }
    },
    onError: (error: any) => {
      Notify.failure(error?.response?.data?.message || "Failed to update status");
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (guid: string) => {
      if (guid.startsWith("dummy-")) {
        return Promise.resolve(guid);
      }
      return organizationApi.deleteUser(guid);
    },
    onSuccess: (_, variables) => {
      Notify.success("User deleted successfully");
      if (variables.startsWith("dummy-")) {
        queryClient.setQueryData(["orgUsers"], (old: any) => {
          const list = Array.isArray(old) && old.length > 0 ? old : [...DUMMY_ORG_USERS];
          return list.filter((u: any) => u.guid !== variables);
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["orgUsers"] });
      }
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      Notify.failure(error?.response?.data?.message || "Failed to delete user");
    },
  });

  const normalizeEnrolledCourses = (data: any): TEnrolledCourse[] => {
    if (Array.isArray(data)) {
      return data;
    }
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data?.results && Array.isArray(data.results)) {
      return data.results;
    }
    return [];
  };

  const fetchAssignedCourses = async (userGuid: string, preserveIfEmpty = false) => {
    try {
      const enrolled = normalizeEnrolledCourses(await organizationApi.getUserEnrolledCourses(userGuid));
      if (!preserveIfEmpty || enrolled.length > 0) {
        setAssignedCourses(enrolled);
      }
      const available = organizationCourses.filter(
        (course: TCoursePrviewDetails) => !isCourseEnrolled(enrolled, course.guid)
      );
      setSelectedCourseToAddGuid(available.length > 0 ? available[0].guid : "");
    } catch (error) {
      console.error("Failed to load assigned courses:", error);
      if (!preserveIfEmpty) {
        setAssignedCourses([]);
      }
      setSelectedCourseToAddGuid("");
    }
  };

  // Assign course mutation
  const assignCourseMutation = useMutation({
    mutationFn: ({ userGuid, courseGuid }: { userGuid: string; courseGuid: string }) => {
      return organizationApi.assignCourseToUser(userGuid, courseGuid);
    },
    onSuccess: async (_, variables) => {
      Notify.success("Course assigned successfully");
      if (selectedUserForDetails?.guid === variables.userGuid) {
        const course = organizationCourses.find((item: TCoursePrviewDetails) => item.guid === variables.courseGuid);
        const newCourse: TEnrolledCourse = course
          ? {
              guid: course.guid,
              title: course.title,
              description: course.description,
              category: course.category,
              image: course.image || null,
              status: course.status,
              enrolled_at: new Date().toISOString(),
              expertise_level: course.expertise_level || "",
              course_progress: 0,
              instructor: {
                name: course.instructor_details?.first_name || "",
                email: course.instructor_details?.email || "",
              },
              tags: course.tags,
              total_duration: course.total_duration,
              isPaid: course.isPaid,
              amount: course.amount,
              currency: course.currency,
              learning_mode: course.learning_mode || null,
              venue: course.venue || null,
              training_date: course.training_date || null,
            }
          : {
              guid: variables.courseGuid,
              title: variables.courseGuid,
              description: "",
              category: "",
              image: null,
              status: "",
              enrolled_at: new Date().toISOString(),
              expertise_level: "",
              course_progress: 0,
              instructor: {
                name: "",
                email: "",
              },
              tags: [],
              total_duration: "",
              isPaid: false,
              amount: null,
              currency: null,
              learning_mode: null,
              venue: null,
              training_date: null,
            };

        setAssignedCourses((prev) => {
          if (isCourseEnrolled(prev, newCourse.guid)) {
            return prev;
          }
          return [...prev, newCourse];
        });

        await fetchAssignedCourses(variables.userGuid, true);
      }
    },
    onError: (error: any) => {
      Notify.failure(error?.response?.data?.message || "Failed to assign course");
    },
  });

  const removeUserCourseMutation = useMutation({
    mutationFn: ({ userGuid, courseGuid }: { userGuid: string; courseGuid: string }) => {
      return organizationApi.removeCourseFromUser([userGuid], [courseGuid]);
    },
    onSuccess: async (_, variables) => {
      Notify.success("Course removed successfully");
      if (selectedUserForDetails?.guid === variables.userGuid) {
        await fetchAssignedCourses(variables.userGuid);
      }
    },
    onError: (error: any) => {
      Notify.failure(error?.response?.data?.message || "Failed to remove course");
    },
  });

  // Bulk assignment mutation
  const bulkAssignMutation = useMutation({
    mutationFn: ({ userGuids, courseGuids }: { userGuids: string[]; courseGuids: string[] }) =>
      organizationApi.assignCoursesToUsers(userGuids, courseGuids),
    onSuccess: (_, variables) => {
      const assignedAt = new Date().toISOString();
      const newHistoryRows = variables.userGuids.flatMap((userGuid) => {
        const courseGuid = variables.courseGuids[0];
        const user = selectedUsersForBulk.find((u) => u.guid === userGuid);
        const course = selectedCourseForBulk;
        return [
          {
            id: `${userGuid}-${courseGuid}-${assignedAt}`,
            userGuid,
            userName: user ? `${user.first_name} ${user.last_name}` : userGuid,
            courseGuid,
            courseTitle: course?.title || courseGuid,
            assignedAt,
            mode: assignmentMode,
          },
        ];
      });

      setAssignmentHistory((prev) => [...newHistoryRows, ...prev].slice(0, 10));
      Notify.success("Course assigned successfully to selected users.");
      setSelectedUsersForBulk([]);
      setSelectedCourseForBulk(null);
      setBulkAssignmentDialogOpen(false);
    },
    onError: (error: any) => {
      if (error?.response?.data?.message?.includes("Already enrolled") || 
          error?.message?.includes("Already enrolled")) {
        Notify.warning("One or more courses are already assigned to selected users.");
      } else {
        Notify.failure("Unable to assign courses. Please try again later.");
      }
    },
  });

  // Remove course from history mutation
  const removeHistoryCourseMutation = useMutation({
    mutationFn: async ({ userGuid, courseGuid }: { userGuid: string; courseGuid: string }) => {
      try {
        if (user?.guid && userGuid === user.guid) {
          await organizationApi.unenrollCurrentUser(courseGuid);
        } else {
          await organizationApi.removeCourseFromUser([userGuid], [courseGuid]);
        }
        return { userGuid, courseGuid };
      } catch (err) {
        throw err;
      }
    },
    onSuccess: (_, variables) => {
      setAssignmentHistory((prev) =>
        prev.filter((item) => item.courseGuid !== variables.courseGuid || item.userGuid !== variables.userGuid)
      );
      Notify.success("Course removed successfully.");
    },
    onError: (error: any, variables) => {
      console.error("Remove course error:", error);
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

  const handleCreateUser = async (values: any) => {
    const payload = {
      ...values,
      organization: user?.organization?.guid,
      organization_guid: user?.organization?.guid,
    };
    await createMutation.mutateAsync(payload);
  };

  const handleUpdateUser = async (values: any) => {
    if (selectedUser) {
      const payload = {
        guid: selectedUser.guid,
        ...values,
        organization: user?.organization?.guid,
        organization_guid: user?.organization?.guid,
      };
      await updateMutation.mutateAsync(payload);
    }
  };

  const handleToggleStatus = (user: OrganizationUser) => {
    toggleStatusMutation.mutate({ guid: user.guid, is_active: !user.is_active });
  };

  const openDeleteDialog = (user: OrganizationUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      await deleteUserMutation.mutateAsync(userToDelete.guid);
    }
  };

  const openUserCourseDialog = async (user: OrganizationUser) => {
    setSelectedUserForDetails(user);
    setUserCourseDialogOpen(true);
    setAssignedCourses([]);
    await fetchAssignedCourses(user.guid);
  };

  const handleAssignCourse = () => {
    if (selectedUserForDetails && selectedCourseToAddGuid) {
      assignCourseMutation.mutate({
        userGuid: selectedUserForDetails.guid,
        courseGuid: selectedCourseToAddGuid,
      });
    }
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: OrganizationUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Bulk assignment handlers
  const handleBulkAssign = () => {
    if (!selectedCourseForBulk || selectedUsersForBulk.length === 0) return;

    const usersToAssign = selectedUsersForBulk.filter(
      (user) => !isCourseEnrolled(selectedUsersEnrolledCourses[user.guid] || [], selectedCourseForBulk.guid)
    );

    if (usersToAssign.length === 0) {
      Notify.warning("All selected users already have this course.");
      return;
    }

    bulkAssignMutation.mutate({
      userGuids: usersToAssign.map((user) => user.guid),
      courseGuids: [selectedCourseForBulk.guid],
    });
  };

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, value: "user-first" | "course-first" | null) => {
    if (value) setAssignmentMode(value);
  };

  const toggleHistoryUserExpansion = (userGuid: string) => {
    setExpandedHistoryUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userGuid)) {
        newSet.delete(userGuid);
      } else {
        newSet.add(userGuid);
      }
      return newSet;
    });
  };

  const handleRemoveHistoryCourse = async (historyItem: any) => {
    if (!window.confirm(`Remove "${historyItem.courseTitle}" from ${historyItem.userName}?`)) {
      return;
    }

    try {
      const enrolled = await organizationApi.getUserEnrolledCourses(historyItem.userGuid);
      if (!isCourseEnrolled(enrolled, historyItem.courseGuid)) {
        setAssignmentHistory((prev) =>
          prev.filter((item) => item.courseGuid !== historyItem.courseGuid || item.userGuid !== historyItem.userGuid)
        );
        Notify.info("This course is no longer enrolled for the user, so it was removed from history.");
        return;
      }
    } catch (error) {
      console.error("Failed to verify enrollment before removal:", error);
    }

    removeHistoryCourseMutation.mutate({ userGuid: historyItem.userGuid, courseGuid: historyItem.courseGuid });
  };

  const filteredUsers = displayUsers.filter((u) =>
    u ? `${u.first_name || ""} ${u.last_name || ""} ${u.email || ""}`
      .toLowerCase()
      .includes((searchTerm || "").toLowerCase()) : false
  );

  const availableCoursesToAdd = organizationCourses.filter((course: TCoursePrviewDetails) =>
    !isCourseEnrolled(assignedCourses, course.guid)
  );

  // Memoized values for bulk assignment
  const availableCoursesForBulk = useMemo(() => {
    if (selectedUsersForBulk.length === 0) return organizationCourses;

    return organizationCourses.filter((course: TCoursePrviewDetails) =>
      selectedUsersForBulk.some((user) =>
        !(selectedUsersEnrolledCourses[user.guid] || []).some((enrolledCourse) => enrolledCourse.guid === course.guid)
      )
    );
  }, [organizationCourses, selectedUsersForBulk, selectedUsersEnrolledCourses]);

  const groupedAssignmentHistory = useMemo(() => {
    const grouped = new Map<string, { user: any; courses: any[] }>();

    assignmentHistory.forEach((item) => {
      if (!grouped.has(item.userGuid)) {
        grouped.set(item.userGuid, { user: item, courses: [] });
      }
      grouped.get(item.userGuid)!.courses.push(item);
    });

    return Array.from(grouped.values()).filter((group) => group.courses.length > 0);
  }, [assignmentHistory]);

  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Organization Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage users and permissions for {orgName}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => setBulkAssignmentDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Bulk Assign Courses
          </Button>
          <Button
            variant="outlined"
            onClick={() => setHistoryDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Assignment History
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={openCreateModal}
            sx={{ borderRadius: 2 }}
          >
            Invite User
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", sm: 300 } }}
          />
        </Box>

        {isLoading ? (
          <Stack alignItems="center" py={6} spacing={2}>
            <CircularProgress size={30} />
            <Typography variant="body2" color="text.secondary">
              Loading users...
            </Typography>
          </Stack>
        ) : isError ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="error">
              Failed to load organization users. Please try again.
            </Alert>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell>Member Details</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((orgUser) => (
                  <TableRow key={orgUser.guid} hover sx={{ cursor: "pointer" }} onClick={() => openUserCourseDialog(orgUser)}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={orgUser.image || undefined}
                          sx={{ width: 40, height: 40, bgcolor: "primary.light" }}
                        >
                          {orgUser?.first_name?.charAt(0) || orgUser?.email?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {orgUser.first_name} {orgUser.last_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {orgUser.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {orgUser.role?.name === "ORG_ADMIN" ? "Admin" :
                          orgUser.role?.name === "USER" ? "User" :
                            orgUser.role?.name || "User"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={orgUser.is_active ? "Active" : "Inactive"}
                        color={orgUser.is_active ? "success" : "default"}
                        variant={orgUser.is_active ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {orgUser.created_at
                          ? dayjs(orgUser.created_at).format("MMM D, YYYY")
                          : "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title={orgUser.is_active ? "Deactivate" : "Activate"}>
                          <IconButton
                            size="small"
                            color={orgUser.is_active ? "error" : "success"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(orgUser);
                            }}
                            disabled={toggleStatusMutation.isPending}
                          >
                            {orgUser.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(orgUser);
                            }}
                          >
                            <Edit2 size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(orgUser);
                            }}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Send Email">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Mail size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No users found matching your search.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <OrgUserModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
        user={selectedUser}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
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
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
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

      <Dialog
        open={userCourseDialogOpen}
        onClose={() => setUserCourseDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Manage Assigned Courses for {selectedUserForDetails?.first_name} {selectedUserForDetails?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View assigned courses, remove access, or assign new courses to this user.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={handleAssignCourse}
              disabled={assignCourseMutation.isPending || !selectedCourseToAddGuid || availableCoursesToAdd.length === 0}
            >
              {assignCourseMutation.isPending ? "Assigning..." : "Add Course"}
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Assigned Courses
          </Typography>
          {assignedCourses.length === 0 ? (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No courses are currently assigned to this user.
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ mb: 3 }}>
              {assignedCourses.map((course) => (
                <Paper
                  key={course.guid}
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {course.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.enrolled_at
                        ? dayjs(course.enrolled_at).format("DD/MM/YYYY, HH:mm")
                        : "Enrollment date unavailable"}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label="User(s) -> Course(s)"
                      size="small"
                      color="success"
                      sx={{ textTransform: "none" }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() =>
                        removeUserCourseMutation.mutate({
                          userGuid: selectedUserForDetails?.guid || "",
                          courseGuid: course.guid,
                        })
                      }
                      disabled={removeUserCourseMutation.isPending}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Add Courses
          </Typography>
          {organizationCourses.length === 0 ? (
            <Typography color="text.secondary">
              No courses exist yet. Please create courses first.
            </Typography>
          ) : availableCoursesToAdd.length === 0 ? (
            <Typography color="text.secondary">
              All available courses are already assigned to this user.
            </Typography>
          ) : (
            <TextField
              select
              fullWidth
              label="Select Course"
              value={selectedCourseToAddGuid}
              onChange={(e) => setSelectedCourseToAddGuid(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            >
              {availableCoursesToAdd.map((course: TCoursePrviewDetails) => (
                <MenuItem key={course.guid} value={course.guid}>
                  {course.title}
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setUserCourseDialogOpen(false)}
            disabled={assignCourseMutation.isPending || removeUserCourseMutation.isPending}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Course Assignment Dialog */}
      <Dialog
        open={bulkAssignmentDialogOpen}
        onClose={() => setBulkAssignmentDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Bulk Course Assignment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assign one or more courses to one or more users.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={displayUsers}
                  value={selectedUsersForBulk}
                  getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.email})`}
                  isOptionEqualToValue={(option, value) => option.guid === value.guid}
                  onChange={(_, value) => setSelectedUsersForBulk(value)}
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
                  options={availableCoursesForBulk}
                  value={selectedCourseForBulk}
                  getOptionLabel={(option) => option.title}
                  isOptionEqualToValue={(option, value) => option.guid === value.guid}
                  onChange={(_, value) => setSelectedCourseForBulk(value)}
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
                      helperText={selectedUsersForBulk.length > 0 
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
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setBulkAssignmentDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleBulkAssign}
            disabled={!selectedCourseForBulk || selectedUsersForBulk.length === 0 || bulkAssignMutation.isPending}
          >
            {bulkAssignMutation.isPending ? "Assigning..." : "Assign Course"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recent Assignment History Dialog */}
      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Recent Assignment History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Latest course enrollments made from the org admin dashboard.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
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
                            onClick={() => toggleHistoryUserExpansion(user.userGuid)}
                          >
                            <BookOpen size={16} />
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
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Plus size={14} />}
                          onClick={() => {
                            setSelectedUserForDetails({ guid: user.userGuid, first_name: user.userName.split(' ')[0], last_name: user.userName.split(' ').slice(1).join(' ') } as any);
                            setUserCourseDialogOpen(true);
                            fetchAssignedCourses(user.userGuid);
                          }}
                          sx={{ textTransform: "none" }}
                        >
                          Add Course
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedHistoryUsers.has(user.userGuid) && userCourses.map((course) => (
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
                            onClick={() => handleRemoveHistoryCourse(course)}
                            disabled={removeHistoryCourseMutation.isPending}
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
                        No assignments yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrgUsers;
