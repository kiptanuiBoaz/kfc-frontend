import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Book, CheckCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/api/apiClient";
import MediaPlayer from "@/components/course/MediaPlayer";
import { PATHS } from "@/navigation/paths";
import { TCourseModule, TModuleTopic } from "@/types/course.types";
import { TTopicMediaSelection } from "@/types/media.types";
import { useAuth } from "@/hooks/useAuth";
import { truncateString } from "@/utils/truncateString";
import { Notify } from "notiflix";

interface ModuleTopicListProps {
  modules: TCourseModule[];
  currentModule: string | null;
  currentTopic: string | null;
  onSelect: (moduleGuid: string, topicGuid: string) => void;
  onMediaSelect?: (media: TTopicMediaSelection) => void;
}

const ModuleTopicList: React.FC<ModuleTopicListProps> = ({
  modules,
  currentModule,
  currentTopic,
  onSelect,
  onMediaSelect,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(
    () => new Set(currentModule ? [currentModule] : []),
  );
  const [expandedTopics, setExpandedTopics] = React.useState<Set<string>>(
    () => new Set(),
  );

  const modulesWithTopics = React.useMemo(
    () => modules.filter((module) => (module.topics?.length || 0) > 0),
    [modules],
  );

  const handleModuleToggle = (moduleGuid: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleGuid)) {
        next.delete(moduleGuid);
      } else {
        next.add(moduleGuid);
      }
      return next;
    });
  };

  React.useEffect(() => {
    if (!currentModule) return;
    setExpandedModules((prev) => {
      if (prev.has(currentModule)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(currentModule);
      return next;
    });
  }, [currentModule]);

  React.useEffect(() => {
    if (!currentTopic) return;
    setExpandedTopics((prev) => {
      if (prev.has(currentTopic)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(currentTopic);
      return next;
    });
  }, [currentTopic]);

  const toggleTopicDetails = (topicGuid: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicGuid)) {
        next.delete(topicGuid);
      } else {
        next.add(topicGuid);
      }
      return next;
    });
  };

  const handleTopicSelect = (moduleGuid: string, topicGuid: string) => {
    onSelect(moduleGuid, topicGuid);
    setExpandedTopics((prev) => {
      if (prev.has(topicGuid)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(topicGuid);
      return next;
    });
  };

  const handleTakeQuiz = (quizGuid: string, moduleGuid: string) => {
    navigate(
      PATHS.TAKE_QUIZ_PAGE.replace(":moduleGuid", moduleGuid).replace(
        ":quizGuid",
        quizGuid,
      ),
    );
  };

  const isAdmin = user?.role?.name === "ADMIN";

  const getNextTopic = (
    currentTopicGuid: string,
  ): { moduleGuid: string; topicGuid: string } | null => {
    for (let i = 0; i < modulesWithTopics.length; i++) {
      const module = modulesWithTopics[i];
      const topics = module.topics || [];
      for (let j = 0; j < topics.length; j++) {
        if (topics[j].guid === currentTopicGuid) {
          // Check if there's a next topic in the same module
          if (j + 1 < topics.length) {
            return { moduleGuid: module.guid, topicGuid: topics[j + 1].guid };
          }
          // Check if there's a next module with topics
          if (i + 1 < modulesWithTopics.length) {
            const nextModule = modulesWithTopics[i + 1];
            if (nextModule.topics && nextModule.topics.length > 0) {
              return {
                moduleGuid: nextModule.guid,
                topicGuid: nextModule.topics[0].guid,
              };
            }
          }
          return null;
        }
      }
    }
    return null;
  };

  const expandNextTopic = (currentTopicGuid: string) => {
    const next = getNextTopic(currentTopicGuid);
    if (next) {
      handleTopicSelect(next.moduleGuid, next.topicGuid);
    }
  };

  const completeTopicMutation = useMutation({
    mutationFn: async (topicGuid: string) => {
      return await apiClient.post("/main/v1/topic/complete/", {
        topic_guid: topicGuid,
      });
    },
    onSuccess: (_, topicGuid) => {
      Notify.success("Topic completed!");
      expandNextTopic(topicGuid);
    },
    onError: () => {
      Notify.failure("Failed to complete topic. Please try again.");
    },
  });

  const handleCompleteTopic = (topicGuid: string, isCompleted?: boolean) => {
    if (isCompleted) {
      // Already completed, just expand next topic
      expandNextTopic(topicGuid);
    } else {
      // Mark as complete, then expand next on success
      completeTopicMutation.mutate(topicGuid);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Course Content
      </Typography>
      {modulesWithTopics.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Modules will appear here once topics are added.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {modulesWithTopics.map((module, moduleIndex) => (
            <Accordion
              key={module.guid}
              expanded={expandedModules.has(module.guid)}
              onChange={() => handleModuleToggle(module.guid)}
              sx={{
                borderRadius: 2,
                "&:before": { display: "none" },
                boxShadow: "none",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  "& .MuiAccordionSummary-content": {
                    alignItems: "center",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flex: 1,
                  }}
                >
                  <Book size={20} />
                  <Box sx={{ flex: 1 }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        Module {moduleIndex + 1}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {module.name || module.title || "Untitled Module"}
                      </Typography>
                    </Stack>
                    {module.description && (
                      <Typography variant="body2">
                        {module.description}
                      </Typography>
                    )}
                  </Box>
                  {module.duration_minutes && (
                    <Chip
                      label={`${module.duration_minutes} min`}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pl: 4 }}>
                <Stack spacing={1.5}>
                  {module.topics?.map((topic, topicIndex) => {
                    const topicActive = currentTopic === topic.guid;
                    const isExpanded = expandedTopics.has(topic.guid);

                    return (
                      <Box
                        key={topic.guid}
                        onClick={() =>
                          handleTopicSelect(module.guid, topic.guid)
                        }
                        sx={{
                          px: 2,
                          py: 1.25,
                          borderRadius: 2,
                          border: (theme) =>
                            `1px solid ${
                              topicActive
                                ? theme.palette.primary.light
                                : theme.palette.grey[200]
                            }`,
                          bgcolor: topicActive ? "gray.50" : "background.paper",
                          cursor: "pointer",
                          transition:
                            "border-color 0.2s ease, background 0.2s ease",
                          "&:hover": {
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              border: (theme) =>
                                `1px solid ${theme.palette.primary.main}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "primary.main",
                              flexShrink: 0,
                            }}
                          >
                            {topicIndex + 1}/{module.topics?.length}
                          </Box>
                          <Box flexGrow={1}>
                            <Typography variant="body2" color="text.secondary">
                              {truncateString(topic.name, 100) ||
                                "Untitled topic"}
                            </Typography>
                          </Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            {topic.duration && (
                              <Chip
                                label={`${topic.duration}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleTopicDetails(topic.guid);
                              }}
                              sx={{
                                transition: "transform 0.2s ease",
                                transform: isExpanded
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              }}
                            >
                              <ExpandMore fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Stack>
                        <Collapse in={isExpanded} unmountOnExit>
                          <Box
                            mt={1.5}
                            onClick={(event) => event.stopPropagation()}
                          >
                            {" "}
                            {topic.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {topic.description}
                              </Typography>
                            )}
                            <TopicMediaContent
                              topicGuid={topic.guid}
                              expanded={isExpanded}
                              onMediaSelect={onMediaSelect}
                            />
                            <Box
                              sx={{
                                mt: 2,
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Button
                                variant="contained"
                                color="primary"
                                endIcon={<ChevronRight size={18} />}
                                onClick={() =>
                                  handleCompleteTopic(
                                    topic.guid,
                                    topic?.is_completed,
                                  )
                                }
                                disabled={
                                  !topic?.is_completed &&
                                  completeTopicMutation.isPending
                                }
                              >
                                {topic?.is_completed
                                  ? "Next"
                                  : completeTopicMutation.isPending
                                    ? "Completing..."
                                    : "Complete & Continue"}
                              </Button>
                            </Box>
                          </Box>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Stack>

                {module.quizzes && module.quizzes.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1.25}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Module Quizzes
                      </Typography>
                      {module.quizzes.map((quiz) => (
                        <Box
                          key={quiz.guid}
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            border: (theme) =>
                              `1px solid ${theme.palette.grey[200]}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1.5,
                            flexWrap: "wrap",
                          }}
                        >
                          <Box>
                            <Typography fontWeight={600}>
                              {quiz.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {quiz.question_count} question
                              {quiz.question_count === 1 ? "" : "s"}
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              handleTakeQuiz(quiz.guid, module.guid)
                            }
                          >
                            {isAdmin ? "View Quiz" : "Take Quiz"}
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

interface TopicMediaContentProps {
  topicGuid: string;
  expanded: boolean;
  onMediaSelect?: (media: TTopicMediaSelection) => void;
}

const TopicMediaContent: React.FC<TopicMediaContentProps> = ({
  topicGuid,
  expanded,
  onMediaSelect,
}) => {
  const { data, isLoading, isError } = useQuery<TModuleTopic | undefined>({
    queryKey: ["topicDetails", topicGuid],
    enabled: expanded,
    queryFn: async () =>
      await apiClient.get<TModuleTopic>(`/main/v1/topics/${topicGuid}/`),
    staleTime: 5 * 60 * 1000,
  });

  if (!expanded) {
    return null;
  }

  if (isLoading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading topic files...
      </Typography>
    );
  }

  if (isError || !data) {
    return (
      <Typography variant="body2" color="error">
        Unable to load media for this topic. Please try again later.
      </Typography>
    );
  }

  return <MediaPlayer topic={data} onMediaSelect={onMediaSelect} />;
};

export default ModuleTopicList;
