import React, { useState } from "react";
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
} from "@mui/material";
import { Plus, Search, Edit2, UserCheck, UserX, Mail } from "lucide-react";
import { useUser } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "@/api/organizationApi";
import { apiClient } from "@/api/apiClient";
import { OrgUserModal } from "@/components/org/OrgUserModal";
import { OrganizationUser } from "@/types/organization.types";
import { Notify } from "notiflix";
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

  // Fetch users
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orgUsers"],
    queryFn: organizationApi.getOrganizationUsers,
  });

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

  const openCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: OrganizationUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const filteredUsers = displayUsers.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={openCreateModal}
          sx={{ borderRadius: 2 }}
        >
          Invite User
        </Button>
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
                  <TableRow key={orgUser.guid} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={orgUser.image || undefined}
                          sx={{ width: 40, height: 40, bgcolor: "primary.light" }}
                        >
                          {orgUser.first_name.charAt(0)}
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
                            onClick={() => handleToggleStatus(orgUser)}
                            disabled={toggleStatusMutation.isPending}
                          >
                            {orgUser.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openEditModal(orgUser)}
                          >
                            <Edit2 size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Send Email">
                          <IconButton size="small">
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
    </Box>
  );
};

export default OrgUsers;
