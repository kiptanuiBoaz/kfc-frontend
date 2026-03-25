import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  IconButton,
  Rating,
  CardActions,
  Button,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { TCourse } from "@/types/course.types";
import { truncateString } from "@/utils/truncateString";
import { toSentenceCase } from "@/utils/toSentenceCase";
import { format } from "date-fns";
import { ArrowForward } from "@mui/icons-material";

export interface CourseCardProps {
  course: TCourse;
  ctaLabel?: string;
  href?: string;
  onAction?: (course: TCourse) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onAction,
  ctaLabel = "Enroll Now",
  href,
}) => {
  const {
    title,
    description,
    image,
    isPaid,
    amount,
    expertise_level,
    learning_mode,
    course_iteractions,
  } = course;

  const handleAction = () => {
    if (onAction) {
      onAction(course);
    }
  };

  return (
    <Card
      // onClick={href ? undefined : handleAction}
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        cursor: "pointer",
        overflow: "hidden",
        transition:
          "transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
        background: (theme) => alpha(theme.palette.primary.light, 0.06),
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: 6,
          background: (theme) => alpha(theme.palette.primary.main, 0.12),
          "& .course-card__media::after": {
            opacity: 1,
          },
          "& .course-card__media img": {
            transform: "scale(1.08)",
          },
        },
      }}
    >
      <Box
        className="course-card__media"
        sx={{
          position: "relative",
          height: 200,
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundColor: (theme) => alpha(theme.palette.common.black, 0.35),
            opacity: 0,
            transition: "opacity 0.3s ease",
          },
          "& img": {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease",
          },
        }}
      >
        {/* Always-visible Like and Save icons with counts */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
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
              color={course_iteractions?.user_liked ? "error" : "default"}
              size="small"
              sx={{ backgroundColor: "transparent" }}
              disabled
            >
              {course_iteractions?.user_liked ? (
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
              {course_iteractions?.likes ?? 0}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color={course_iteractions?.user_saved ? "primary" : "default"}
              size="small"
              sx={{ backgroundColor: "transparent" }}
              disabled
            >
              {course_iteractions?.user_saved ? (
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
              {course_iteractions?.saves ?? 0}
            </Typography>
          </Box>
        </Box>
        {/* Rating badge at bottom left of image */}
        <Box
          sx={{
            position: "absolute",
            left: 12,
            bottom: 12,
            zIndex: 2,
            background: "rgba(255,255,255,0.92)",
            borderRadius: 2,
            px: 1.2,
            py: 0.5,
            display: "flex",
            alignItems: "center",
            boxShadow: 1,
          }}
        >
          <Rating
            value={course_iteractions?.average_rating || 0}
            precision={0.1}
            readOnly
            size="small"
            sx={{ mr: 0.5 }}
          />
          <Typography variant="caption" color="text.secondary">
            {course_iteractions?.average_rating
              ? course_iteractions.average_rating.toFixed(1)
              : "-"}{" "}
            / 5
          </Typography>
        </Box>
        <Box
          component="img"
          src={
            course?.image ? course?.image : "/images/logos/horizontal_logo.png"
          }
          alt={title}
        />
        {/* Learning Mode Chip */}
        <Chip
          label={learning_mode ? toSentenceCase(learning_mode) : "Online"}
          size="small"
          color={learning_mode === "PHYSICAL" ? "warning" : "info"}
          variant="outlined"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            fontWeight: 700,
            zIndex: 2,
            textTransform: "capitalize",
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1.5}>
          <Typography
            color="primary"
            variant="h6"
            component="h3"
            sx={{ fontWeight: 700 }}
          >
            {truncateString(title, 75)}
          </Typography>
          {/* Venue and Date for Physical Courses */}
          {learning_mode === "PHYSICAL" && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              mt={0.5}
              mb={1}
            >
              {course.venue && (
                <Chip
                  icon={<PersonOutlineIcon fontSize="small" />}
                  label={course.venue}
                  size="small"
                  color="default"
                  sx={{ fontWeight: 500 }}
                />
              )}
              {course.training_date && (
                <Chip
                  icon={<CalendarTodayOutlinedIcon fontSize="small" />}
                  label={format(new Date(course.training_date), "PPP")}
                  size="small"
                  color="default"
                  sx={{ fontWeight: 500 }}
                />
              )}
            </Stack>
          )}
          <Typography variant="subtitle2"> {course.category}</Typography>
          <Typography variant="body2" color="text.secondary">
            {truncateString(description, 200)}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
          {expertise_level && (
            <Chip
              label={expertise_level}
              color="default"
              size="small"
              sx={{ mt: 2, width: "fit-content", color: "primary.main" }}
            />
          )}
          {isPaid ? (
            <Chip
              label={`$${amount}`}
              color="default"
              size="small"
              sx={{ mt: 1, width: "fit-content" }}
            />
          ) : (
            <Chip
              label="Free"
              color="success"
              size="small"
              sx={{ mt: 1, width: "fit-content" }}
            />
          )}
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          endIcon={<ArrowForward />}
          fullWidth
          variant="contained"
          color="primary"
          onClick={href ? undefined : handleAction}
          component={href ? "a" : undefined}
          href={href}
        >
          {ctaLabel}
        </Button>
      </CardActions>
    </Card>
  );
};

export default CourseCard;
