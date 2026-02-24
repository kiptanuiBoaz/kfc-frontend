import React from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import {
  ModuleTopicInitialValues,
  ModuleTopicSchema,
} from "@/schemas/instructor/topic.schema";
import { apiClient } from "@/api/apiClient";
import { Notify } from "notiflix";
import { TCourseModule, TModuleTopic } from "@/types/course.types";

const convertDurationToMinutes = (
  duration?: string | number | null,
): string => {
  if (duration === null || duration === undefined) {
    return "";
  }

  if (typeof duration === "number" && Number.isFinite(duration)) {
    return String(duration);
  }

  if (typeof duration === "string") {
    if (!duration.trim()) {
      return "";
    }

    if (/^\d+$/.test(duration)) {
      return duration;
    }

    const timeParts = duration.split(":").map((part) => Number(part));
    if (
      timeParts.length >= 2 &&
      timeParts.every((part) => Number.isFinite(part))
    ) {
      const [hours = 0, minutes = 0, seconds = 0] = timeParts;
      const totalMinutes = hours * 60 + minutes + Math.round(seconds / 60);
      return String(totalMinutes);
    }
  }

  return "";
};
//comment

const convertMinutesToDurationString = (value?: string | number): string => {
  const minutes = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(minutes) || minutes < 0) {
    return "00:00:00";
  }

  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const mins = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const pad = (unit: number) => String(unit).padStart(2, "0");

  return `${pad(hours)}:${pad(mins)}:${pad(seconds)}`;
};

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
  const isEditMode = Boolean(topic?.guid);
  const moduleName = module?.name || module?.title;
  const initialValues = React.useMemo(
    () =>
      topic
        ? {
            ...topic,
            duration: convertDurationToMinutes(topic.duration),
          }
        : { ...ModuleTopicInitialValues },
    [topic],
  );

  const formik = useFormik({
    initialValues,
    validationSchema: ModuleTopicSchema,
    enableReinitialize: true,
    validateOnBlur: true,
    onSubmit: async (values, helpers) => {
      try {
        setErrorMessage(null);
        const payload = {
          ...values,
          duration: convertMinutesToDurationString(values.duration),
        };

        if (isEditMode && topic) {
          await apiClient.patch(
            `/main/v1/topics/${topic.guid}/update/`,
            payload,
          );
          Notify.success("Topic updated successfully");
        } else if (module?.guid) {
          await apiClient.post("/main/v1/topics/create/", {
            ...payload,
            module: module.guid,
            files: [
              "https://file-examples.com/storage/fe333e46dc691f3309c6c82/2017/10/file-sample_150kB.pdf",
            ],
            files_description: "File description",
            videos: ["https://www.pexels.com/download/video/5538137/"],
            videos_description: "Sample video",
            images: [
              "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1000&q=80",
            ],
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
