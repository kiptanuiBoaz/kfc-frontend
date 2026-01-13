import React from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  Grid2,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { TCoursePrviewDetails } from "@/types/course.types";
import { TTopicMediaSelection } from "@/types/media.types";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { useAuth } from "@/hooks/useAuth";

interface CourseHeaderProps {
  course: TCoursePrviewDetails;
  onPlayIntro?: () => void;
  heroMedia?: TTopicMediaSelection | null;
}
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || "";

const CourseHeader: React.FC<CourseHeaderProps> = ({
  course,
  onPlayIntro,
  heroMedia,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const PLACEHOLDER_IMAGE = `/images/${course.guid}.jpeg`;
  const progress = Math.min(Math.max(course.course_progress || 0, 0), 100);
  const courseImage =
    // course.image
    // ? `${MEDIA_BASE_URL}${course.image}`
    // :
    PLACEHOLDER_IMAGE;
  const displayImage =
    heroMedia?.type === "image" ? heroMedia.url : courseImage;
  const showPlayOverlay = Boolean(onPlayIntro && !heroMedia);

  const isAdmin = user?.role?.name === "ADMIN";

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        backgroundColor: "secondary.lighter",
        // borderBottom: 1,
        // borderColor: "grey.300",
      }}
    >
      <Grid2 container spacing={2}>
        <Grid2 size={12}>
          <Box sx={{ position: "relative" }}>
            {heroMedia?.type === "video" ? (
              <video
                key={heroMedia.url}
                controls
                autoPlay
                src={heroMedia.url}
                style={{
                  width: "100%",
                  height: "500px",
                  borderRadius: 8,
                  objectFit: "cover",
                }}
              />
            ) : (
              <img
                src={displayImage}
                alt={course.title}
                style={{
                  width: "100%",
                  height: "500px",
                  borderRadius: 8,
                  objectFit: "cover",
                }}
              />
            )}
            {showPlayOverlay && (
              <IconButton
                aria-label="Play first lesson"
                onClick={onPlayIntro}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  bgcolor: "rgba(0,0,0,0.65)",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  boxShadow: 3,
                  color: "common.white",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.8)",
                  },
                }}
              >
                <PlayArrowRoundedIcon sx={{ fontSize: 42 }} />
              </IconButton>
            )}
          </Box>
        </Grid2>
        <Grid2 size={12} sx={{ pl: 2 }}>
          <Typography variant="h4" fontWeight="bold" mb={1.5}>
            {course.title}
          </Typography>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                src={`${MEDIA_BASE_URL}${course.instructor_details.image}`}
                sx={{ width: 54, height: 54 }}
              />
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {course.instructor_details.first_name}{" "}
                  {course.instructor_details.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {course.instructor_details.email}
                </Typography>
              </Box>
            </Box>
            {!isAdmin && (
              <Box textAlign="center">
                <Typography variant="subtitle2" color="text.secondary">
                  Progress
                </Typography>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={50}
                    thickness={4}
                    sx={{
                      color: theme.palette.grey[300],
                      position: "absolute",
                      left: 0,
                      top: 0,
                    }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={progress}
                    size={50}
                    thickness={4}
                    sx={{ color: theme.palette.primary.main }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      {progress}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Stack>
          <Typography variant="body1" sx={{ mt: 3 }}>
            {course.description}
          </Typography>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default CourseHeader;
