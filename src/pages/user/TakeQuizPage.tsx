import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemText,
  Grid,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/useAuth";
import { PATHS } from "@/navigation/paths";
import { TQuiz, TQuizResults } from "@/types/quiz.types";
import { CustomContainer } from "@/components/shared/CustomContainer";
import { apiClient } from "@/api/apiClient";
import OptionSelector from "@/components/shared/OptionSelector";
import LoadingPage from "@/components/shared/LoadingPage";
import { ArrowBack } from "@mui/icons-material";

const TakeQuizPage: React.FC = () => {
  const { moduleGuid, quizGuid } = useParams<{
    moduleGuid: string;
    quizGuid: string;
  }>();
  const navigate = useNavigate();
  const user = useUser();
  const { courseGuid } = useParams();
  const queryClient = useQueryClient();
  const params = new URLSearchParams();
  const currentTopic = params.get("topic");

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [retrying, setRetrying] = useState(false);
  const [showingResults, setShowingResults] = useState(true);

  const { data: quizzes = [], isLoading: quizzesLoading } = useQuery({
    queryKey: ["moduleQuizzes", moduleGuid],
    enabled: !!moduleGuid,
    queryFn: async () =>
      await apiClient.get<TQuiz[]>(`/main/v1/modules/${moduleGuid}/quizzes/`),
  });

  const selectedQuiz = quizzes.find((q) => q.guid === quizGuid);

  const { data: results, isLoading: resultsLoading } = useQuery<TQuizResults>({
    queryKey: ["quizResults", quizGuid],
    enabled: !!quizGuid,
    queryFn: async () =>
      await apiClient.get<TQuizResults>(
        `/main/v1/quizzes/${quizGuid}/results/`
      ),
  });

  const submitMutation = useMutation({
    mutationFn: async (response: {
      user: string;
      question: string;
      selected_answer: string;
    }) => {
      await apiClient.post("/main/v1/quiz/submit/", response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizResults", quizGuid] });
    },
  });

  const handleAnswerChange = (questionGuid: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionGuid]: answer }));
  };

  const handleBack = () => {
    navigate(
      `/courses/${courseGuid}/learn?module=${moduleGuid}&topic=${currentTopic}`
    );
  };
  const handleSubmit = async () => {
    if (!selectedQuiz || !user?.guid) return;

    const promises = selectedQuiz.questions.map((question) => {
      const selected = answers[question.guid];
      if (selected) {
        return submitMutation.mutateAsync({
          user: user.guid,
          question: question.guid,
          selected_answer: selected,
        });
      }
      return Promise.resolve();
    });

    await Promise.all(promises);
    setRetrying(false);
    setShowingResults(true);
    queryClient.invalidateQueries({ queryKey: ["quizResults", quizGuid] });
  };

  const handleRetry = () => {
    setAnswers({});
    setRetrying(true);
    setShowingResults(false);
  };

  const handleQuizSelect = (selectedQuizGuid: string) => {
    navigate(
      PATHS.TAKE_QUIZ_PAGE.replace(":moduleGuid", moduleGuid!).replace(
        ":quizGuid",
        selectedQuizGuid
      )
    );
  };

  if (quizzesLoading || resultsLoading) {
    return <LoadingPage message="Loading questions..." />;
  }

  if (!quizzes || !selectedQuiz) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Failed to load quizzes. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <CustomContainer>
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quizzes
              <List>
                {quizzes
                  .filter((q) => q.question_count > 0)
                  .map((q) => (
                    <ListItemButton
                      key={q.guid}
                      selected={q.guid === quizGuid}
                      onClick={() => handleQuizSelect(q.guid)}
                    >
                      <ListItemText
                        primary={q.name}
                        secondary={`${q.question_count} questions`}
                      />
                    </ListItemButton>
                  ))}
              </List>
            </Typography>{" "}
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
            >
              Back to Course
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          {" "}
          <Typography variant="h4" gutterBottom>
            {selectedQuiz.module_details.name} - Quiz
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {selectedQuiz.name}
            </Typography>
            {selectedQuiz.description && (
              <Typography variant="body1" sx={{ mb: 4 }}>
                {selectedQuiz.description}
              </Typography>
            )}

            {showingResults && results?.completed && !retrying ? (
              <Stack spacing={3}>
                <Alert severity="success">
                  Quiz completed! Your score: {results.total_marks} /{" "}
                  {results.possible_marks} ({results.score_percentage}%)
                </Alert>
                {selectedQuiz.questions.map((question, index) => {
                  const result = results.responses.find(
                    (r) => r.question_details.guid === question.guid
                  );
                  return (
                    <Card key={question.guid}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {index + 1}. {question.question_text}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your answer:{" "}
                          {result?.selected_answer || "Not answered"}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={
                            result?.is_correct ? "success.main" : "error.main"
                          }
                        >
                          {result?.is_correct ? "Correct" : "Incorrect"}
                        </Typography>
                        <Typography variant="body2">
                          Correct answer: {question.correct_answer}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                  {results.correct_answers < results.questions_answered && (
                    <Button variant="contained" onClick={handleRetry}>
                      Retry
                    </Button>
                  )}
                  <Button variant="outlined" onClick={handleBack}>
                    Back to Course
                  </Button>
                </Box>
              </Stack>
            ) : (
              <Stack spacing={3}>
                {selectedQuiz.questions.map((question, index) => (
                  <Card key={question.guid}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {index + 1}. {question.question_text}
                      </Typography>
                      <OptionSelector
                        options={question.options}
                        selectedValue={answers[question.guid] || ""}
                        onChange={(value) =>
                          handleAnswerChange(question.guid, value)
                        }
                      />
                    </CardContent>
                  </Card>
                ))}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  {user.role.name !== "ADMIN" && (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending
                        ? "Submitting..."
                        : "Submit Quiz"}
                    </Button>
                  )}
                </Box>
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </CustomContainer>
  );
};

export default TakeQuizPage;
