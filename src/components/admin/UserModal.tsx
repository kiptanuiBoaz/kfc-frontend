import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { MuiTelInput } from "mui-tel-input";
import { useFormik } from "formik";
import { AuthUser, TRole, User } from "@/types/auth.types";
import { UserSchema, userInitialValues } from "@/schemas/admin/user.schema";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  user?: AuthUser | null;
  isLoading?: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({
  open,
  onClose,
  onSubmit,
  user,
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    data: roles = [],
    isLoading: rolesLoading,
    isError,
  } = useQuery<TRole[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: TRole[] }>("/main/v1/role/all/");
      return response?.data || [];
    },
    enabled: open,
  });

  const isEdit = Boolean(user);

  const formik = useFormik({
    initialValues: user
      ? {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone_number: user.phone_number || "",

          role: user.role?.guid || "",
          is_active: user.is_active,
        }
      : userInitialValues,
    validationSchema: UserSchema,
    enableReinitialize: true,

    onSubmit: async (values, { setSubmitting }) => {
      try {
        setErrorMessage(null);

        await onSubmit(values);
        onClose();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.";
        console.log(error);
        setErrorMessage(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    if (!isLoading) {
      formik.resetForm();
      setErrorMessage(null);
      onClose();
    }
  };

  console.log(formik.values.role);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEdit ? "Edit User" : "Add New User"}
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                name="first_name"
                required
                fullWidth
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(
                  formik.touched.first_name && formik.errors.first_name
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
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(
                  formik.touched.last_name && formik.errors.last_name
                )}
                helperText={formik.touched.last_name && formik.errors.last_name}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                name="email"
                required
                fullWidth
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.email && formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            <Grid item xs={12}>
              <MuiTelInput
                label="Phone Number"
                name="phone_number"
                fullWidth
                value={formik.values.phone_number}
                onChange={(value) =>
                  formik.setFieldValue("phone_number", value)
                }
                onBlur={formik.handleBlur}
                error={Boolean(
                  formik.touched.phone_number && formik.errors.phone_number
                )}
                helperText={
                  formik.touched.phone_number && formik.errors.phone_number
                }
                defaultCountry="KE"
                preferredCountries={["KE", "US", "GB", "CA", "AU"]}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.role && formik.errors.role)}
                  label="Role"
                >
                  {rolesLoading ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : isError ? (
                    <MenuItem disabled>Error loading roles</MenuItem>
                  ) : roles.length === 0 ? (
                    <MenuItem disabled>No roles available</MenuItem>
                  ) : null}
                  {roles.map((role) => (
                    <MenuItem key={role.guid} value={role.guid}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_active}
                    onChange={(e) =>
                      formik.setFieldValue("is_active", e.target.checked)
                    }
                    name="is_active"
                  />
                }
                label="Active"
                sx={{ mt: 2 }}
              />
            </Grid>

            {/* {!isEdit && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    fullWidth
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      formik.touched.password && formik.errors.password
                    )}
                    helperText={
                      formik.touched.password && formik.errors.password
                    }
                    InputProps={{
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
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    fullWidth
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      formik.touched.confirmPassword &&
                        formik.errors.confirmPassword
                    )}
                    helperText={
                      formik.touched.confirmPassword &&
                      formik.errors.confirmPassword
                    }
                    InputProps={{
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
                    }}
                  />
                </Grid>
              </>
            )} */}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || formik.isSubmitting}
          >
            {isLoading || formik.isSubmitting
              ? "Saving..."
              : isEdit
              ? "Update User"
              : "Create User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
