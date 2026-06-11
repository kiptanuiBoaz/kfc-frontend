import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { organizationApi } from "@/api/organizationApi";
import { Box, Button, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Plus } from "lucide-react";

const OrgEnrollments: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const orgGuid = user?.organization?.guid || "";
  const usersPath = `/org/${orgGuid}/users`;

  const { data: enrollments = [], isLoading, isError } = useQuery({
    queryKey: ["orgEnrollments", orgGuid],
    queryFn: () => organizationApi.getOrganizationEnrollments(orgGuid),
  });

  // helpful console output while debugging
  // eslint-disable-next-line no-console
  console.debug("OrgEnrollments: fetched", { orgGuid, enrollments, isLoading, isError });

  return (
    <Stack spacing={3} sx={{ py: 3, px: { xs: 2, md: 4 } }}>
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
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Enrollments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View all organization enrollments and assign training from the org dashboard.
          </Typography>
        </Box>
        
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Organization enrollment list
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error">Failed to load enrollments. Please try again later.</Typography>
        ) : enrollments.length === 0 ? (
          <Typography color="text.secondary">No enrollments found yet.</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Enrolled At</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.map((enrollment: any, idx: number) => {
                  const userName = enrollment.userName || enrollment.user_name || enrollment.user?.name || `${enrollment.user_first_name || enrollment.user?.first_name || ""} ${enrollment.user_last_name || enrollment.user?.last_name || ""}`.trim() || "Unknown";
                  const userEmail = enrollment.userEmail || enrollment.user?.email || enrollment.email || "";
                  const courseTitle = enrollment.courseTitle || enrollment.course?.title || enrollment.course_title || "-";
                  const enrolledAt = enrollment.enrolledAt || enrollment.enrolled_at || enrollment.created_at || enrollment.timestamp || null;
                  const status = enrollment.status || enrollment.enrollment_status || "Active";

                  return (
                    <TableRow key={enrollment.id || `${enrollment.userGuid || enrollment.user?.guid || idx}-${enrollment.courseGuid || enrollment.course?.guid || idx}-${enrolledAt || idx}`}>
                      <TableCell>{userName}</TableCell>
                      <TableCell>{userEmail || "—"}</TableCell>
                      <TableCell>{courseTitle}</TableCell>
                      <TableCell>{enrolledAt ? new Date(enrolledAt).toLocaleString() : "—"}</TableCell>
                      <TableCell>{status}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
    </Stack>
  );
};

export default OrgEnrollments;
