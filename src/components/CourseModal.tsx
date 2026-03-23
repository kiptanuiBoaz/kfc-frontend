import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  IconButton,
  Autocomplete,
  Alert,
  Divider,
  Stack,
} from "@mui/material";
import { useFormik } from "formik";
import { X, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import {
  CourseSchema,
  courseInitialValues,
  EXPERTISE_LEVELS,
  COURSE_STATUSES,
  CURRENCIES,
  CourseInitialValues,
} from "@/schemas/instructor/course.schema";
import { LEARNING_MODES } from "@/constants/courses";
import { categories } from "@/lib/categories";
import { apiClient } from "@/api/apiClient";
import { useUser } from "@/hooks/useAuth";
import { Report } from "notiflix/build/notiflix-report-aio";
import { ChipInputField } from "@/components/shared/ChipInputFeld";
import FileUpload from "@/components/shared/FileUpload";
import { AuthUser } from "@/types/auth.types";
import { useQuery } from "@tanstack/react-query";

interface CourseModalProps {
  open: boolean;
  onClose: () => void;
  course?: any; // For editing existing course
  onSuccess: () => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  open,
  onClose,
  course,
  onSuccess,
}) => {
  const isEdit = Boolean(course);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bannerUrls, setBannerUrls] = useState<string[]>(
    course?.image ? [course.image] : [],
  );
  const user = useUser();

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<AuthUser[]>({
    queryKey: ["adminUsers"],
    queryFn: () => apiClient.get<AuthUser[]>("/main/v1/user/all/"),
  });

  // Filter only instructors
  const instructorOptions = Array.isArray(users)
    ? users.filter((u) =>
        u.role && typeof u.role === "object"
          ? u.role.name === "INSTRUCTOR"
          : u.role.name === "INSTRUCTOR",
      )
    : [];

  useEffect(() => {
    setBannerUrls(course?.image ? [course.image] : []);
  }, [course]);

  const formik = useFormik({
    initialValues: course || {
      ...CourseInitialValues,
      instructor: user?.guid || "",
      learning_mode: "ONLINE",
      venue: "",
      training_date: "",
    },
    validationSchema: CourseSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);

        const endpoint = isEdit
          ? `/main/v1/courses/${course.guid}/update/`
          : "/main/v1/courses/create/";

        const { image, ...rest } = values;
        let training_date = rest.training_date;
        // If physical and training_date is set, format as ISO string (YYYY-MM-DDTHH:mm)
        if (rest.learning_mode === "PHYSICAL" && training_date) {
          // If already contains 'T', assume it's correct, else add T00:00
          if (!training_date.includes("T")) {
            training_date = `${training_date}T00:00`;
          }
        }
        const payload = {
          ...rest,
          training_date,
          // Convert amount to null if not paid
          amount: values.isPaid ? values.amount : null,
          currency: values.isPaid ? values.currency : null,
          image: bannerUrls.length > 0 ? bannerUrls[0] : null,
        };

        isEdit
          ? await apiClient.patch(endpoint, payload)
          : await apiClient.post(endpoint, payload);

        Report.success(
          isEdit ? "Course Updated" : "Course Created",
          `Course has been ${isEdit ? "updated" : "created"} successfully!`,
          "OK",
        );

        setErrorMessage(null);
        resetForm();
        onSuccess();
      } catch (error: any) {
        console.error("Course submission error:", error);
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          `Failed to ${isEdit ? "update" : "create"} course. Please try again.`;

        setErrorMessage(message);
        setSuccessMessage(null);
      } finally {
        setSubmitting(false);
        onClose();
      }
    },
  });

  console.log("Formik Errors:", formik.errors);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {isEdit ? "Edit Course" : "Create New Course"}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Stack spacing={3}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}

          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            {/* Course Banner Image */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Course Banner
              </Typography>
              <FileUpload
                fileType="image"
                label="Upload Course Banner"
                description="JPEG, PNG, WEBP (max 100MB)"
                values={bannerUrls}
                onChange={(newUrls) => {
                  setBannerUrls(newUrls);
                  formik.setFieldValue("image", newUrls[0] || "");
                }}
                multiple={false}
              />
            </Box>

            {/* Basic Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Course Title"
                    name="title"
                    required
                    fullWidth
                    placeholder="Enter course title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.title && formik.errors.title)}
                    helperText={
                      formik.touched.title && (formik.errors.title as string)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    name="description"
                    required
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Describe your course content and what students will learn"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      formik.touched.description && formik.errors.description,
                    )}
                    helperText={
                      formik.touched.description &&
                      (formik.errors.description as string)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Expertise Level</InputLabel>
                    <Select
                      name="expertise_level"
                      value={formik.values.expertise_level}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Expertise Level"
                    >
                      {EXPERTISE_LEVELS.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formik.values.category || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Category"
                      required
                      error={Boolean(
                        formik.touched.category && formik.errors.category,
                      )}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.category && formik.errors.category && (
                      <Typography variant="caption" color="error">
                        {formik.errors.category as string}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Learning Mode */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Learning Mode</InputLabel>
                    <Select
                      name="learning_mode"
                      value={formik.values.learning_mode || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Learning Mode"
                    >
                      {LEARNING_MODES.map((mode) => (
                        <MenuItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Instructor */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Instructor</InputLabel>
                    <Select
                      name="instructor"
                      value={formik.values.instructor || ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Instructor"
                      required
                      error={Boolean(
                        formik.touched.instructor && formik.errors.instructor,
                      )}
                    >
                      {instructorOptions.map((inst) => (
                        <MenuItem key={inst.guid} value={inst.guid}>
                          {inst.first_name} {inst.last_name} ({inst.email})
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.instructor && formik.errors.instructor && (
                      <Typography variant="caption" color="error">
                        {formik.errors.instructor as string}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Venue and Date for Physical */}
                {formik.values.learning_mode === "PHYSICAL" && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Venue"
                        name="venue"
                        fullWidth
                        value={formik.values.venue}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean(
                          formik.touched.venue && formik.errors.venue,
                        )}
                        helperText={
                          formik.touched.venue &&
                          (formik.errors.venue as string)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Training Date"
                        name="training_date"
                        type="date"
                        fullWidth
                        slotProps={{
                          input: {
                            inputProps: {
                              min: new Date().toISOString().split("T")[0],
                            },
                          },
                        }}
                        InputLabelProps={{ shrink: true }}
                        value={formik.values.training_date}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean(
                          formik.touched.training_date &&
                          formik.errors.training_date,
                        )}
                        helperText={
                          formik.touched.training_date &&
                          (formik.errors.training_date as string)
                        }
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Course Details */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Course Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <ChipInputField
                    label="Tags"
                    value={formik.values.tags}
                    onChange={(newTags) =>
                      formik.setFieldValue("tags", newTags)
                    }
                    placeholder="Add a tag"
                    error={Boolean(formik.touched.tags && formik.errors.tags)}
                    helperText={
                      formik.touched.tags && (formik.errors.tags as string)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <ChipInputField
                    label="Prerequisites"
                    value={formik.values.prerequisites}
                    onChange={(newPrereqs) =>
                      formik.setFieldValue("prerequisites", newPrereqs)
                    }
                    placeholder="Add a prerequisite"
                    error={Boolean(
                      formik.touched.prerequisites &&
                      formik.errors.prerequisites,
                    )}
                    helperText={
                      formik.touched.prerequisites &&
                      (formik.errors.prerequisites as string)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <ChipInputField
                    label="Learning Objectives *"
                    value={formik.values.objectives}
                    onChange={(newObjectives) =>
                      formik.setFieldValue("objectives", newObjectives)
                    }
                    placeholder="Add a learning objective"
                    error={Boolean(
                      formik.touched.objectives && formik.errors.objectives,
                    )}
                    helperText={
                      formik.touched.objectives &&
                      (formik.errors.objectives as string)
                    }
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Pricing & Settings */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Pricing & Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="isPaid"
                        checked={formik.values.isPaid}
                        onChange={formik.handleChange}
                      />
                    }
                    label="This is a paid course"
                  />
                </Grid>
                {formik.values.isPaid && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Price"
                        name="amount"
                        type="number"
                        fullWidth
                        placeholder="0.00"
                        value={formik.values.amount}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean(
                          formik.touched.amount && formik.errors.amount,
                        )}
                        helperText={
                          formik.touched.amount &&
                          (formik.errors.amount as string)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl
                        fullWidth
                        error={Boolean(
                          formik.touched.currency && formik.errors.currency,
                        )}
                      >
                        <InputLabel>Currency *</InputLabel>
                        <Select
                          name="currency"
                          value={formik.values.currency}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          label="Currency"
                        >
                          {CURRENCIES.map((currency) => (
                            <MenuItem key={currency} value={currency}>
                              {currency}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>

            {Object.keys(formik.errors).length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Please fix the errors above before submitting.
              </Alert>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={formik.isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={() => formik.handleSubmit()}
          variant="contained"
          disabled={formik.isSubmitting}
          sx={{ minWidth: 120 }}
        >
          {formik.isSubmitting
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
              ? "Update Course"
              : "Create Course"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
