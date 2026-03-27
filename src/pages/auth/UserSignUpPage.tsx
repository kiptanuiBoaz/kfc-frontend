import React, { use, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { PATHS } from "@/navigation/paths";
import {
  signupInitialValues,
  SignUpSchema,
} from "@/schemas/auth/signup.schema";
import { apiClient } from "@/api/apiClient";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Notify } from "notiflix";

const UserSignUpPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orgParam = searchParams.get("org");

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: signupInitialValues,
    validationSchema: SignUpSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);

        let submitValues = { ...values };
        if (orgParam) {
          submitValues.organization = orgParam;
        }

        await apiClient.post("/main/v1/user/register/", submitValues);

        Notify.success(
          "Account created successfully. Please check your email for the verification code.",
        );

        setErrorMessage(null);

        resetForm();
        navigate(PATHS.LOGIN);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.";
        setErrorMessage(message);
        setSuccessMessage(null);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box>
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
        <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Box sx={{ justifyContent: "center", display: "flex" }}>
            <img src="/images/logo.png" alt="logo" style={{ height: 70 }} />
          </Box>

          <Stack spacing={1} mb={2} textAlign="center">
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Create Your Account
            </Typography>
            {orgParam ? (
              <Alert severity="success" sx={{ mt: 1 }}>
                You are signing up as a member of <b>{orgParam}</b>.
              </Alert>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Join KFC Academy to access personalized courses and resources.
              </Typography>
            )}
          </Stack>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            {/* ...existing code for normal signup form... */}
            <Grid container spacing={2}>
              {/* ...existing code for normal signup fields... */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="first_name"
                  required
                  fullWidth
                  autoComplete="given-name"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.first_name && formik.errors.first_name,
                  )}
                  helperText={
                    formik.touched.first_name && formik.errors.first_name
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="last_name"
                  required
                  fullWidth
                  autoComplete="family-name"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.last_name && formik.errors.last_name,
                  )}
                  helperText={
                    formik.touched.last_name && formik.errors.last_name
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  type="email"
                  name="email"
                  required
                  fullWidth
                  autoComplete="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.email && formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Phone Number"
                  name="phone_number"
                  fullWidth
                  autoComplete="tel"
                  value={formik.values.phone_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.phone_number && formik.errors.phone_number,
                  )}
                  helperText={
                    formik.touched.phone_number && formik.errors.phone_number
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  fullWidth
                  autoComplete="new-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.password && formik.errors.password,
                  )}
                  helperText={formik.touched.password && formik.errors.password}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            onClick={() => setShowPassword((prev) => !prev)}
                            onMouseDown={(event) => event.preventDefault()}
                            edge="end"
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
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  fullWidth
                  autoComplete="new-password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword,
                  )}
                  helperText={
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showConfirmPassword
                                ? "Hide confirm password"
                                : "Show confirm password"
                            }
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            onMouseDown={(event) => event.preventDefault()}
                            edge="end"
                          >
                            {showConfirmPassword ? (
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
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={formik.isSubmitting}
                  sx={{ mb: 2 }}
                >
                  {formik.isSubmitting ? "Submitting..." : "Sign Up"}
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Stack direction={"column"} justifyContent={"start"} spacing={1}>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Are you a KFC member?{" "}
              <Link
                component={RouterLink}
                to={PATHS.MEMBER_SIGN_UP}
                underline="hover"
              >
                Register with your member ID
              </Link>
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Already have an account?{" "}
              <Link component={RouterLink} to={PATHS.LOGIN} underline="hover">
                Sign in
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default UserSignUpPage;
