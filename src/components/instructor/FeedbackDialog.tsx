import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { useUser } from "@/hooks/useAuth";

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  submission: any;
  quizGuid: string;
  refetch: () => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  open,
  onClose,
  submission,
  quizGuid,
  refetch,
}) => {
  const user = useUser();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState(
    submission?.feedback?.feedback || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  console.log(submission);

  const handleSave = async () => {
    if (!user?.guid || !submission) return;
    setIsSaving(true);
    const data = {
      user: submission.user.guid,
      quiz: quizGuid,
      instructor: user.guid,
      feedback,
    };
    try {
      if (submission.has_feedback) {
        await apiClient.put(
          `/main/v1/quiz-submissions/${data.user}/${data.quiz}/feedback/`,
          {
            user: data.user,
            quiz: data.quiz,
            instructor: data.instructor,
            feedback: data.feedback,
          }
        );
      } else {
        await apiClient.post(
          `/main/v1/quiz-submissions/${data.user}/${data.quiz}/feedback/`,
          {
            user: data.user,
            quiz: data.quiz,
            instructor: data.instructor,
            feedback: data.feedback,
          }
        );
      }
      await queryClient.invalidateQueries({
        queryKey: ["quizSubmissions", quizGuid],
      });
      refetch();
      onClose();
    } catch (error) {
      console.error("Failed to save feedback", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!submission) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(
        `/main/v1/quiz-submissions/${submission.user.guid}/${quizGuid}/feedback/`
      );
      await queryClient.invalidateQueries({
        queryKey: ["quizSubmissions", quizGuid],
      });
      onClose();
    } catch (error) {
      console.error("Failed to delete feedback", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setFeedback(submission?.feedback?.feedback || "");
    onClose();
  };

  return (
    <Dialog maxWidth="sm" fullWidth open={open} onClose={handleClose}>
      <DialogTitle>
        {submission?.has_feedback ? "Edit Feedback" : "Provide Feedback"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Feedback"
          fullWidth
          multiline
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        {submission?.has_feedback && (
          <Button
            onClick={handleDelete}
            color="error"
            disabled={isDeleting || isSaving}
          >
            Delete
          </Button>
        )}
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSaving || isDeleting}
        >
          {submission?.has_feedback ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDialog;
