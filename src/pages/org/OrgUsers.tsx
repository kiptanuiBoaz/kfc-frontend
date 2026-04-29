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
} from "@mui/material";
import { Plus, Search, MoreVertical, Mail } from "lucide-react";
import { useUser } from "@/hooks/useAuth";

const OrgUsers: React.FC = () => {
  const user = useUser();
  const orgName = user?.organization?.org_name || "Organization";
  const [searchTerm, setSearchTerm] = useState("");

  // Realistic mock data to show functionality without over-exaggerating
  const mockUsers = [
    { id: 1, name: "Alice Johnson", email: "alice.j@example.com", role: "Manager", status: "Active", lastActive: "2 hours ago" },
    { id: 2, name: "Bob Smith", email: "bob.smith@example.com", role: "Employee", status: "Active", lastActive: "1 day ago" },
    { id: 3, name: "Charlie Davis", email: "cdavis@example.com", role: "Employee", status: "Inactive", lastActive: "2 weeks ago" },
  ];

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
          sx={{ borderRadius: 2 }}
        >
          Invite User
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between" }}>
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

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell>Member Details</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockUsers.map((mockUser) => (
                <TableRow key={mockUser.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.light" }}>
                        {mockUser.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {mockUser.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {mockUser.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {mockUser.role}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={mockUser.status}
                      color={mockUser.status === "Active" ? "success" : "default"}
                      variant={mockUser.status === "Active" ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {mockUser.lastActive}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Send Email">
                        <IconButton size="small" color="primary">
                          <Mail size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More options">
                        <IconButton size="small">
                          <MoreVertical size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default OrgUsers;
