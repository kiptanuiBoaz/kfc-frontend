import React, { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { TCourse, TCourseModule } from "@/types/course.types";

import { QuizResponseAccordion } from "@/components/instructor/QuizResponseAccordion";

interface QuizResponsesTabProps {
  courseGuid: string;
  course: TCourse;
}

export const QuizResponsesTab: React.FC<QuizResponsesTabProps> = ({
  courseGuid,
  course,
}) => {
  const {
    data: allModules = [],
    isLoading: isModulesLoading,
    isError: isModulesError,
  } = useQuery<TCourseModule[]>({
    queryKey: ["courseModules", courseGuid],
    queryFn: async () => {
      const data = await apiClient.get<TCourseModule[]>(
        `/main/v1/courses/${courseGuid}/modules/`
      );
      return data ?? [];
    },
    enabled: !!courseGuid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const allQuizzes = useMemo(
    () =>
      allModules.flatMap((module) =>
        (module.quizzes || []).map((quiz) => ({
          ...quiz,
          moduleName: module.name || module.title,
        }))
      ),
    [allModules]
  );

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
            Quiz Responses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View student responses and submissions for quizzes.
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={2}>
        {allQuizzes.map((quiz) => (
          <QuizResponseAccordion key={quiz.guid} quiz={quiz} />
        ))}
      </Stack>
    </Box>
  );
};
