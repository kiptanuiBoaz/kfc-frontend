import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { Plus, Trash2 } from "lucide-react";
import * as Yup from "yup";
import { apiClient } from "@/api/apiClient";
import { TCourseQuestion } from "@/types/course.types";
import { Notify } from "notiflix";

interface QuestionFormValues {
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  marks: number;
  order: number;
}

const QuestionSchema = Yup.object().shape({
  question_text: Yup.string().required("Question text is required"),
  question_type: Yup.string().required("Question type is required"),
  options: Yup.array().when(["question_type"], ([question_type], schema) =>
    question_type === "mcq"
      ? schema
          .of(Yup.string().required())
          .min(2, "At least 2 options required")
          .required()
      : schema
  ),
  correct_answer: Yup.mixed().required("Correct answer is required"),
  marks: Yup.number()
    .min(1, "Marks must be at least 1")
    .required("Marks are required"),
});

interface QuestionFormModalProps {
  open: boolean;
  onClose: () => void;
  quizGuid: string;
  editingQuestion: TCourseQuestion | null;
  questions: TCourseQuestion[];
  onSuccess: () => void;
}

export const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  open,
  onClose,
  quizGuid,
  editingQuestion,
  questions,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitialValues = (
    questions: TCourseQuestion[],
    editingQuestion: TCourseQuestion | null
  ): QuestionFormValues => {
    if (editingQuestion) {
      return {
        question_text: editingQuestion.question_text,
        question_type: editingQuestion.question_type,
        options: editingQuestion.options || ["", ""],
        correct_answer: editingQuestion.correct_answer,
        marks: editingQuestion.marks,
        order: editingQuestion.order,
      };
    }
    return {
      question_text: "",
      question_type: "mcq",
      options: ["", ""],
      correct_answer: "",
      marks: 1,
      order: Math.max(...questions.map((q) => q.order), 0) + 1,
    };
  };

  const formik = useFormik<QuestionFormValues>({
    initialValues: getInitialValues(questions, editingQuestion),
    validationSchema: QuestionSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const payload = {
          ...values,
          quiz: quizGuid,
        };

        if (editingQuestion) {
          await apiClient.patch(
            `/main/v1/questions/${editingQuestion.guid}/update/`,
            payload
          );
          Notify.success("Question updated successfully!");
        } else {
          await apiClient.post("/main/v1/questions/create/", payload);
          Notify.success("Question created successfully!");
        }

        onSuccess();
        onClose();
      } catch (error) {
        console.error("Error saving question:", error);
        Notify.failure("Failed to save question. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleAddOption = () => {
    const newOptions = [...formik.values.options, ""];
    formik.setFieldValue("options", newOptions);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = formik.values.options.filter((_, i) => i !== index);
    formik.setFieldValue("options", newOptions);
    if (formik.values.correct_answer === formik.values.options[index]) {
      formik.setFieldValue("correct_answer", "");
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formik.values.options];
    newOptions[index] = value;
    formik.setFieldValue("options", newOptions);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {editingQuestion ? "Edit Question" : "Add New Question"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {/* <FormControl component="fieldset">
              <FormLabel component="legend">Question Type</FormLabel>
              <RadioGroup
                row
                value={formik.values.question_type}
                onChange={(e) => handleQuestionTypeChange(e.target.value)}
              >
                <FormControlLabel
                  value="mcq"
                  control={<Radio />}
                  label="Multiple Choice"
                />
                <FormControlLabel
                  value="short_answer"
                  control={<Radio />}
                  label="Short Answer"
                />
                <FormControlLabel
                  value="true_false"
                  control={<Radio />}
                  label="True/False"
                />
              </RadioGroup>
            </FormControl> */}

            <TextField
              fullWidth
              label="Question Text"
              name="question_text"
              multiline
              rows={3}
              value={formik.values.question_text}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.question_text &&
                Boolean(formik.errors.question_text)
              }
              helperText={
                formik.touched.question_text && formik.errors.question_text
              }
              required
            />

            {formik.values.question_type === "mcq" && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Options
                </Typography>
                <Stack spacing={2}>
                  {formik.values.options.map((option, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      spacing={2}
                      alignItems="center"
                    >
                      <TextField
                        fullWidth
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                      />
                      <FormControlLabel
                        control={
                          <Radio
                            checked={formik.values.correct_answer === option}
                            onChange={() =>
                              formik.setFieldValue("correct_answer", option)
                            }
                          />
                        }
                        label="Correct"
                      />
                      {formik.values.options.length > 2 && (
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveOption(index)}
                          color="error"
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      )}
                    </Stack>
                  ))}
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<Plus size={16} />}
                      onClick={handleAddOption}
                      size="small"
                    >
                      Add Option
                    </Button>
                  </Box>
                </Stack>
              </Box>
            )}

            {formik.values.question_type === "true_false" && (
              <FormControl component="fieldset">
                <FormLabel component="legend">Correct Answer</FormLabel>
                <RadioGroup
                  value={formik.values.correct_answer}
                  onChange={(e) =>
                    formik.setFieldValue("correct_answer", e.target.value)
                  }
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="True"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="False"
                  />
                </RadioGroup>
              </FormControl>
            )}

            {formik.values.question_type === "short_answer" && (
              <TextField
                fullWidth
                label="Expected Answer"
                value={formik.values.correct_answer}
                onChange={(e) =>
                  formik.setFieldValue("correct_answer", e.target.value)
                }
                placeholder="Enter the expected short answer"
              />
            )}

            <TextField
              fullWidth
              label="Marks"
              name="marks"
              type="number"
              value={formik.values.marks}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.marks && Boolean(formik.errors.marks)}
              helperText={formik.touched.marks && formik.errors.marks}
              required
              inputProps={{ min: 1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            disabled={!formik.isValid || isSubmitting}
            variant="contained"
          >
            {editingQuestion ? "Update Question" : "Add Question"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
