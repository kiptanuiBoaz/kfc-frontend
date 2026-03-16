import React from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Image as ImageIcon,
  VideoFile,
  PictureAsPdf,
  Close,
} from "@mui/icons-material";
import { useFormik } from "formik";
import {
  ModuleTopicInitialValues,
  ModuleTopicSchema,
} from "@/schemas/instructor/topic.schema";
import { apiClient } from "@/api/apiClient";
import { Notify } from "notiflix";
import { TCourseModule, TModuleTopic } from "@/types/course.types";
import FileUpload from "@/components/shared/FileUpload";

interface TopicFormDialogProps {
  open: boolean;
  onClose: () => void;
  module?: TCourseModule | null;
  topic?: TModuleTopic | null;
  onSuccess?: () => void;
}

export const TopicFormDialog: React.FC<TopicFormDialogProps> = ({
  open,
  onClose,
  module,
  topic,
  onSuccess,
}) => {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const [videoUrls, setVideoUrls] = React.useState<string[]>([]);
  const [pdfUrls, setPdfUrls] = React.useState<string[]>([]);
  const [expandedUpload, setExpandedUpload] = React.useState<
    "image" | "video" | "file" | null
  >(null);
  const isEditMode = Boolean(topic?.guid);

  const toggleUpload = (type: "image" | "video" | "file") => {
    setExpandedUpload((prev) => (prev === type ? null : type));
  };
  const moduleName = module?.name || module?.title;

  const formik = useFormik({
    initialValues: topic || ModuleTopicInitialValues,
    validationSchema: ModuleTopicSchema,
    enableReinitialize: true,
    validateOnBlur: true,
    onSubmit: async (values, helpers) => {
      try {
        setErrorMessage(null);

        if (isEditMode && topic) {
          await apiClient.patch(
            `/main/v1/topics/${topic.guid}/update/`,
            values,
          );
          Notify.success("Topic updated successfully");
        } else if (module?.guid) {
          await apiClient.post("/main/v1/topics/create/", {
            ...values,
            module: module.guid,
            files: pdfUrls,
            files_description: "File description",
            videos: videoUrls,
            videos_description: "Sample video",
            images: imageUrls,
          });
          Notify.success("Topic added successfully");
        }

        formik.resetForm();
        onSuccess?.();
        onClose();
      } catch (error) {
        setErrorMessage("Unable to save topic. Please try again");
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const dialogTitle = moduleName
    ? `${isEditMode ? "Update" : "Add"} topic for ${moduleName}`
    : isEditMode
      ? "Update topic"
      : "Add topic";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <TextField
            label="Topic name"
            name="name"
            fullWidth
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.name && formik.errors.name)}
            helperText={formik.touched.name && (formik.errors.name as string)}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            minRows={3}
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
          <TextField
            label="Duration (minutes)"
            name="duration"
            type="number"
            fullWidth
            value={formik.values.duration}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.duration && formik.errors.duration)}
            helperText={
              formik.touched.duration && (formik.errors.duration as string)
            }
          />
          <TextField
            label="Order"
            name="order"
            type="number"
            fullWidth
            value={formik.values.order}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.order && formik.errors.order)}
            helperText={formik.touched.order && (formik.errors.order as string)}
          />

          {/* Resource Upload Section */}
          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1.5 }}
            >
              Add Resources
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Badge badgeContent={imageUrls.length} color="primary">
                <Chip
                  icon={expandedUpload === "image" ? <Close /> : <ImageIcon />}
                  label="Images"
                  variant={expandedUpload === "image" ? "filled" : "outlined"}
                  color={expandedUpload === "image" ? "primary" : "default"}
                  onClick={() => toggleUpload("image")}
                  sx={{ cursor: "pointer" }}
                />
              </Badge>
              <Badge badgeContent={videoUrls.length} color="primary">
                <Chip
                  icon={expandedUpload === "video" ? <Close /> : <VideoFile />}
                  label="Videos"
                  variant={expandedUpload === "video" ? "filled" : "outlined"}
                  color={expandedUpload === "video" ? "primary" : "default"}
                  onClick={() => toggleUpload("video")}
                  sx={{ cursor: "pointer" }}
                />
              </Badge>
              <Badge badgeContent={pdfUrls.length} color="primary">
                <Chip
                  icon={
                    expandedUpload === "file" ? <Close /> : <PictureAsPdf />
                  }
                  label="Documents"
                  variant={expandedUpload === "file" ? "filled" : "outlined"}
                  color={expandedUpload === "file" ? "primary" : "default"}
                  onClick={() => toggleUpload("file")}
                  sx={{ cursor: "pointer" }}
                />
              </Badge>
            </Stack>

            <Collapse in={expandedUpload === "image"} timeout="auto">
              <Box sx={{ mt: 2 }}>
                <FileUpload
                  fileType="image"
                  label="Upload Topic Images"
                  description="JPEG, PNG, WEBP (max 100MB each)"
                  values={imageUrls}
                  multiple
                  onChange={setImageUrls}
                />
              </Box>
            </Collapse>

            <Collapse in={expandedUpload === "video"} timeout="auto">
              <Box sx={{ mt: 2 }}>
                <FileUpload
                  fileType="video"
                  label="Upload Topic Videos"
                  description="MP4, WebM, OGG (max 100MB each)"
                  values={videoUrls}
                  multiple
                  onChange={setVideoUrls}
                />
              </Box>
            </Collapse>

            <Collapse in={expandedUpload === "file"} timeout="auto">
              <Box sx={{ mt: 2 }}>
                <FileUpload
                  fileType="file"
                  label="Upload Topic Documents"
                  description="PDF files (max 100MB each)"
                  values={pdfUrls}
                  multiple
                  onChange={setPdfUrls}
                />
              </Box>
            </Collapse>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={() => formik.handleSubmit()}
          variant="contained"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Saving..."
            : isEditMode
              ? "Update topic"
              : "Save topic"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
