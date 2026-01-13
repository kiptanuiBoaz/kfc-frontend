import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { CheckCircle, CreditCard, Smartphone } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { TCourse } from "@/types/course.types";
import { getStatusColor } from "@/utils/getStatusColor";
import { CustomContainer } from "@/components/shared/CustomContainer";
import { Notify } from "notiflix";
import { useUser } from "@/hooks/useAuth";
import { PATHS } from "@/navigation/paths";

export const EnrollCourse = () => {
  const { courseGuid } = useParams<{ courseGuid: string }>();
  const navigate = useNavigate();
  const user = useUser();

  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = useQuery<TCourse | undefined>({
    queryKey: ["courseDetails", courseGuid],
    enabled: !!courseGuid,
    queryFn: async () =>
      await apiClient.get<TCourse>(`/main/v1/courses/${courseGuid}/`),
  });

  if (!courseGuid) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Missing course identifier in the URL</Alert>
      </Container>
    );
  }

  if (isCourseLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack alignItems="center" py={8} spacing={2}>
          <CircularProgress />
          <Typography>Loading course details...</Typography>
        </Stack>
      </Container>
    );
  }

  if (isCourseError || !course) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Unable to load the selected course. Please refresh and try again.
        </Alert>
      </Container>
    );
  }

  const handleEnrollment = async () => {
    try {
      await apiClient.post(`/main/v1/enroll/`, {
        course: course.guid,
        user: user.guid,
      });
      Notify.success("Enrollment successful! You can now access the course.");
      navigate(PATHS.MY_COURSES);
    } catch (error) {
      Notify.failure("Enrollment failed. Please try again.");
    }
  };

  return (
    <CustomContainer>
      <Typography variant="h4" fontWeight={700} textAlign="center" mb={4}>
        Complete Your Enrollment
      </Typography>

      <Grid container spacing={4}>
        {/* Order Summary - Left Side */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3} direction="column">
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight={600} mb={3}>
                Order Summary
              </Typography>

              <Card sx={{ display: "flex", mb: 3, borderRadius: 2 }}>
                <CardMedia
                  component="img"
                  sx={{ width: 120, height: 120, objectFit: "cover" }}
                  image={
                    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1000&q=80"
                  }
                  alt={course.title}
                />
                <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <CardContent sx={{ flex: "1 0 auto", py: 2 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {course.description}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Expertise:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {course.expertise_level}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Box>
              </Card>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1">Course Fee</Typography>
                  {course.isPaid && course.amount ? (
                    <Typography variant="body1" fontWeight={600}>
                      {course.currency ?? "USD"} {course.amount}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color="success.main"
                    >
                      Free
                    </Typography>
                  )}
                </Box>

                {course.isPaid && course.amount && (
                  <>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body1">Processing Fee</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {course.currency ?? "USD"} 0.00
                      </Typography>
                    </Box>

                    <Divider />

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="h6" fontWeight={600}>
                        Total Amount
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="primary">
                        {course.currency ?? "USD"} {course.amount}
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </Paper>{" "}
            <Alert severity="info" sx={{ borderRadius: 2, mb: 3 }}>
              <Typography variant="body2">
                <strong>Instructions:</strong> Go to M-Pesa menu → Pay Bill →
                Enter Business Number → Enter Account Number → Enter Amount →
                Confirm payment
              </Typography>
            </Alert>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  <CheckCircle
                    size={16}
                    style={{ marginRight: 8, color: "primary" }}
                  />
                  Secure payment processing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <CheckCircle
                    size={16}
                    style={{ marginRight: 8, color: "primary" }}
                  />
                  Instant course access after payment confirmation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <CheckCircle
                    size={16}
                    style={{ marginRight: 8, color: "primary" }}
                  />
                  30-day money-back guarantee
                </Typography>
              </Stack>
            </Paper>{" "}
          </Stack>
        </Grid>

        {/* Payment Details - Right Side */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Payment Details
            </Typography>

            <Stack spacing={3}>
              <Box sx={{ textAlign: "center", py: 2 }}>
                <img
                  src="/images/mpesa.jpeg"
                  alt="M-Pesa Logo"
                  width={"100%"}
                  height={120}
                />

                <Typography
                  sx={{ mt: 2 }}
                  variant="body2"
                  color="text.secondary"
                >
                  Pay for your course using{" "}
                  <span style={{ color: "primary" }}> M-Pesa Paybill</span>
                </Typography>
              </Box>

              <Card sx={{ border: "2px solid primary", borderRadius: 2 }}>
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Business Number
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="primary"
                    sx={{
                      fontFamily: "monospace",
                      letterSpacing: 2,
                      bgcolor: "grey.100",
                      py: 1,
                      px: 2,
                      borderRadius: 1,
                      display: "inline-block",
                    }}
                  >
                    123456
                  </Typography>

                  <Typography variant="h6" fontWeight={600} mt={1}>
                    Account Number
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    sx={{
                      fontFamily: "monospace",
                      letterSpacing: 1,
                      bgcolor: "grey.100",
                      py: 1,
                      px: 2,
                      borderRadius: 1,
                      display: "inline-block",
                    }}
                  >
                    {course.guid?.slice(0, 8).toUpperCase() || "COURSE001"}
                  </Typography>
                </CardContent>
              </Card>

              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<CreditCard />}
                onClick={handleEnrollment}
                sx={{
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  mt: 2,
                }}
              >
                I've Completed Payment
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
              >
                By completing this payment, you agree to our Terms of Service
                and Privacy Policy
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </CustomContainer>
  );
};
