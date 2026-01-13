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
  CourseModuleSchema,
  ModuleFormValues,
  ModuleInitialValues,
} from "@/schemas/instructor/module.schema";
import { apiClient } from "@/api/apiClient";
import { Notify } from "notiflix";
import { TCourseModule } from "@/types/course.types";

interface ModuleFormDialogProps {
  open: boolean;
  onClose: () => void;
  courseGuid?: string | null;
  moduleData?: TCourseModule | null;
  onSuccess?: () => void;
}

const getInitialValues = (
  moduleData?: TCourseModule | null
): ModuleFormValues => ({
  name: moduleData?.name || moduleData?.title || ModuleInitialValues.name,
  description: moduleData?.description ?? ModuleInitialValues.description,
  order: moduleData?.order ?? ModuleInitialValues.order,
});

export const ModuleFormDialog: React.FC<ModuleFormDialogProps> = ({
  open,
  onClose,
  courseGuid,
  moduleData,
  onSuccess,
}) => {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const isEditMode = Boolean(moduleData?.guid);

  const formik = useFormik<ModuleFormValues>({
    initialValues: getInitialValues(moduleData),
    validationSchema: CourseModuleSchema,
    enableReinitialize: true,
    validateOnBlur: true,
    onSubmit: async (values, helpers) => {
      if (!courseGuid && !isEditMode) {
        setErrorMessage("Missing course identifier");
        helpers.setSubmitting(false);
        return;
      }

      try {
        setErrorMessage(null);

        const payload = {
          name: values.name.trim(),
          description: values.description?.trim() || null,
          order: Number(values.order),
        };

        if (isEditMode && moduleData) {
          await apiClient.patch(
            `/main/v1/modules/${moduleData.guid}/update/`,
            payload
          );
          Notify.success("Module updated successfully");
        } else if (courseGuid) {
          await apiClient.post("/main/v1/modules/create/", {
            ...payload,
            course: courseGuid,
          });
          Notify.success("Module created successfully");
        }

        helpers.resetForm({ values: getInitialValues(moduleData) });
        onSuccess?.();
        onClose();
      } catch (error) {
        setErrorMessage("Unable to save module. Please try again");
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? "Update module" : "Add a new module"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <TextField
            label="Module name"
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
              formik.touched.description && formik.errors.description
            )}
            helperText={
              formik.touched.description &&
              (formik.errors.description as string)
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
            ? "Update module"
            : "Save module"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
