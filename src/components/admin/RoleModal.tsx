import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  Chip,
  Box,
  Typography,
  Autocomplete,
} from "@mui/material";
import { useFormik } from "formik";
import { TRole } from "@/types/auth.types";
import { RoleSchema, roleInitialValues } from "@/schemas/admin/role.schema";

// Mock permissions data - replace with actual API call
const mockPermissions = [
  { id: "1", name: "Create Course", description: "Can create new courses" },
  { id: "2", name: "Edit Course", description: "Can edit existing courses" },
  { id: "3", name: "Delete Course", description: "Can delete courses" },
  { id: "4", name: "Manage Users", description: "Can manage user accounts" },
  { id: "5", name: "View Analytics", description: "Can view analytics" },
  {
    id: "6",
    name: "Manage Roles",
    description: "Can manage roles and permissions",
  },
];

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  role?: TRole | null;
  isLoading?: boolean;
}

export const RoleModal: React.FC<RoleModalProps> = ({
  open,
  onClose,
  onSubmit,
  role,
  isLoading = false,
}) => {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const isEdit = Boolean(role);

  const formik = useFormik({
    initialValues: role
      ? {
          name: role.name,
          description: role.description,
          //   permission_id: role.permission_id || [],
        }
      : roleInitialValues,
    validationSchema: RoleSchema,
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

  //   const selectedPermissions = mockPermissions.filter((permission) =>
  //     formik.values.permission_id.includes(permission.id)
  //   );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEdit ? "Edit Role" : "Create New Role"}
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Role Name"
                name="name"
                required
                fullWidth
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.name && formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                placeholder="e.g., Instructor, Admin, Student"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                required
                fullWidth
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(
                  formik.touched.description && formik.errors.description
                )}
                helperText={
                  formik.touched.description && formik.errors.description
                }
                placeholder="Describe what this role can do..."
              />
            </Grid>
            {/* 
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={mockPermissions}
                getOptionLabel={(option) => option.name}
                value={selectedPermissions}
                onChange={(_, newValue) => {
                  formik.setFieldValue(
                    "permission_id",
                    newValue.map((permission) => permission.id)
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Permissions"
                    placeholder="Select permissions for this role"
                    error={Boolean(
                      formik.touched.permission_id &&
                        formik.errors.permission_id
                    )}
                    helperText={
                      formik.touched.permission_id &&
                      formik.errors.permission_id
                    }
                  />
                )}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))
                }
              />
            </Grid>

            {selectedPermissions.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Selected Permissions:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedPermissions.map((permission) => (
                    <Chip
                      key={permission.id}
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {permission.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {permission.description}
                          </Typography>
                        </Box>
                      }
                      variant="outlined"
                      sx={{
                        height: "auto",
                        "& .MuiChip-label": {
                          display: "block",
                          whiteSpace: "normal",
                          p: 1,
                        },
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid> */}{" "}
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
              ? "Update Role"
              : "Create Role"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
