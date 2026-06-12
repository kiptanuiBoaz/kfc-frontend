import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import {
  Grid,
  Stack,
  Tabs,
  Tab,
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Paper,
  Avatar,
} from "@mui/material";
import { apiClient } from "@/api/apiClient";
import { TCourse, TCoursePrviewDetails } from "@/types/course.types";
import { TTopicMediaSelection } from "@/types/media.types";
import {
  getCurrentModule,
  getCurrentTopic,
  setCurrentModule,
  setCurrentTopic,
} from "@/redux/slices/courseSlice";
import CourseHeader from "@/components/course/CourseHeader";
import ModuleTopicList from "@/components/course/ModuleTopicList";
import Discussions from "@/components/course/Discussions";
import { CustomContainer } from "@/components/shared/CustomContainer";
import LoadingPage from "@/components/shared/LoadingPage";
import ErrorPage from "@/pages/errors/ErrorPage";
import { useAuth } from "@/hooks/useAuth";
import { CourseRating } from "@/components/course/CourseRating";

const TakeCoursePage = () => {
  const { courseGuid } = useParams();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [heroMedia, setHeroMedia] = useState<TTopicMediaSelection | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  // Static reviews data for now

  const currentModuleFromRedux = useSelector(getCurrentModule);
  const currentTopicFromRedux = useSelector(getCurrentTopic);

  const isAdmin = user?.role?.name === "ADMIN";
  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = useQuery<TCourse | undefined>({
    queryKey: ["courseDetails", courseGuid],
    enabled: !!courseGuid,
    queryFn: async () =>
      await apiClient.get<TCourse>(`/main/v1/courses/${courseGuid}/`),
  });

  const modulesWithTopics = useMemo(
    () =>
      (course?.modules || []).filter(
        (module) => module.topics && module.topics.length > 0,
      ),
    [course],
  );

  const firstPlayable = useMemo(() => {
    const firstModule = modulesWithTopics[0];
    const firstTopic = firstModule?.topics?.[0];
    return {
      moduleGuid: firstModule?.guid || null,
      topicGuid: firstTopic?.guid || null,
    };
  }, [modulesWithTopics]);

  // Determine current module and topic
  const { currentModule, currentTopic } = useMemo(() => {
    if (modulesWithTopics.length === 0) {
      return { currentModule: null, currentTopic: null };
    }

    const urlModule = searchParams.get("module");
    const urlTopic = searchParams.get("topic");

    let moduleGuid = urlModule || currentModuleFromRedux;
    let topicGuid = urlTopic || currentTopicFromRedux;

    if (!moduleGuid && modulesWithTopics.length > 0) {
      moduleGuid = modulesWithTopics[0].guid;
    }

    const module = modulesWithTopics.find((m) => m.guid === moduleGuid);
    if (module) {
      const topicExists = module.topics?.some(
        (topic) => topic.guid === topicGuid,
      );
      if (!topicExists) {
        topicGuid = module.topics?.[0]?.guid || null;
      }
    }

    return { currentModule: moduleGuid, currentTopic: topicGuid };
  }, [
    modulesWithTopics,
    searchParams,
    currentModuleFromRedux,
    currentTopicFromRedux,
  ]);

  const handleTopicSelection = (moduleGuid: string, topicGuid: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("module", moduleGuid);
    params.set("topic", topicGuid);
    setSearchParams(params);
    dispatch(setCurrentModule(moduleGuid));
    dispatch(setCurrentTopic(topicGuid));
  };

  const handleMediaPreview = (media: TTopicMediaSelection) => {
    setHeroMedia(media);
  };

  // Update Redux and localStorage
  useEffect(() => {
    if (currentModule) {
      dispatch(setCurrentModule(currentModule));
      localStorage.setItem(`course_${courseGuid}_module`, currentModule);
    }
    if (currentTopic) {
      dispatch(setCurrentTopic(currentTopic));
      localStorage.setItem(`course_${courseGuid}_topic`, currentTopic);
    }
  }, [currentModule, currentTopic, courseGuid, dispatch]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentModule) params.set("module", currentModule);
    if (currentTopic) params.set("topic", currentTopic);
    setSearchParams(params, { replace: true });
  }, [currentModule, currentTopic, setSearchParams]);

  // Load from localStorage on mount
  useEffect(() => {
    if (!currentModuleFromRedux && courseGuid) {
      const savedModule = localStorage.getItem(`course_${courseGuid}_module`);
      const savedTopic = localStorage.getItem(`course_${courseGuid}_topic`);
      if (savedModule) dispatch(setCurrentModule(savedModule));
      if (savedTopic) dispatch(setCurrentTopic(savedTopic));
    }
  }, [courseGuid, dispatch, currentModuleFromRedux]);

  useEffect(() => {
    setHeroMedia(null);
  }, [currentTopic]);

  if (isCourseLoading) {
    return <LoadingPage message="Loading course content..." />;
  }

  if (isCourseError || !course) {
    return (
      <ErrorPage message="Failed to load course content. Please try again." />
    );
  }

  return (
    <CustomContainer>
      <Grid sx={{ mt: 2, height: "calc(100vh - 120px)" }} container spacing={2}>
        <Grid item sm={12} md={7} sx={{ height: "100%" }}>
          <Box sx={{ height: "100%", overflow: "auto", pr: 1 }}>
            <Stack spacing={2}>
              <CourseHeader
                course={course}
                heroMedia={heroMedia}
                onPlayIntro={
                  firstPlayable.moduleGuid && firstPlayable.topicGuid
                    ? () =>
                        handleTopicSelection(
                          firstPlayable.moduleGuid!,
                          firstPlayable.topicGuid!,
                        )
                    : undefined
                }
              />
              {/* Tabs for Discussions and Rating */}
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
                  <Tab label="Discussions" />
                  <Tab label="Rating" />
                </Tabs>
              </Box>
              {tabIndex === 0 && !isAdmin && (
                <Discussions
                  instructorGuid={course.instructor_details.guid}
                  courseGuid={courseGuid!}
                />
              )}
              {tabIndex === 1 && <CourseRating course={course} />}
            </Stack>
          </Box>
        </Grid>
        <Grid item sm={12} md={5} sx={{ height: "100%" }}>
          <Box sx={{ height: "100%", overflow: "hidden", pl: 1 }}>
            <ModuleTopicList
              modules={modulesWithTopics}
              currentModule={currentModule}
              currentTopic={currentTopic}
              onSelect={handleTopicSelection}
              onMediaSelect={handleMediaPreview}
            />
          </Box>
        </Grid>
      </Grid>
    </CustomContainer>
  );
};

export default TakeCoursePage;
