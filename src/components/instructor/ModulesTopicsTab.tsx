import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Edit2, Plus } from "lucide-react";
import { TCourseModule, TModuleTopic } from "@/types/course.types";

interface ModulesTopicsTabProps {
  modules: TCourseModule[];
  totalModules: number;
  totalTopics: number;
  isModulesLoading: boolean;
  isModulesError: boolean;
  onOpenModuleDialog: (module?: TCourseModule | null) => void;
  onOpenTopicDialog: (
    module: TCourseModule,
    topic?: TModuleTopic | null,
  ) => void;
}

export const ModulesTopicsTab: React.FC<ModulesTopicsTabProps> = ({
  modules,
  totalModules,
  totalTopics,
  isModulesLoading,
  isModulesError,
  onOpenModuleDialog,
  onOpenTopicDialog,
}) => {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
        alignItems={{ xs: "flex-start", md: "center" }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Modules & Topics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organize the course into structured learning paths.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Plus size={18} />}
          onClick={() => onOpenModuleDialog()}
        >
          Add Module
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        mb={2}
      >
        <Typography variant="h6" fontWeight={700}>
          Course Syllabus
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {totalModules} modules • {totalTopics} topics
        </Typography>
      </Stack>

      {isModulesLoading && (
        <Stack alignItems="center" py={6} spacing={2}>
          <CircularProgress />
          <Typography>Loading modules...</Typography>
        </Stack>
      )}

      {!isModulesLoading && isModulesError && (
        <Alert severity="error">
          Unable to load modules. Please refresh the page.
        </Alert>
      )}

      {!isModulesLoading && !isModulesError && modules.length === 0 && (
        <Stack spacing={1} alignItems="center" py={4}>
          <Typography fontWeight={600}>No modules yet</Typography>
          <Typography variant="body2" color="text.secondary">
            Start by adding the first module to outline this course.
          </Typography>
        </Stack>
      )}

      {!isModulesLoading && !isModulesError && modules.length > 0 && (
        <Stack spacing={2.5}>
          {modules.map((module, index) => (
            <Box
              key={module.guid}
              sx={{
                position: "relative",
                p: 3,
                borderRadius: 2,
                border: (theme) => `1px solid ${theme.palette.grey[200]}`,
                backgroundColor: (theme) => theme.palette.grey[50],
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  borderColor: (theme) => theme.palette.primary.main,
                  boxShadow: (theme) =>
                    `0 10px 30px ${theme.palette.grey[200]}`,
                },
                "&:hover .module-edit-action": {
                  opacity: 1,
                  transform: "scale(1)",
                },
              }}
            >
              <Tooltip title="Edit module">
                <IconButton
                  className="module-edit-action"
                  size="small"
                  onClick={() => onOpenModuleDialog(module)}
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    opacity: 0,
                    transform: "scale(0.85)",
                    transition: "all 0.2s ease",
                    bgcolor: "background.paper",
                    boxShadow: 1,
                    "&:hover": { bgcolor: "primary.light" },
                  }}
                >
                  <Edit2 size={16} />
                </IconButton>
              </Tooltip>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2.5}
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Box flexGrow={1}>
                  <Typography variant="h6" fontWeight={700}>
                    Module{index + 1} : {module.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {module.description || "No description provided"}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              {module.topics && module.topics.length > 0 ? (
                <Stack
                  spacing={1.5}
                  divider={
                    <Divider
                      flexItem
                      sx={{ borderStyle: "dashed", opacity: 0.6 }}
                    />
                  }
                >
                  {module.topics.map((topic, topicIndex) => (
                    <Box
                      key={topic.guid}
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start",
                        position: "relative",
                        "&:hover .topic-edit-action": {
                          opacity: 1,
                          transform: "scale(1)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          // bgcolor: "primary.lighter",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "primary.main",
                          fontSize: 12,
                          fontWeight: 600,
                          mt: 0.25,
                        }}
                      >
                        {topicIndex + 1}/{module.topics.length}
                      </Box>
                      <Box flexGrow={1}>
                        <Stack
                          direction={"row"}
                          justifyContent={"space-between"}
                          alignItems={"center"}
                        >
                          <Typography fontWeight={600}>
                            {topic.name || topic.name || "Untitled topic"}
                          </Typography>
                          {topic.duration && (
                            <Chip
                              label={`${topic.duration} `}
                              size="small"
                              color="default"
                              variant="outlined"
                            />
                          )}
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                          {topic.description || "No description"}
                        </Typography>
                      </Box>
                      <Tooltip title="Edit topic">
                        <IconButton
                          size="small"
                          className="topic-edit-action"
                          onClick={() => onOpenTopicDialog(module, topic)}
                          sx={{
                            opacity: 0,
                            transform: "scale(0.8)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Edit2 size={14} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<Plus size={16} />}
                      onClick={() => onOpenTopicDialog(module)}
                    >
                      Add Topic
                    </Button>
                  </Box>
                </Stack>
              ) : (
                <Card
                  sx={{
                    p: 2,
                    textAlign: "center",
                    boxShadow: "none",
                    border: "1px dashed grey",
                  }}
                >
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    No topics added to this module yet.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Plus size={16} />}
                    onClick={() => onOpenTopicDialog(module)}
                  >
                    Add First Topic
                  </Button>{" "}
                </Card>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};
