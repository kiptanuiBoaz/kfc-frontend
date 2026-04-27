import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
  Popover,
  IconButton,
  TextField,
  Rating,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import MilitaryTechOutlinedIcon from "@mui/icons-material/MilitaryTechOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { alpha, useTheme } from "@mui/material/styles";
import { TEnrolledCourse } from "@/types/course.types";
import { useNavigate } from "react-router-dom";
import { truncateString } from "@/utils/truncateString";
import { DownloadIcon } from "lucide-react";
import { apiClient } from "@/api/apiClient";
import { toSentenceCase } from "@/utils/toSentenceCase";
import { formatDate } from "date-fns";
import { LocationOnOutlined } from "@mui/icons-material";
import { Confirm, Notify } from "notiflix";
import { useAuth, useIsAuthenticated } from "@/hooks/useAuth";

interface ExtendedCourseCardProps {
  course: TEnrolledCourse;
  isEnrolled?: boolean;
  refetch?: () => void; // Function to refetch course data after interactions
}

const ExtendedCourseCard: React.FC<ExtendedCourseCardProps> = ({
  course,
  isEnrolled = false,
  refetch,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const theme = useTheme();
  const navigate = useNavigate();

  const [downloading, setDownloading] = useState(false);

  const [interactionLoading, setInteractionLoading] = useState(false);
  const course_interactions = course.course_iteractions;
  const [liked, setLiked] = useState(course_interactions?.user_liked || false);
  const [saved, setSaved] = useState(course_interactions?.user_saved || false);

  const handleInteraction = async (interaction_type: "like" | "save") => {
    if (!isAuthenticated) {
      Confirm.show(
        "Login Required",
        `You need to be logged in to ${interaction_type === "like" ? "like" : "save"} this course.`,
        "Proceed to Login",
        "Cancel",
        () => navigate("/login"),
        () => {},
        {
          width: "350px",
          borderRadius: "8px",
          okButtonBackground: theme.palette.primary.main,
          titleColor: theme.palette.text.primary,
          messageColor: theme.palette.text.secondary,
          okButtonColor: theme.palette.primary.contrastText,
        },
      );
      return;
    }
    setInteractionLoading(true);
    try {
      const payload: any = {
        course_guid: course.guid,
        interaction_type,
      };
      await apiClient.post("/main/v1/interactions/create/", payload);
      if (interaction_type === "like") setLiked(true);
      if (interaction_type === "save") setSaved(true);
      Notify.success(
        `Course ${interaction_type === "like" ? "liked" : "saved"}!`,
      );
      refetch?.(); // Refetch course data to update progress, reviews, etc.
    } catch (err) {
      console.error(err);
      Notify.failure(
        `Failed to ${interaction_type === "like" ? "like" : "save"} course. Try again later.`,
      );
      if (interaction_type === "like") setLiked(false);
      if (interaction_type === "save") setSaved(false);
    } finally {
      setInteractionLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/courses/preview/${course.guid}`);
  };

  const handleEnroll = () => {
    navigate(`/courses/${course.guid}/enroll`);
  };

  const handleDownloadCertificate = async () => {
    setDownloading(true);
    try {
      const response = await apiClient.post(
        `/main/v1/courses/${course.guid}/certificate/`,
        {},
        { responseType: "blob" },
      );
      // @ts-ignore
      const url = window.URL.createObjectURL(response);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${course.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      Notify.success(
        "Certificate downloaded successfully!, you should find it in your downloads folder.",
        {
          clickToClose: true,
        },
      );
    } catch (err) {
      Notify.failure("Failed to download certificate.");
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card
      elevation={2}
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        height: "100%",
        position: "relative",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: 6,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: 180,
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundColor: alpha(theme.palette.common.black, 0.25),
            opacity: 0,
            transition: "opacity 0.3s ease",
          },
          "& img": {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease",
          },
          "&:hover::after": {
            opacity: 1,
          },
          "&:hover img": {
            transform: "scale(1.05)",
          },
        }}
      >
        {/* Like and Save icons at top left, only on hover, with counts */}
        {
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              zIndex: 3,
              display: "flex",
              gap: 1,
              background: "rgba(255,255,255,0.85)",
              borderRadius: 2,
              p: 0.5,
              boxShadow: 1,
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
              <IconButton
                color={liked ? "error" : "default"}
                onClick={() => handleInteraction("like")}
                disabled={interactionLoading}
                size="small"
                sx={{
                  backgroundColor: "transparent",
                  "&:hover": { backgroundColor: "error.light" },
                }}
              >
                {liked ? (
                  <FavoriteIcon fontSize="small" />
                ) : (
                  <FavoriteBorderIcon fontSize="small" />
                )}
              </IconButton>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: "center" }}
              >
                {course_interactions?.likes ?? 0}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color={saved ? "primary" : "default"}
                onClick={() => handleInteraction("save")}
                disabled={interactionLoading}
                size="small"
                sx={{
                  backgroundColor: "transparent",
                  "&:hover": { backgroundColor: "info.light" },
                }}
              >
                {saved ? (
                  <BookmarkIcon color="info" fontSize="small" />
                ) : (
                  <BookmarkBorderIcon fontSize="small" />
                )}
              </IconButton>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: "center" }}
              >
                {course_interactions?.saves ?? 0}
              </Typography>
            </Box>
          </Box>
        }
        {/* Course image */}
        <Box
          component="img"
          src={
            course?.image?.startsWith("https://")
              ? `${course?.image}`
              : "/images/logos/horizontal_logo.png"
          }
          alt={course.title}
        />
        {/* Rating badge at bottom left of image */}
        <Box
          sx={{
            position: "absolute",
            left: 12,
            bottom: 12,
            zIndex: 2,
            background: "rgba(255,255,255,0.72)",
            borderRadius: 2,
            px: 1.2,
            py: 0.5,
            display: "flex",
            alignItems: "center",
            boxShadow: 1,
          }}
        >
          <Rating
            value={course_interactions?.average_rating || 0}
            precision={0.1}
            readOnly
            size="small"
            sx={{ mr: 0.5 }}
          />
        </Box>
        {/* Learning Mode Chip */}
        <Chip
          label={
            course.learning_mode
              ? toSentenceCase(course.learning_mode)
              : "Online"
          }
          size="small"
          color={course?.learning_mode === "PHYSICAL" ? "warning" : "info"}
          variant="outlined"
          sx={{
            position: "absolute",
            top: 12,
            right: 52,
            fontWeight: 700,
            zIndex: 2,
            textTransform: "capitalize",
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        {course.tags && (
          <Box>
            {course.tags?.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  mr: 0.25,
                  mb: 0.5,
                  fontWeight: 600,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                }}
              />
            ))}
          </Box>
        )}
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {truncateString(course.title, 75)}
            </Typography>
            {/* Venue and Date for Physical Courses */}
            {course.learning_mode === "PHYSICAL" && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                mt={0.5}
                mb={1}
              >
                {course.venue && (
                  <Chip
                    icon={<LocationOnOutlined fontSize="small" />}
                    label={course.venue}
                    size="small"
                    color="default"
                    sx={{ fontWeight: 500 }}
                  />
                )}
                {course.training_date && (
                  <Chip
                    icon={
                      <CalendarTodayOutlinedIcon
                        sx={{ fontSize: 10 }}
                        fontSize="small"
                      />
                    }
                    label={formatDate(new Date(course.training_date), "PPP")}
                    size="small"
                    color="default"
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Stack>
            )}
            <Typography variant="subtitle2" color="text.secondary">
              {course.category}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {truncateString(course.description, 150)}
            </Typography>
          </Stack>

          {/* (Removed: Rating, Likes, Saves row. Now shown on image/hover) */}

          <Stack direction="row" spacing={3} flexWrap="wrap" rowGap={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              {isEnrolled ? (
                <>
                  <CalendarTodayOutlinedIcon
                    fontSize="small"
                    color="disabled"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {course.course_progress || 0}% Complete
                  </Typography>
                </>
              ) : (
                <>
                  <CalendarTodayOutlinedIcon
                    fontSize="small"
                    color="disabled"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {course.total_duration}
                  </Typography>
                </>
              )}
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <MilitaryTechOutlinedIcon fontSize="small" color="disabled" />
              <Typography variant="body2" color="text.secondary">
                {course?.expertise_level}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <PersonOutlineIcon fontSize="small" color="disabled" />
              <Typography variant="body2" color="text.secondary">
                {/* @ts-ignore */}
                {course?.instructor?.name || course.instructor_name}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 3, pb: 3, pt: 0, gap: 1.5 }}>
        {isEnrolled ? (
          course.course_progress === 100 ? (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/courses/${course.guid}/learn`)}
                fullWidth
              >
                Review Course
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleDownloadCertificate}
                disabled={downloading}
                fullWidth
                endIcon={<DownloadIcon size={16} />}
              >
                {downloading ? "Downloading..." : "Get Certificate"}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/courses/${course.guid}/learn`)}
              fullWidth
            >
              {course.course_progress && course.course_progress > 0
                ? "Continue Learning"
                : "Start Learning"}
            </Button>
          )
        ) : (
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleViewDetails}
              fullWidth
            >
              View Details
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEnroll}
              fullWidth
            >
              Enroll Now
            </Button>
          </>
        )}
      </CardActions>
    </Card>
  );
};

export default ExtendedCourseCard;
