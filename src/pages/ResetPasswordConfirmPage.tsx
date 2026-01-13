import React, { useState, useEffect } from "react";
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
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Link as RouterLink,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { Formik, Form, Field } from "formik";
import { CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing-page/Footer";
import { PATHS } from "@/navigation/paths";
import { apiClient } from "@/api/apiClient";
import {
  resetPasswordConfirmInitialValues,
  ResetPasswordConfirmSchema,
} from "@/schemas/auth/reset-password-confirm.schema";
import { Report } from "notiflix/build/notiflix-report-aio";

const ResetPasswordConfirmPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      // Redirect to reset password page if no token
      navigate(PATHS.RESET_PASSWORD);
      return;
    }
    setToken(tokenParam);
  }, [searchParams, navigate]);

  const handleSubmit = async (
    values: typeof resetPasswordConfirmInitialValues
  ) => {
    if (!token) {
      Report.failure(
        "Invalid Token",
        "Password reset token is missing or invalid.",
        "OK"
      );
      return;
    }

    try {
      await apiClient.post("/auth/password_reset/confirm/", {
        password: values.password,
        token: token,
      });

      setIsSubmitted(true);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "An error occurred while resetting your password. Please try again.";

      Report.failure("Reset Failed", errorMessage, "Try Again");
    }
  };

  // Show loading or redirect if no token
  if (!token) {
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
                <AlertCircle size={64} color="#f44336" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Invalid Reset Link
              </Typography>
              <Typography variant="body1" color="text.secondary">
                This password reset link is invalid or has expired.
              </Typography>
              <Button
                component={RouterLink}
                to={PATHS.RESET_PASSWORD}
                variant="contained"
                size="large"
              >
                Request New Reset Link
              </Button>
            </Stack>
          </Paper>
        </Container>
        <Footer />
      </Box>
    );
  }

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
                  Password Reset Successful
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your password has been successfully reset. You can now sign in
                  with your new password.
                </Typography>
              </Stack>

              <Button
                component={RouterLink}
                to={PATHS.LOGIN}
                variant="contained"
                size="large"
              >
                Sign In
              </Button>
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
                Set New Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your new password below to complete the reset process.
              </Typography>
            </Stack>

            <Formik
              initialValues={resetPasswordConfirmInitialValues}
              validationSchema={ResetPasswordConfirmSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Stack spacing={2.5}>
                    <Field
                      as={TextField}
                      label="New Password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      fullWidth
                      autoComplete="new-password"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      disabled={isSubmitting}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              aria-label="toggle password visibility"
                            >
                              {showPassword ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Field
                      as={TextField}
                      label="Confirm New Password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      fullWidth
                      autoComplete="new-password"
                      error={
                        touched.confirmPassword &&
                        Boolean(errors.confirmPassword)
                      }
                      helperText={
                        touched.confirmPassword && errors.confirmPassword
                      }
                      disabled={isSubmitting}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                              aria-label="toggle confirm password visibility"
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Password Requirements:</strong>
                        <br />
                        • At least 8 characters long
                        <br />• Should contain a mix of letters, numbers, and
                        symbols
                      </Typography>
                    </Alert>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Resetting Password..."
                        : "Reset Password"}
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

export default ResetPasswordConfirmPage;
