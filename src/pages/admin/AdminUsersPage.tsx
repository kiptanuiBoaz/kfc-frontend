import React, { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
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
import { Edit2, Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthUser, TRole, User } from "@/types/auth.types";
import { apiClient } from "@/api/apiClient";
import { UserModal } from "@/components/admin/UserModal";
import { Notify } from "notiflix";
import dayjs from "dayjs";

const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);

  // Fetch all users
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<AuthUser[]>({
    queryKey: ["adminUsers"],
    queryFn: () => apiClient.get<AuthUser[]>("/main/v1/user/all/"),
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: any) =>
      apiClient.post("/main/v1/user/admin_create/", userData),
    onSuccess: () => {
      Notify.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (error) => {
      Notify.failure(
        error instanceof Error ? error.message : "Failed to create user"
      );
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ guid, userData }: { guid: string; userData: any }) =>
      apiClient.patch(`/main/v1/user/update/${guid}/`, userData),
    onSuccess: () => {
      Notify.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (error) => {
      Notify.failure(
        error instanceof Error ? error.message : "Failed to update user"
      );
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (guid: string) =>
      apiClient.delete(`/main/v1/user/delete/${guid}/`),
    onSuccess: () => {
      Notify.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      Notify.failure(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    },
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ guid, is_active }: { guid: string; is_active: boolean }) =>
      apiClient.patch(`/main/v1/user/update/${guid}/`, { is_active }),
    onSuccess: () => {
      Notify.success("User status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (error) => {
      Notify.failure(
        error instanceof Error ? error.message : "Failed to update user status"
      );
    },
  });

  const handleCreateUser = async (userData: any) => {
    await createUserMutation.mutateAsync(userData);
  };

  const handleUpdateUser = async (userData: any) => {
    if (selectedUser) {
      await updateUserMutation.mutateAsync({
        guid: selectedUser.guid,
        userData,
      });
    }
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      await deleteUserMutation.mutateAsync(userToDelete.guid);
    }
  };

  const handleToggleStatus = async (user: AuthUser) => {
    await toggleStatusMutation.mutateAsync({
      guid: user.guid,
      is_active: !user.is_active,
    });
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: AuthUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (user: AuthUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const renderRoleChip = (role: string | null) => {
    const label = role ? role.toUpperCase() : "USER";
    const roleColors: Record<
      string,
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "info"
      | "success"
      | "warning"
    > = {
      ADMIN: "error",
      INSTRUCTOR: "primary",
      USER: "default",
    };

    return (
      <Chip
        size="small"
        label={label || "USER"}
        color={roleColors[label || "USER"]}
        sx={{ textTransform: "capitalize" }}
        variant="outlined"
      />
    );
  };

  const renderStatusChip = (isActive: boolean) => {
    return (
      <Chip
        size="small"
        label={isActive ? "Active" : "Inactive"}
        color={isActive ? "success" : "error"}
        variant={isActive ? "filled" : "outlined"}
      />
    );
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              User Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage user accounts, roles, and permissions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={openCreateModal}
          >
            Add User
          </Button>
        </Stack>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
        {isLoading && (
          <Stack alignItems="center" py={6} spacing={2}>
            <CircularProgress />
            <Typography>Loading users...</Typography>
          </Stack>
        )}

        {isError && (
          <Alert severity="error">
            Unable to load users right now. Please try again shortly.
          </Alert>
        )}

        {!isLoading && !isError && (
          <TableContainer>
            <Table sx={{ p: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.guid} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={user.image || undefined}
                          sx={{ width: 40, height: 40 }}
                        >
                          {user.first_name?.[0]?.toUpperCase() ||
                            user.email?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>
                            {user.first_name} {user.last_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{renderRoleChip(user.role.name)}</TableCell>
                    <TableCell>{renderStatusChip(user.is_active)}</TableCell>
                    <TableCell>{user.phone_number || "--"}</TableCell>
                    <TableCell>
                      {user.created_at
                        ? dayjs(user.created_at).format("MMM D, YYYY")
                        : "--"}
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        alignItems="center"
                      >
                        <Tooltip
                          title={user.is_active ? "Deactivate" : "Activate"}
                        >
                          <IconButton
                            color={user.is_active ? "error" : "success"}
                            disabled={toggleStatusMutation.isPending}
                            onClick={() => handleToggleStatus(user)}
                          >
                            {user.is_active ? (
                              <UserX size={18} />
                            ) : (
                              <UserCheck size={18} />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit user">
                          <IconButton
                            color="primary"
                            onClick={() => openEditModal(user)}
                          >
                            <Edit2 size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete user">
                          <IconButton
                            color="error"
                            onClick={() => openDeleteDialog(user)}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        No users found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* User Modal */}
      <UserModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
        user={selectedUser}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
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
    </>
  );
};

export default AdminUsersPage;
