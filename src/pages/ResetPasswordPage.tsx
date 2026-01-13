import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing-page/Footer";
import { PATHS } from "@/navigation/paths";
import { apiClient } from "@/api/apiClient";
import {
  resetPasswordInitialValues,
  ResetPasswordSchema,
} from "@/schemas/auth/reset-password.schema";
import { Report } from "notiflix/build/notiflix-report-aio";

const ResetPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSubmit = async (values: typeof resetPasswordInitialValues) => {
    try {
      await apiClient.post("/auth/password_reset/", {
        email: values.email,
      });

      setSubmittedEmail(values.email);
      setIsSubmitted(true);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "An error occurred while sending the reset email. Please try again.";

      Report.failure("Reset Failed", errorMessage, "Try Again");
    }
  };

  if (isSubmitted) {
    return (
      <Box>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
          <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
            <Stack spacing={3} textAlign="center">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <CheckCircle size={64} color="#4caf50" />
              </Box>

              <Stack spacing={1}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Check Your Email
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  We've sent a password reset link to
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {submittedEmail}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Please check your email and click the link to reset your
                  password. If you don't see the email, check your spam folder.
                </Typography>
              </Stack>

              <Alert severity="info" sx={{ textAlign: "left" }}>
                <Typography variant="body2">
                  <strong>Didn't receive the email?</strong>
                  <br />
                  • Check your spam/junk folder
                  <br />
                  • Make sure you entered the correct email address
                  <br />• Wait a few minutes and try again
                </Typography>
              </Alert>

              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    setIsSubmitted(false);
                    setSubmittedEmail("");
                  }}
                >
                  Try Different Email
                </Button>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  Remembered your password?{" "}
                  <Link
                    component={RouterLink}
                    to={PATHS.LOGIN}
                    underline="hover"
                  >
                    Back to sign in
                  </Link>
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
        <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Stack spacing={1} textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Reset Your Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter the email associated with your account and we&apos;ll send
                you a verification code.
              </Typography>
            </Stack>

            <Formik
              initialValues={resetPasswordInitialValues}
              validationSchema={ResetPasswordSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Stack spacing={2.5}>
                    <Field
                      as={TextField}
                      label="Email"
                      type="email"
                      name="email"
                      required
                      fullWidth
                      autoComplete="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Verification Code"}
                    </Button>
                  </Stack>
                </Form>
              )}
            </Formik>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Remembered your password?{" "}
              <Link component={RouterLink} to={PATHS.LOGIN} underline="hover">
                Back to sign in
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
};

export default ResetPasswordPage;
