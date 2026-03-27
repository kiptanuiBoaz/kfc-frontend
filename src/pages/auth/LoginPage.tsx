import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { PATHS } from "@/navigation/paths";
import { apiClient } from "@/api/apiClient";
import { LoginSchema, loginInitialValues } from "@/schemas/auth/login.schema";
import { OtpInput } from "@/pages/OtpInput";
import { loginStart, loginFailure } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/redux/store";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Notify } from "notiflix";
import { LoginResponse } from "@/types/auth.types";

const LoginPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const extractErrorMessage = (error: any) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail ||
    "An unexpected error occurred. Please try again.";

  const performLoginRequest = async (email: string, password: string) => {
    try {
      await apiClient.post("/auth/login/", { email, password });
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  };

  const handleResendOtp = async () => {
    if (!loginCredentials) {
      throw new Error(
        "Missing login credentials. Please try signing in again.",
      );
    }

    await performLoginRequest(
      loginCredentials.email,
      loginCredentials.password,
    );
  };

  const getRedirectPath = (roleName?: string | null) => {
    const normalizedRole = roleName?.toLowerCase();

    if (normalizedRole === "instructor") {
      return PATHS.INSTRUCTOR_COURSE_LIST;
    }

    if (normalizedRole === "admin") {
      return PATHS.ADMIN_DASHBOARD;
    }

    if (normalizedRole === "user") {
      return PATHS.MY_COURSES;
    }

    return PATHS.COURSES;
  };

  const formik = useFormik({
    initialValues: loginInitialValues,
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);
        dispatch(loginStart());

        await performLoginRequest(values.email, values.password);

        setLoginCredentials({
          email: values.email,
          password: values.password,
        });

        const successCopy =
          "Please check your email for the verification code.";
        setSuccessMessage(successCopy);
        Notify.success(successCopy);

        setShowOtpInput(true);
      } catch (error: any) {
        dispatch(loginFailure());
        const message = error?.message || extractErrorMessage(error);
        setErrorMessage(message);
        setSuccessMessage(null);
        Notify.failure(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleOtpSuccess = (response: LoginResponse) => {
    setShowOtpInput(false);
    setLoginCredentials(null);

    const redirectPath = getRedirectPath(response.user.role?.name ?? null);
    navigate(redirectPath, { replace: true });
  };

  const handleOtpCancel = () => {
    setShowOtpInput(false);
    setLoginCredentials(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    formik.resetForm();
  };

  return (
    <Box>
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
        <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Box sx={{ justifyContent: "center", display: "flex", mb: 3 }}>
            <img src="/images/logo.png" alt="logo" style={{ height: 70 }} />
          </Box>
          <Stack spacing={3}>
            {!showOtpInput ? (
              <>
                <Stack spacing={1} textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Welcome Back
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sign in with your email address and password.
                  </Typography>
                </Stack>

                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                {successMessage && (
                  <Alert severity="success">{successMessage}</Alert>
                )}

                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Email"
                      name="email"
                      required
                      fullWidth
                      autoComplete="email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={Boolean(
                        formik.touched.email && formik.errors.email,
                      )}
                      helperText={formik.touched.email && formik.errors.email}
                      disabled={formik.isSubmitting}
                    />
                    <TextField
                      label="Password"
                      name="password"
                      required
                      fullWidth
                      autoComplete="current-password"
                      type={showPassword ? "text" : "password"}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={Boolean(
                        formik.touched.password && formik.errors.password,
                      )}
                      helperText={
                        formik.touched.password && formik.errors.password
                      }
                      disabled={formik.isSubmitting}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={
                                  showPassword
                                    ? "Hide password"
                                    : "Show password"
                                }
                                onClick={() => setShowPassword((prev) => !prev)}
                                onMouseDown={(event) => event.preventDefault()}
                                edge="end"
                                disabled={formik.isSubmitting}
                              >
                                {showPassword ? (
                                  <VisibilityOffIcon fontSize="small" />
                                ) : (
                                  <VisibilityIcon fontSize="small" />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Link
                        component={RouterLink}
                        to={PATHS.HOME}
                        underline="hover"
                        variant="body2"
                        tabIndex={formik.isSubmitting ? -1 : 0}
                      >
                        Go Home
                      </Link>
                      <Link
                        component={RouterLink}
                        to={PATHS.RESET_PASSWORD}
                        underline="hover"
                        variant="body2"
                        tabIndex={formik.isSubmitting ? -1 : 0}
                      >
                        Forgot password?
                      </Link>
                    </Box>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={formik.isSubmitting}
                    >
                      {formik.isSubmitting ? "Signing In..." : "Sign In"}
                    </Button>
                  </Stack>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  Don&apos;t have an account?{" "}
                  <Link
                    component={RouterLink}
                    to={PATHS.USER_SIGN_UP}
                    underline="hover"
                    tabIndex={formik.isSubmitting ? -1 : 0}
                  >
                    Create one
                  </Link>
                </Typography>
              </>
            ) : (
              loginCredentials && (
                <OtpInput
                  email={loginCredentials.email}
                  password={loginCredentials.password}
                  onSuccess={handleOtpSuccess}
                  onCancel={handleOtpCancel}
                  onResend={handleResendOtp}
                />
              )
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
