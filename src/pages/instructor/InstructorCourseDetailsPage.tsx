import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Grid2,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  CheckCircle2,
  Edit2,
  Plus,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Info,
  Users,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api/apiClient";
import { TCourse, TCourseModule, TModuleTopic } from "@/types/course.types";
import { ModuleFormDialog } from "@/components/admin/ModuleFormDialog";
import { TopicFormDialog } from "@/components/admin/TopicFormDialog";
import { CourseModal } from "@/components/CourseModal";
import { getStatusColor } from "@/utils/getStatusColor";
import { sortModules } from "@/utils/sortModules";
import { BasicInfoTab } from "@/components/instructor/BasicInfoTab";
import { ModulesTopicsTab } from "@/components/instructor/ModulesTopicsTab";
import { QuizzesTab } from "@/components/instructor/QuizzesTab";
import { DiscussionsTab } from "@/components/instructor/DiscussionsTab";
import { QuizResponsesTab } from "@/components/instructor/QuizResponsesTab";
import { CustomContainer } from "@/components/shared/CustomContainer";
import ErrorPage from "@/pages/errors/ErrorPage";
import LoadingPage from "@/components/shared/LoadingPage";

const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || "";

export const InstructorCourseDetailsPage: React.FC = () => {
  const { courseGuid } = useParams<{ courseGuid: string }>();
  const queryClient = useQueryClient();

  const [isModuleDialogOpen, setModuleDialogOpen] = useState(false);
  const [isTopicDialogOpen, setTopicDialogOpen] = useState(false);
  const [moduleDialogData, setModuleDialogData] =
    useState<TCourseModule | null>(null);
  const [topicDialogModule, setTopicDialogModule] =
    useState<TCourseModule | null>(null);
  const [topicDialogData, setTopicDialogData] = useState<TModuleTopic | null>(
    null,
  );
  const [newComment, setNewComment] = useState("");

  // Add course modal state & handlers
  const [isCourseModalOpen, setCourseModalOpen] = useState(false);
  const handleOpenCourseModal = () => setCourseModalOpen(true);
  const handleCloseCourseModal = () => setCourseModalOpen(false);

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
    refetch: refetchCourse,
  } = useQuery<TCourse | undefined>({
    queryKey: ["courseDetails", courseGuid],
    enabled: !!courseGuid,
    queryFn: async () =>
      await apiClient.get<TCourse>(`/main/v1/courses/${courseGuid}/`),
  });

  if (isCourseLoading) {
    return <LoadingPage message="Loading course details..." />;
  }

  if (isCourseError || !course) {
    return (
      <ErrorPage message="Failed to load course details. Please try again later." />
    );
  }

  const handleOpenModuleDialog = (module?: TCourseModule | null) => {
    setModuleDialogData(module ?? null);
    setModuleDialogOpen(true);
  };

  const handleOpenTopicDialog = (
    module: TCourseModule,
    topic?: TModuleTopic | null,
  ) => {
    setTopicDialogModule(module);
    setTopicDialogData(topic ?? null);
    setTopicDialogOpen(true);
  };

  const handleCloseTopicDialog = () => {
    setTopicDialogOpen(false);
    setTopicDialogModule(null);
    setTopicDialogData(null);
  };

  const handleCloseModuleDialog = () => {
    setModuleDialogOpen(false);
    setModuleDialogData(null);
  };

  const overviewStats = [
    {
      label: "Expertise",
      value: course?.expertise_level || "--",
    },
    {
      label: "Pricing",
      value:
        course?.isPaid && course?.amount
          ? `${course.currency ?? "USD"} ${course.amount}`
          : "Free",
    },
    {
      label: "Modules",
      value: `${course?.modules?.length || 0} modules / ${
        course?.modules?.reduce(
          (total, current) => total + (current.topics?.length ?? 0),
          0,
        ) || 0
      } topics`,
    },
  ];

  return (
    <CustomContainer>
      {courseGuid && course && (
        <Stack spacing={3}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={2}>
              <Grid2 container spacing={2}>
                <Grid2 size={3}>
                  <img
                    src={`/images/${course.guid}.jpeg`}
                    alt={course.title}
                    style={{ width: 320, height: "auto", borderRadius: 8 }}
                  />
                </Grid2>
                <Grid2 size={9}>
                  <Box>
                    <Stack direction={"row"} justifyContent={"space-between"}>
                      <Typography variant="h4" fontWeight={700} gutterBottom>
                        {course.title}
                      </Typography>
                      <Chip
                        color={getStatusColor(course.status)}
                        label={course.status}
                        sx={{ ml: 2, mt: 1 }}
                      />
                    </Stack>
                    <Typography variant="subtitle1" gutterBottom>
                      {course.category}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {course.description}
                    </Typography>
                  </Box>
                </Grid2>
              </Grid2>

              <Grid container spacing={2}>
                {overviewStats.map((stat) => (
                  <Grid key={stat.label} item xs={12} sm={6} md={4}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography
                          variant="overline"
                          color="text.secondary"
                          display="block"
                          gutterBottom
                        >
                          {stat.label}
                        </Typography>
                        {typeof stat.value === "string" ? (
                          <Typography variant="h6">{stat.value}</Typography>
                        ) : (
                          stat.value
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Paper>

          {/* Tabs */}
          <Paper sx={{ borderRadius: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": {
                  minHeight: 64,
                  textTransform: "none",
                  fontWeight: 600,
                },
              }}
            >
              <Tab
                icon={<Info size={20} />}
                label="Basic Info"
                iconPosition="start"
              />
              <Tab
                icon={<BookOpen size={20} />}
                label="Modules & Topics"
                iconPosition="start"
              />
              <Tab
                icon={<HelpCircle size={20} />}
                label="Quizzes"
                iconPosition="start"
              />
              <Tab
                icon={<MessageSquare size={20} />}
                label="Discussions"
                iconPosition="start"
              />
              <Tab
                icon={<Users size={20} />}
                label="Quiz Responses"
                iconPosition="start"
              />
            </Tabs>

            {/* Tab Panels */}
            <Box sx={{ p: 3 }}>
              {/* Basic Info Tab */}
              {activeTab === 0 && (
                <BasicInfoTab
                  course={course}
                  totalModules={course.modules ? course.modules.length : 0}
                  totalTopics={
                    course.modules
                      ? course.modules.reduce(
                          (total, current) =>
                            total + (current.topics?.length ?? 0),
                          0,
                        )
                      : 0
                  }
                />
              )}

              {/* Modules & Topics Tab */}
              {activeTab === 1 && (
                <ModulesTopicsTab
                  modules={course.modules ? sortModules(course.modules) : []}
                  totalModules={course.modules ? course.modules.length : 0}
                  totalTopics={
                    course.modules
                      ? course.modules.reduce(
                          (total, current) =>
                            total + (current.topics?.length ?? 0),
                          0,
                        )
                      : 0
                  }
                  isModulesLoading={isCourseLoading}
                  isModulesError={isCourseError}
                  onOpenModuleDialog={handleOpenModuleDialog}
                  onOpenTopicDialog={handleOpenTopicDialog}
                />
              )}

              {/* Quizzes Tab */}
              {activeTab === 2 && (
                <QuizzesTab courseGuid={courseGuid!} course={course} />
              )}

              {/* Discussions Tab */}
              {activeTab === 3 && <DiscussionsTab />}

              {/* Quiz Responses Tab */}
              {activeTab === 4 && (
                <QuizResponsesTab courseGuid={courseGuid!} course={course} />
              )}
            </Box>
          </Paper>
        </Stack>
      )}

      <ModuleFormDialog
        open={isModuleDialogOpen}
        onClose={handleCloseModuleDialog}
        courseGuid={courseGuid}
        moduleData={moduleDialogData}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["courseModules", courseGuid],
          });
          refetchCourse();
        }}
      />

      <TopicFormDialog
        open={isTopicDialogOpen}
        onClose={handleCloseTopicDialog}
        module={topicDialogModule}
        topic={topicDialogData}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["courseModules", courseGuid],
          });
          refetchCourse();
        }}
      />

      {/* Course editing modal — pass current course for editing */}
      <CourseModal
        open={isCourseModalOpen}
        onClose={handleCloseCourseModal}
        course={course}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["courseDetails", courseGuid],
          });
          queryClient.invalidateQueries({
            queryKey: ["courseModules", courseGuid],
          });
          refetchCourse();
        }}
      />
    </CustomContainer>
  );
};

export default InstructorCourseDetailsPage;
