import React, { useState, useMemo } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { Plus, Edit2, Trash2, HelpCircle, BookOpen } from "lucide-react";
import * as Yup from "yup";
import { apiClient } from "@/api/apiClient";
import { TCourse, TCourseModule } from "@/types/course.types";
import { Notify } from "notiflix";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { TQuiz } from "@/types/quiz.types";

interface QuizzesTabProps {
  courseGuid: string;
  course: TCourse;
}

interface QuizFormValues {
  name: string;
  description: string;
  module: string;
}

const QuizSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string(),
  module: Yup.string().required("Module is required"),
});

const getInitialValues = (): QuizFormValues => ({
  name: "",
  description: "",
  module: "",
});

export const QuizzesTab: React.FC<QuizzesTabProps> = ({
  courseGuid,
  course,
}) => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<TQuiz | null>(null);
  const queryClient = new QueryClient();

  const {
    data: allModules = [],
    isLoading: isModulesLoading,
    isError: isModulesError,
    refetch: refetchModules,
  } = useQuery<TCourseModule[]>({
    queryKey: ["courseModules", courseGuid],
    queryFn: async () => {
      const data = await apiClient.get<TCourseModule[]>(
        `/main/v1/courses/${courseGuid}/modules/`
      );
      return data ?? [];
    },
    enabled: !!courseGuid,
  });

  const formik = useFormik<QuizFormValues>({
    initialValues: getInitialValues(),
    validationSchema: QuizSchema,
    onSubmit: async (values) => {
      try {
        if (editingQuiz) {
          Notify.success("Quiz updated successfully!");
          await apiClient.patch(
            `/main/v1/quizzes/${editingQuiz.guid}/update/`,
            values
          );
        } else {
          await apiClient.post("/main/v1/quizzes/create/", {
            ...values,
            course: courseGuid,
          });
          Notify.success("Quiz created successfully!");
        }

        handleCloseDialog();
      } catch (error) {
        console.error("Error saving quiz:", error);
        Notify.failure("Failed to save quiz. Please try again.");
      } finally {
        refetchModules();
      }
    },
  });

  const handleOpenCreateDialog = (moduleGuid?: string) => {
    setEditingQuiz(null);
    formik.resetForm();
    if (moduleGuid) {
      formik.setFieldValue("module", moduleGuid);
    }
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (quiz: TQuiz, moduleGuid: string) => {
    setEditingQuiz(quiz);
    formik.setValues({
      name: quiz.name,
      description: quiz.description || "",
      module: moduleGuid,
    });
    setCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setEditingQuiz(null);
    formik.resetForm();
  };

  const handleDeleteQuiz = async (quizGuid: string) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await apiClient.delete(`/main/v1/quizzes/${quizGuid}/delete/`);
        Notify.success("Quiz deleted successfully!");
      } catch (error) {
        console.error("Error deleting quiz:", error);
        Notify.failure("Failed to delete quiz. Please try again.");
      } finally {
        refetchModules();
      }
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
        alignItems={{ xs: "flex-start", md: "center" }}
        mb={3}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Course Quizzes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage quizzes to assess student learning.
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={2}>
        {allModules.map((module) => (
          <Accordion key={module.guid} sx={{ borderRadius: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ borderRadius: 2 }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                flexGrow={1}
              >
                <BookOpen size={20} color="#666" />
                <Box flexGrow={1}>
                  <Typography variant="body1" fontWeight={600}>
                    {module.name || module.title || "Untitled Module"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {module.quizzes ? module.quizzes.length : 0} quiz
                    {(module.quizzes ? module.quizzes.length : 0) !== 1
                      ? "es"
                      : ""}
                  </Typography>
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={1.5}
                mb={2}
              >
                <Typography variant="body2" color="text.secondary">
                  {module.quizzes ? module.quizzes.length : 0} quiz
                  {(module.quizzes ? module.quizzes.length : 0) !== 1
                    ? "es"
                    : ""}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Plus size={16} />}
                  onClick={() => handleOpenCreateDialog(module.guid)}
                >
                  Add Quiz
                </Button>
              </Stack>
              {!module.quizzes || module.quizzes.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No quizzes yet. Click "Add Quiz" to create one.
                </Typography>
              ) : (
                <ol style={{ paddingLeft: "20px", margin: 0 }}>
                  {module.quizzes.map((quiz, index) => (
                    <li key={quiz.guid} style={{ marginBottom: "8px" }}>
                      {/* <Card>
                        <CardContent
                          sx={{ py: 2, px: 3, "&:last-child": { pb: 2 } }}
                        > */}
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box flexGrow={1}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            mb={0.5}
                          >
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              sx={{
                                cursor: "pointer",
                                "&:hover": { color: "primary.main" },
                              }}
                              onClick={() =>
                                navigate(
                                  `/instructor/courses/${courseGuid}/quizzes/${quiz.guid}`
                                )
                              }
                            >
                              {quiz.name}
                            </Typography>
                          </Stack>
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit quiz">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleOpenEditDialog(quiz, module.guid)
                              }
                              sx={{
                                bgcolor: "background.paper",
                                boxShadow: 1,
                                "&:hover": { bgcolor: "primary.light" },
                              }}
                            >
                              <Edit2 size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete quiz">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteQuiz(quiz.guid)}
                              sx={{
                                bgcolor: "background.paper",
                                boxShadow: 1,
                                "&:hover": { bgcolor: "error.light" },
                              }}
                            >
                              <Trash2 size={14} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                      {/* </CardContent>
                      </Card> */}
                    </li>
                  ))}
                </ol>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      {/* Create/Edit Quiz Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingQuiz ? "Edit Quiz" : "Create New Quiz"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Quiz Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                required
              />

              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.description &&
                  Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
                placeholder="Optional description for the quiz"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              loading={formik.isSubmitting}
              type="submit"
              variant="contained"
              disabled={!formik.isValid}
            >
              {editingQuiz ? "Update Quiz" : "Create Quiz"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
