import React from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Stack,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { PATHS } from "@/navigation/paths";
import { useUser } from "@/hooks/useAuth";
import { logout, updateUserImage } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/redux/store";
import { Notify } from "notiflix";
import { Book, Camera } from "lucide-react";
import { MuiTelInput } from "mui-tel-input";
import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { AuthUser, TImageUpdateRes } from "@/types/auth.types";
import {
  ProfileFormValues,
  profileInitialValues,
  ProfileSchema,
} from "@/schemas/auth/profile.schema";
import { updateUser } from "@/redux/slices/authSlice";
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || "";
interface UserProfileMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onOpen: (event: React.MouseEvent<HTMLElement>) => void;
  size?: "small" | "medium";
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  anchorEl,
  onClose,
  onOpen,
  size = "medium",
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const isAdmin = user?.role?.name?.toLowerCase() === "admin";
  const isInstructor = user?.role?.name?.toLowerCase() === "instructor";
  const isUser = user?.role?.name?.toLowerCase() === "user";
  console.log("MEDIA BASE URL:", MEDIA_BASE_URL);
  console.log("User Image:", user?.image);

  const profileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!user?.guid) {
        throw new Error("Unable to update profile right now.");
      }
      return apiClient.patch<TImageUpdateRes>(
        `/main/v1/user/update/${user.guid}/`,
        values
      );
    },
    onSuccess: (updatedUser, variables) => {
      if (updatedUser) {
        dispatch(updateUser(updatedUser));
      } else {
        dispatch(updateUser(variables));
      }
      Notify.success("Profile updated successfully");
      setIsEditDialogOpen(false);
      setFormError(null);
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again.";
      setFormError(message);
      Notify.failure(message);
    },
  });

  const handleImageUpload = async (file?: File) => {
    if (!file || !user?.guid) return;
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be less than 5MB.");
      return;
    }

    setUploadingImage(true);
    setImageError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await apiClient.put<{ image: string }>(
        `/main/v1/user/update_image/${user.guid}/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (!res?.image) {
        setImageError("Unable to update image. Please try again.");
        return;
      }

      dispatch(updateUserImage(res.image));
      Notify.success("Profile image updated");
    } catch (err) {
      console.error("Image upload failed", err);
      setImageError("Failed to update profile image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const formik = useFormik<ProfileFormValues>({
    initialValues: user
      ? {
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          bio: user.bio || "",
          phone_number: user.phone_number || "",
        }
      : profileInitialValues,
    validationSchema: ProfileSchema,
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      try {
        setFormError(null);
        await profileMutation.mutateAsync(values);
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const handleOpenEditProfile = () => {
    if (!user) return;
    setFormError(null);
    profileMutation.reset();
    formik.resetForm();
    setIsEditDialogOpen(true);
  };

  const handleCloseEditProfile = () => {
    if (profileMutation.isPending) return;
    setIsEditDialogOpen(false);
    setFormError(null);
    profileMutation.reset();
    formik.resetForm();
  };

  const handleLogout = () => {
    // await apiClient.post("/auth/logout/");
    dispatch(logout());
    onClose();
    Notify.success("Logged out successfully");
    navigate(PATHS.HOME);
  };

  const handleViewProfile = () => {
    onClose();
    // Navigate to profile page when available
    console.log("Navigate to profile");
  };

  const handleDashboard = () => {
    onClose();
    navigate(PATHS.INSTRUCTOR_DASHBOARD);
  };

  const handleAdminDashboard = () => {
    onClose();
    navigate(PATHS.ADMIN_DASHBOARD);
  };

  const getDisplayName = () => {
    if (!user) return "";
    return `${user.first_name} ${user.last_name}`.trim() || user.email;
  };

  return (
    <>
      <Chip
        avatar={
          <Avatar
            src={user?.image ? `${MEDIA_BASE_URL}${user.image}` : undefined}
            sx={{
              width: size === "small" ? 24 : 32,
              height: size === "small" ? 24 : 32,
            }}
          >
            {user?.first_name?.[0]?.toUpperCase() ||
              user?.email?.[0]?.toUpperCase()}
          </Avatar>
        }
        label={getDisplayName()}
        deleteIcon={<ExpandMoreIcon />}
        onDelete={onOpen}
        onClick={onOpen}
        sx={{
          height: size === "small" ? 32 : 40,
          borderRadius: 5,
          cursor: "pointer",
          "& .MuiChip-deleteIcon": {
            color: "inherit",
          },
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: { mt: 1, minWidth: 200 },
        }}
      >
        <MenuItem onClick={handleViewProfile}>
          <ListItemIcon>
            <Avatar
              src={user?.image || undefined}
              //   sx={{ width: 24, height: 24 }}
            >
              {user?.first_name?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase()}
            </Avatar>
          </ListItemIcon>
          <ListItemText primary={getDisplayName()} secondary={user?.email} />
        </MenuItem>
        {isInstructor && (
          <MenuItem onClick={handleDashboard}>
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dashboard</ListItemText>
          </MenuItem>
        )}
        {isUser && (
          <MenuItem onClick={() => navigate("my-courses")}>
            <ListItemIcon>
              <Book fontSize="small" />
            </ListItemIcon>
            <ListItemText>My Learning</ListItemText>
          </MenuItem>
        )}
        {user && (
          <MenuItem
            onClick={() => {
              onClose();
              handleOpenEditProfile();
            }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Profile</ListItemText>
          </MenuItem>
        )}
        {/* <MenuItem
          onClick={() => {
            onClose();
            navigate(PATHS.MY_COURSES);
          }}
        >
          <ListItemIcon>
            <LibraryBooksIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Courses</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onClose();
            navigate(PATHS.PROFILE);
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile Settings</ListItemText>
        </MenuItem> */}
        {isAdmin && (
          <MenuItem onClick={handleAdminDashboard}>
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Admin Dashboard</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={isEditDialogOpen}
        onClose={handleCloseEditProfile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <form onSubmit={formik.handleSubmit} noValidate>
          <DialogTitle sx={{ fontWeight: 700 }}>Edit Profile</DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <Stack spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={
                    user?.image ? `${MEDIA_BASE_URL}${user.image}` : undefined
                  }
                  sx={{ width: 96, height: 96, boxShadow: 2 }}
                >
                  {user?.first_name?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase()}
                </Avatar>
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "background.paper",
                    boxShadow: 2,
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  {uploadingImage ? (
                    <CircularProgress size={18} />
                  ) : (
                    <Camera size={18} />
                  )}
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                JPEG, JPG, PNG, WEBP. Max 5MB.
              </Typography>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
              />
              {imageError && (
                <Alert
                  severity="error"
                  variant="outlined"
                  sx={{ width: "100%" }}
                >
                  {imageError}
                </Alert>
              )}
            </Stack>
            <Grid container spacing={2} sx={{ mt: 0 }}>
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
                  helperText={
                    formik.touched.last_name && formik.errors.last_name
                  }
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
              </Grid>{" "}
              <Grid item xs={12}>
                <TextField
                  label="Bio"
                  name="bio"
                  fullWidth
                  value={formik.values.bio}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.bio && formik.errors.bio)}
                  helperText={formik.touched.bio && formik.errors.bio}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseEditProfile}
              disabled={profileMutation.isPending || formik.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={profileMutation.isPending || formik.isSubmitting}
            >
              {profileMutation.isPending || formik.isSubmitting
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};
