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
  Alert,
  Autocomplete,
} from "@mui/material";
import { MuiTelInput } from "mui-tel-input";
import { useFormik } from "formik";
import { AuthUser, TRole } from "@/types/auth.types";
import { UserSchema, userInitialValues } from "@/schemas/admin/user.schema";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";

interface OrgUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  user?: AuthUser | null;
  isLoading?: boolean;
}

export const OrgUserModal: React.FC<OrgUserModalProps> = ({
  open,
  onClose,
  onSubmit,
  user,
  isLoading = false,
}) => {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Fetch roles - using cache to load faster
  const {
    data: roles = [],
    isLoading: rolesLoading,
    isError,
  } = useQuery<TRole[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get("/main/v1/role/all/");
        // Handle both { data: [...] } and directly [...] formats
        const allRoles = Array.isArray(response) ? response : (response?.data || []);
        
        // Filter for organization roles only - case insensitive
        return allRoles.filter((role: any) => {
          const name = (role.name || "").toUpperCase();
          return name === "ORG_ADMIN" || name === "USER" || name === "ADMIN" || name === "ORGANIZATION_ADMIN";
        });
      } catch (err) {
        console.error("Error fetching roles:", err);
        throw err;
      }
    },
    enabled: open,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
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
      } catch (error: any) {
        const message = error?.response?.data?.message || 
                        error?.message || 
                        "An unexpected error occurred. Please try again.";
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
        {isEdit ? "Edit Organization User" : "Add New User to Organization"}
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
                error={Boolean(formik.touched.first_name && formik.errors.first_name)}
                helperText={formik.touched.first_name && (formik.errors.first_name as string)}
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
                error={Boolean(formik.touched.last_name && formik.errors.last_name)}
                helperText={formik.touched.last_name && (formik.errors.last_name as string)}
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
                helperText={formik.touched.email && (formik.errors.email as string)}
              />
            </Grid>

            <Grid item xs={12}>
              <MuiTelInput
                label="Phone Number"
                name="phone_number"
                fullWidth
                value={formik.values.phone_number}
                onChange={(value) => formik.setFieldValue("phone_number", value)}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.phone_number && formik.errors.phone_number)}
                helperText={formik.touched.phone_number && (formik.errors.phone_number as string)}
                defaultCountry="KE"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={roles}
                getOptionLabel={(option: any) => {
                  if (typeof option === "string") return option;
                  const name = option.name || "";
                  return ["ORG_ADMIN", "ADMIN", "ORGANIZATION_ADMIN"].includes(name.toUpperCase()) 
                    ? "Admin" 
                    : name.toUpperCase() === "USER" 
                    ? "User" 
                    : name;
                }}
                value={roles.find(r => r.guid === formik.values.role) || formik.values.role}
                onChange={(_, newValue: any) => {
                  const guid = typeof newValue === "object" ? newValue?.guid : newValue;
                  formik.setFieldValue("role", guid);
                }}
                onInputChange={(_, newInputValue) => {
                  // If freeSolo is used and they type something manually
                  if (!roles.find(r => r.name === newInputValue)) {
                    formik.setFieldValue("role", newInputValue);
                  }
                }}
                loading={rolesLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Role"
                    name="role"
                    required
                    error={Boolean(formik.touched.role && formik.errors.role)}
                    helperText={(formik.touched.role && formik.errors.role as string) || (isError ? "Error loading roles, you can type manually" : "")}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.is_active}
                    onChange={(e) => formik.setFieldValue("is_active", e.target.checked)}
                    name="is_active"
                  />
                }
                label="Active Status"
                sx={{ mt: 1 }}
              />
            </Grid>
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
              ? "Processing..."
              : isEdit
              ? "Update User"
              : "Create User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
