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
  IconButton,
  Rating,
  Tooltip,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import MilitaryTechOutlinedIcon from "@mui/icons-material/MilitaryTechOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { LocationOnOutlined } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { TEnrolledCourse } from "@/types/course.types";
import { useNavigate } from "react-router-dom";
import { truncateString } from "@/utils/truncateString";
import { DownloadIcon } from "lucide-react";
import { apiClient } from "@/api/apiClient";
import { toSentenceCase } from "@/utils/toSentenceCase";
import { formatDate } from "date-fns";
import { Confirm, Notify } from "notiflix";
import { useIsAuthenticated } from "@/hooks/useAuth";

interface ExtendedCourseCardProps {
  course: TEnrolledCourse;
  isEnrolled?: boolean;
  refetch?: () => void;
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
      await apiClient.post("/main/v1/interactions/create/", {
        course_guid: course.guid,
        interaction_type,
      });
      if (interaction_type === "like") setLiked(true);
      if (interaction_type === "save") setSaved(true);
      Notify.success(`Course ${interaction_type === "like" ? "liked" : "saved"}!`);
      refetch?.();
    } catch (err) {
      console.error(err);
      Notify.failure(`Failed to ${interaction_type === "like" ? "like" : "save"} course.`);
      if (interaction_type === "like") setLiked(false);
      if (interaction_type === "save") setSaved(false);
    } finally {
      setInteractionLoading(false);
    }
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
      Notify.success("Certificate downloaded!", { clickToClose: true });
    } catch (err) {
      Notify.failure("Failed to download certificate.");
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card
      elevation={1}
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        height: "100%",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
          "& .like-save-panel": { opacity: 1 },
          "& .card-image img": { transform: "scale(1.05)" },
        },
      }}
    >
      {/* Image */}
      <Box
        className="card-image"
        sx={{
          position: "relative",
          height: 180,
          overflow: "hidden",
          "& img": {
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transition: "transform 0.3s ease",
          },
        }}
      >
        <Box
          component="img"
          src={
            course?.image?.startsWith("https://")
              ? course.image
              : "/images/logos/horizontal_logo.png"
          }
          alt={course.title}
        />

        {/* Like / Save — visible on card hover only */}
        <Box
          className="like-save-panel"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 3,
            display: "flex",
            gap: 0.5,
            background: "rgba(255,255,255,0.92)",
            borderRadius: 2,
            px: 0.5,
            py: 0.25,
            boxShadow: 2,
            alignItems: "center",
            opacity: 0,
            transition: "opacity 0.2s ease",
          }}
        >
          <Tooltip title={`${course_interactions?.likes ?? 0} likes`}>
            <IconButton
              color={liked ? "error" : "default"}
              onClick={() => handleInteraction("like")}
              disabled={interactionLoading}
              size="small"
            >
              {liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={`${course_interactions?.saves ?? 0} saves`}>
            <IconButton
              color={saved ? "primary" : "default"}
              onClick={() => handleInteraction("save")}
              disabled={interactionLoading}
              size="small"
            >
              {saved ? (
                <BookmarkIcon color="info" fontSize="small" />
              ) : (
                <BookmarkBorderIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Learning mode chip — only overlay kept */}
        <Chip
          label={course.learning_mode ? toSentenceCase(course.learning_mode) : "Online"}
          size="small"
          color={course?.learning_mode === "PHYSICAL" ? "warning" : "info"}
          variant="filled"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            fontWeight: 700,
            zIndex: 2,
          }}
        />
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1.5}>
          {course.tags && course.tags.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {course.tags.slice(0, 2).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              ))}
            </Stack>
          )}

          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {truncateString(course.title, 75)}
          </Typography>

          {course.learning_mode === "PHYSICAL" && (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              {course.venue && (
                <Chip
                  icon={<LocationOnOutlined fontSize="small" />}
                  label={course.venue}
                  size="small"
                />
              )}
              {course.training_date && (
                <Chip
                  icon={<CalendarTodayOutlinedIcon fontSize="small" />}
                  label={formatDate(new Date(course.training_date), "PPP")}
                  size="small"
                />
              )}
            </Stack>
          )}

          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {course.category}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {truncateString(course.description, 120)}
          </Typography>

          {/* Rating row */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Rating
              value={course_interactions?.average_rating || 0}
              precision={0.1}
              readOnly
              size="small"
            />
            <Typography variant="caption" color="text.secondary">
              {course_interactions?.average_rating
                ? course_interactions.average_rating.toFixed(1)
                : "No ratings"}
            </Typography>
          </Stack>

          {/* Meta row */}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CalendarTodayOutlinedIcon fontSize="small" color="disabled" />
              <Typography variant="caption" color="text.secondary">
                {isEnrolled
                  ? `${course.course_progress || 0}% complete`
                  : course.total_duration}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.disabled">·</Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <MilitaryTechOutlinedIcon fontSize="small" color="disabled" />
              <Typography variant="caption" color="text.secondary">
                {course.expertise_level}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.disabled">·</Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PersonOutlineIcon fontSize="small" color="disabled" />
              <Typography variant="caption" color="text.secondary">
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
              onClick={() => navigate(`/courses/preview/${course.guid}`)}
              fullWidth
            >
              View Details
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/courses/${course.guid}/enroll`)}
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
