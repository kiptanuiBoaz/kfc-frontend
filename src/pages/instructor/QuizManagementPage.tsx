import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/api/apiClient";
import { TCourseQuestion } from "@/types/course.types";
import { Notify } from "notiflix";
import { CustomContainer } from "@/components/shared/CustomContainer";
import { QuestionFormModal } from "@/components/instructor/QuestionFormModal";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";
import { TQuiz } from "@/types/quiz.types";
import LoadingPage from "@/components/shared/LoadingPage";
import ErrorPage from "@/pages/errors/ErrorPage";

export const QuizManagementPage: React.FC = () => {
  const { quizGuid } = useParams<{ quizGuid: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<TCourseQuestion | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: quiz,
    isLoading: isQuizLoading,
    isError: isQuizError,
  } = useQuery<TQuiz>({
    queryKey: ["quiz", quizGuid],
    queryFn: async () =>
      await apiClient.get<TQuiz>(`/main/v1/quizzes/${quizGuid}/`),
    enabled: !!quizGuid,
  });

  const {
    data: questions = [],
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
  } = useQuery<TCourseQuestion[]>({
    queryKey: ["quizQuestions", quizGuid],
    queryFn: async () =>
      await apiClient.get<TCourseQuestion[]>(
        `/main/v1/quizzes/${quizGuid}/questions/`
      ),
    enabled: !!quizGuid,
  });

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(false);
    setEditingQuestion(null);
    setTimeout(() => {
      setCreateDialogOpen(true);
    }, 0);
  };

  const handleOpenEditDialog = (question: TCourseQuestion) => {
    setCreateDialogOpen(false);
    setTimeout(() => {
      setEditingQuestion(question);
      setCreateDialogOpen(true);
    }, 0);
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setEditingQuestion(null);
  };

  const handleOpenDeleteDialog = (questionGuid: string) => {
    setQuestionToDelete(questionGuid);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setQuestionToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/main/v1/questions/${questionToDelete}/delete/`);
      Notify.success("Question deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: ["quizQuestions", quizGuid],
      });
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting question:", error);
      Notify.failure("Failed to delete question. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["quizQuestions", quizGuid],
    });
  };

  const renderQuestionPreview = (question: TCourseQuestion) => {
    switch (question.question_type) {
      case "mcq":
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Options:
            </Typography>
            <Stack spacing={1}>
              {(question.options || []).map((option, index) => (
                <Stack
                  key={index}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  {question.correct_answer === option ? (
                    <CheckCircle size={16} color="green" />
                  ) : (
                    <XCircle size={16} color="gray" />
                  )}
                  <Typography variant="body2">{option}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        );
      case "true_false":
        return (
          <Typography variant="body2" color="text.secondary">
            Correct Answer:{" "}
            {question.correct_answer === "true" ? "True" : "False"}
          </Typography>
        );
      case "short_answer":
        return (
          <Typography variant="body2" color="text.secondary">
            Expected Answer: {question.correct_answer}
          </Typography>
        );
      default:
        return null;
    }
  };

  if (isQuizLoading) {
    return <LoadingPage message="Loading Questions..." />;
  }

  if (isQuizError || !quiz) {
    return (
      <ErrorPage
        // title="Quiz Not Found"
        message="The requested quiz could not be found. Please check the link or return to the dashboard."
        // onBack={() => navigate("/instructor/dashboard")}
      />
    );
  }

  return (
    <CustomContainer>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        mb={4}
        sx={{ borderBottom: 1, borderColor: "divider", pb: 2 }}
      >
        <IconButton onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {quiz.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage Questions
          </Typography>
        </Box>
      </Stack>

      {/* Questions List */}
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Questions ({questions.length})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage quiz questions with different types and answers.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={handleOpenCreateDialog}
          >
            Add Question
          </Button>
        </Stack>

        {isQuestionsLoading ? (
          <Stack alignItems="center" py={6} spacing={2}>
            <CircularProgress />
            <Typography>Loading questions...</Typography>
          </Stack>
        ) : isQuestionsError ? (
          <Alert severity="error">
            Unable to load questions. Please refresh the page.
          </Alert>
        ) : questions.length === 0 ? (
          <Paper sx={{ p: 6, borderRadius: 3, textAlign: "center" }}>
            <Stack spacing={3} alignItems="center">
              <CheckCircle size={64} color="#9e9e9e" />
              <Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Questions Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Start building your quiz by adding the first question.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Plus size={20} />}
                  onClick={handleOpenCreateDialog}
                  size="large"
                >
                  Add First Question
                </Button>
              </Box>
            </Stack>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {questions.map((question, index) => (
              <Card key={index} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box flexGrow={1}>
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          mb={1}
                        >
                          <Typography variant="h6" fontWeight={600}>
                            Question {index + 1}
                          </Typography>
                          <Chip
                            label={question.question_type.toUpperCase()}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={`${question.marks} mark${
                              question.marks !== 1 ? "s" : ""
                            }`}
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        </Stack>
                        <Typography variant="body1" gutterBottom>
                          {question.question_text}
                        </Typography>
                        {renderQuestionPreview(question)}
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit question">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(question)}
                          >
                            <Edit2 size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete question">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleOpenDeleteDialog(question.guid!)
                            }
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Question Form Modal */}
      <QuestionFormModal
        open={isCreateDialogOpen}
        onClose={handleCloseDialog}
        quizGuid={quizGuid!}
        editingQuestion={editingQuestion}
        questions={questions}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </CustomContainer>
  );
};
