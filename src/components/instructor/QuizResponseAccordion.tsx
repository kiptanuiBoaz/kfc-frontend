import React, { useState, useCallback, useMemo } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { BookOpen, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { TCourse, TCourseModule } from "@/types/course.types";
import { TQuizSubmission, TQuizSubmissionsResponse } from "@/types/quiz.types";
import FeedbackDialog from "./FeedbackDialog";

export const QuizResponseAccordion: React.FC<{ quiz: any }> = React.memo(
  ({ quiz }) => {
    const [feedbackDialog, setFeedbackDialog] = useState<{
      open: boolean;
      submission: any;
      quizGuid: string;
    }>({
      open: false,
      submission: null,
      quizGuid: "",
    });
    const {
      data: response,
      isLoading,
      refetch,
    } = useQuery<TQuizSubmissionsResponse>({
      queryKey: ["quizSubmissions", quiz.guid],
      queryFn: async () =>
        await apiClient.get<TQuizSubmissionsResponse>(
          `/main/v1/quizzes/${quiz.guid}/submissions/`
        ),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

    function handleFeedbackOpen(
      submission: TQuizSubmission,
      guid: string
    ): void {
      setFeedbackDialog({
        open: true,
        submission: submission,
        quizGuid: guid,
      });
    }

    return (
      <>
        <Accordion sx={{ borderRadius: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ borderRadius: 2 }}
          >
            <Stack direction="row" spacing={2} alignItems="center" flexGrow={1}>
              <BookOpen size={20} color="#666" />
              <Box flexGrow={1}>
                <Typography variant="body1" fontWeight={600}>
                  {quiz.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {quiz.question_count} questions • {quiz.moduleName}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {response?.submissions.length || 0} submissions
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : !response || response.submissions.length === 0 ? (
              <Alert severity="info">No responses yet for this quiz.</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Answered</TableCell>
                      <TableCell>Correct</TableCell>
                      <TableCell>Score (%)</TableCell>
                      <TableCell>Submitted At</TableCell>
                      <TableCell>Feedback</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {response.submissions.map((submission, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {submission.user.name} ({submission.user.email})
                        </TableCell>
                        <TableCell>
                          {submission.answered_questions}/
                          {submission.total_questions}
                        </TableCell>
                        <TableCell>{submission.correct_answers}</TableCell>
                        <TableCell>{submission.score_percentage}%</TableCell>
                        <TableCell>
                          {new Date(submission.submitted_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              handleFeedbackOpen(submission, quiz.guid)
                            }
                          >
                            {submission.has_feedback ? "View/Edit" : "Provide"}{" "}
                            Feedback
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AccordionDetails>
        </Accordion>
        <FeedbackDialog
          open={feedbackDialog.open}
          onClose={() =>
            setFeedbackDialog({
              open: false,
              submission: null,
              quizGuid: "",
            })
          }
          refetch={refetch}
          submission={feedbackDialog.submission}
          quizGuid={feedbackDialog.quizGuid}
        />
      </>
    );
  }
);
