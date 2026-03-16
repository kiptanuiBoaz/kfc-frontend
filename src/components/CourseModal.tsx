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
import { categories } from "@/lib/categories";
import { apiClient } from "@/api/apiClient";
import { useUser } from "@/hooks/useAuth";
import { Report } from "notiflix/build/notiflix-report-aio";
import { ChipInputField } from "@/components/shared/ChipInputFeld";
import FileUpload from "@/components/shared/FileUpload";

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

  useEffect(() => {
    setBannerUrls(course?.image ? [course.image] : []);
  }, [course]);

  const formik = useFormik({
    initialValues: course || {
      ...CourseInitialValues,
      instructor: user?.guid || "",
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
        const payload = {
          ...rest,
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
