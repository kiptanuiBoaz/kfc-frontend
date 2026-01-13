import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Plus, Edit2, Trash2, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TRole } from "@/types/auth.types";
import { apiClient } from "@/api/apiClient";
import { RoleModal } from "@/components/admin/RoleModal";
import { Notify } from "notiflix";

export const AdminRolesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<TRole | null>(null);

  const {
    data: roles = [],
    isLoading,
    isError,
  } = useQuery<TRole[]>({
    queryKey: ["roles"],
    queryFn: () => apiClient.get<TRole[]>("/main/v1/role/all/"),
  });

  const createMutation = useMutation({
    mutationFn: async (roleData: any) => {
      await apiClient.post("/main/v1/role/create/", roleData);
    },
    onSuccess: () => {
      Notify.success("Role created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminRoles"] });
    },
    onError: () => {
      Notify.failure("Failed to create role. Please try again");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ guid, roleData }: { guid: string; roleData: any }) => {
      await apiClient.patch(`/main/v1/role/update/${guid}/`, roleData);
    },
    onSuccess: () => {
      Notify.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminRoles"] });
    },
    onError: () => {
      Notify.failure("Failed to update role. Please try again");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (guid: string) => {
      await apiClient.delete(`/main/v1/role/delete/${guid}/`);
    },
    onSuccess: () => {
      Notify.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminRoles"] });
    },
    onError: () => {
      Notify.failure("Failed to delete role. Please try again");
    },
  });

  const handleCreateRole = async (roleData: any) => {
    await createMutation.mutateAsync(roleData);
  };

  const handleUpdateRole = async (roleData: any) => {
    if (selectedRole) {
      await updateMutation.mutateAsync({
        guid: selectedRole.guid,
        roleData,
      });
    }
  };

  const handleDeleteRole = async (role: TRole) => {
    if (
      window.confirm(`Are you sure you want to delete the "${role.name}" role?`)
    ) {
      await deleteMutation.mutateAsync(role.guid);
    }
  };

  const handleOpenModal = (role?: TRole) => {
    setSelectedRole(role || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Role Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage user roles and their permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => handleOpenModal()}
        >
          Create Role
        </Button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
        {isLoading && (
          <Stack alignItems="center" py={6} spacing={2}>
            <CircularProgress />
            <Typography>Loading roles...</Typography>
          </Stack>
        )}

        {isError && (
          <Alert severity="error" sx={{ m: 2 }}>
            Unable to load roles right now. Please try again shortly.
          </Alert>
        )}

        {!isLoading && !isError && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight={600}>Role</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>Description</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>Permissions</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>Created</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>Actions</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.guid} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Shield size={20} />
                        <Box>
                          <Typography fontWeight={600}>{role.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {role.guid}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {role.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {/* {renderPermissions(role.permission_id)} */}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(role.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Edit role">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenModal(role)}
                            color="primary"
                          >
                            <Edit2 size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete role">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRole(role)}
                            color="error"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {roles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        No roles found. Create your first role to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <RoleModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={selectedRole ? handleUpdateRole : handleCreateRole}
        role={selectedRole}
        isLoading={
          createMutation.isPending ||
          updateMutation.isPending ||
          deleteMutation.isPending
        }
      />
    </Box>
  );
};
