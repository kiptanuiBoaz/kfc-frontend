import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/navigation/paths";
import { TQuiz } from "@/types/quiz.types";

interface QuizListProps {
  quizzes: TQuiz[];
  moduleGuid: string;
}

const QuizList: React.FC<QuizListProps> = ({ quizzes, moduleGuid }) => {
  const navigate = useNavigate();
  const validQuizzes = quizzes.filter((quiz) => quiz.question_count > 0);

  if (validQuizzes.length === 0) {
    return null;
  }

  const handleTakeQuiz = (quizGuid: string) => {
    navigate(
      PATHS.TAKE_QUIZ_PAGE.replace(":moduleGuid", moduleGuid).replace(
        ":quizGuid",
        quizGuid
      )
    );
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 1, mb: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Quizzes
      </Typography>
      <List>
        {validQuizzes.map((quiz) => (
          <ListItem key={quiz.guid} sx={{ px: 0 }}>
            <ListItemText
              primary={quiz.name}
              secondary={`${quiz.question_count} questions`}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleTakeQuiz(quiz.guid)}
            >
              Take Quiz
            </Button>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default QuizList;
