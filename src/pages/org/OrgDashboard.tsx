import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
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
  Typography,
  useTheme,
} from "@mui/material";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Trash2,
  BookOpen,
} from "lucide-react";
import { AnalyticsCard } from "@/components/shared/AnalyticsCard";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "@/api/organizationApi";
import { OrganizationUser } from "@/types/organization.types";
import { Notify } from "notiflix";

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


const OrgDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const user = useUser();
  const queryClient = useQueryClient();
  const orgName = user?.organization?.org_name || "KFC Kenya";
  const orgGuid = user?.organization?.guid || "";
  const usersPath = `/org/${orgGuid}/users`;
  const enrollmentsPath = `/org/${orgGuid}/enrollments`;

  // Fetch users
  const { data: users = [] } = useQuery({
    queryKey: ["orgUsers"],
    queryFn: organizationApi.getOrganizationUsers,
  });


  const displayUsers = Array.isArray(users) && users.length > 0 ? users : DUMMY_ORG_USERS;
  const activeCount = displayUsers.filter((u) => u.is_active).length;
  const inactiveCount = displayUsers.filter((u) => !u.is_active).length;

  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<OrganizationUser | null>(null);


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
