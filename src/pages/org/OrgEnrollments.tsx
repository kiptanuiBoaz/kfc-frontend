import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "@/api/organizationApi";
import { Box, Button, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { Plus, Trash2, X } from "lucide-react";
import { Notify } from "notiflix";

const OrgEnrollments: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const orgGuid = user?.organization?.guid || "";
  const usersPath = `/org/${orgGuid}/users`;
  const queryClient = useQueryClient();

  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const removeEnrollmentMutation = useMutation({
    mutationFn: ({ userGuid, courseGuid }: { userGuid: string; courseGuid: string }) => {
      return organizationApi.removeCourseFromUser([userGuid], [courseGuid]);
    },
    onSuccess: () => {
      Notify.success("Enrollment removed successfully");
      queryClient.invalidateQueries({ queryKey: ["orgEnrollments", orgGuid] });
      setIsEditDialogOpen(false);
      setSelectedEnrollment(null);
    },
    onError: (error: any) => {
      Notify.failure(error?.response?.data?.message || "Failed to remove enrollment");
    },
  });

  const handleEnrollmentClick = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setIsEditDialogOpen(true);
  };

  const handleRemoveEnrollment = () => {
    if (selectedEnrollment) {
      if (window.confirm(`Are you sure you want to unenroll ${selectedEnrollment.userName} from ${selectedEnrollment.courseTitle}?`)) {
        removeEnrollmentMutation.mutate({
          userGuid: selectedEnrollment.userGuid,
          courseGuid: selectedEnrollment.courseGuid,
        });
      }
    }
  };

  const { data: enrollments = [], isLoading, isError } = useQuery({
    queryKey: ["orgEnrollments", orgGuid],
    queryFn: async () => {
      try {
        const usersRes = await organizationApi.getOrganizationUsers();
        const users = Array.isArray(usersRes) ? usersRes : ((usersRes as any)?.data || (usersRes as any)?.results || []);
        
        if (!users || users.length === 0) return [];

        const allEnrollments: any[] = [];
        
        await Promise.all(users.map(async (user: any) => {
          try {
            const coursesRes = await organizationApi.getUserEnrolledCourses(user.guid);
            const courses = Array.isArray(coursesRes) ? coursesRes : ((coursesRes as any)?.data || (coursesRes as any)?.results || []);
            
            courses.forEach((course: any) => {
              allEnrollments.push({
                id: `${user.guid}-${course.guid}`,
                userGuid: user.guid,
                courseGuid: course.guid,
                userName: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown",
                userEmail: user.email || "",
                courseTitle: course.title || "-",
                enrolledAt: course.enrolled_at || course.created_at || new Date().toISOString(),
                status: course.status || "Active"
              });
            });
          } catch (e) {
            console.warn(`Failed to fetch courses for user ${user.guid}`);
          }
        }));
        
        return allEnrollments.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
      } catch (error) {
        console.error("Failed to fetch organization enrollments", error);
        return [];
      }
    },
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
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={() => navigate(usersPath)}
          sx={{ borderRadius: 2 }}
        >
          Add Enrollment
        </Button>
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
                    <TableRow 
                      key={enrollment.id || `${enrollment.userGuid || enrollment.user?.guid || idx}-${enrollment.courseGuid || enrollment.course?.guid || idx}-${enrolledAt || idx}`}
                      hover
                      onClick={() => handleEnrollmentClick(enrollment)}
                      sx={{ cursor: "pointer" }}
                    >
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

      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Enrollment
          <IconButton onClick={() => setIsEditDialogOpen(false)}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEnrollment && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Member</Typography>
                <Typography variant="body1">{selectedEnrollment.userName}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Course</Typography>
                <Typography variant="body1">{selectedEnrollment.courseTitle}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Enrolled At</Typography>
                <Typography variant="body1">{new Date(selectedEnrollment.enrolledAt).toLocaleString()}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Typography variant="body1">{selectedEnrollment.status}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<Trash2 size={18} />}
            onClick={handleRemoveEnrollment}
            disabled={removeEnrollmentMutation.isPending}
          >
            {removeEnrollmentMutation.isPending ? "Removing..." : "Unenroll User"}
          </Button>
          <Button onClick={() => setIsEditDialogOpen(false)} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
      
    </Stack>
  );
};

export default OrgEnrollments;
