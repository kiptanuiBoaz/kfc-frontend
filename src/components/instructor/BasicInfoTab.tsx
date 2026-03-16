import React, { useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { CheckCircle2, Edit2 } from "lucide-react";
import { TCourse } from "@/types/course.types";

interface BasicInfoTabProps {
  course: TCourse;
  totalModules: number;
  totalTopics: number;
  onEdit?: () => void;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  course,
  totalModules,
  totalTopics,
  onEdit,
}) => {
  const theme = useTheme();
  const renderTagGroup = (
    label: string,
    values?: string[] | null,
    placeholder = "No data yet",
  ) => (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      {values && values.length > 0 ? (
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {values.map((value) => (
            <Chip key={value} label={value} size="small" />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {placeholder}
        </Typography>
      )}
    </Box>
  );

  const learningHighlights = useMemo(
    () =>
      course?.objectives && course.objectives.length > 0
        ? course.objectives
        : [
            "No objectives have been added yet. Use the course builder to define learning outcomes and keep this syllabus fresh.",
          ],
    [course?.objectives],
  );

  return (
    <Grid container spacing={3} alignItems="flex-start">
      <Grid item xs={12}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          {onEdit && (
            <Button
              variant="outlined"
              startIcon={<Edit2 size={18} />}
              onClick={onEdit}
            >
              Edit Course
            </Button>
          )}
        </Box>
      </Grid>
      <Grid item xs={12} lg={8}>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              What You'll Learn
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              {learningHighlights.map((item, index) => (
                <Grid item xs={12} key={`${item}-${index}`}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckCircle2
                      size={18}
                      color={theme.palette.primary.main as string}
                      style={{ marginTop: 4 }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      {item}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Stack spacing={3}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                Course Structure
              </Typography>
              {renderTagGroup("Tags", course.tags)}
              {course?.prerequisites?.length > 0 &&
                renderTagGroup("Prerequisites", course.prerequisites)}
            </Stack>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
};
