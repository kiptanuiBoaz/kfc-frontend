import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Rating,
  CardActions,
  Button,
} from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
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
    currency,
    expertise_level,
    learning_mode,
    course_iteractions,
  } = course;

  const handleAction = () => {
    if (onAction) onAction(course);
  };

  return (
    <Card
      elevation={1}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        cursor: "pointer",
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
          "& .course-card__media img": {
            transform: "scale(1.05)",
          },
        },
      }}
    >
      {/* Image */}
      <Box
        className="course-card__media"
        sx={{
          position: "relative",
          height: 200,
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
            image?.startsWith("https://")
              ? image
              : "/images/logos/horizontal_logo.png"
          }
          alt={title}
        />
        <Chip
          label={learning_mode ? toSentenceCase(learning_mode) : "Online"}
          size="small"
          color={learning_mode === "PHYSICAL" ? "warning" : "info"}
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
          <Typography
            color="primary"
            variant="h6"
            component="h3"
            sx={{ fontWeight: 700, lineHeight: 1.3 }}
          >
            {truncateString(title, 75)}
          </Typography>

          {learning_mode === "PHYSICAL" && (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              {course.venue && (
                <Chip
                  icon={<PersonOutlineIcon fontSize="small" />}
                  label={course.venue}
                  size="small"
                />
              )}
              {course.training_date && (
                <Chip
                  icon={<CalendarTodayOutlinedIcon fontSize="small" />}
                  label={format(new Date(course.training_date), "PPP")}
                  size="small"
                />
              )}
            </Stack>
          )}

          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {course.category}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {truncateString(description ?? "", 120)}
          </Typography>

          {/* Rating + meta row */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Rating
              value={course_iteractions?.average_rating || 0}
              precision={0.1}
              readOnly
              size="small"
            />
            <Typography variant="caption" color="text.secondary">
              {course_iteractions?.average_rating
                ? course_iteractions.average_rating.toFixed(1)
                : "No ratings"}
            </Typography>
            <Typography variant="caption" color="text.disabled">·</Typography>
            <Typography variant="caption" color="text.secondary">
              {expertise_level}
            </Typography>
            <Typography variant="caption" color="text.disabled">·</Typography>
            <Typography
              variant="caption"
              fontWeight={700}
              color={isPaid ? "text.primary" : "success.main"}
            >
              {isPaid ? `${currency} ${amount}` : "Free"}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        {href ? (
          <Button
            endIcon={<ArrowForward />}
            fullWidth
            variant="contained"
            color="primary"
            href={href}
            component="a"
          >
            {ctaLabel}
          </Button>
        ) : (
          <Button
            endIcon={<ArrowForward />}
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleAction}
          >
            {ctaLabel}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default CourseCard;
