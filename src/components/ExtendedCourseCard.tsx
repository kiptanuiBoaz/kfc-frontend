import React from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import MilitaryTechOutlinedIcon from "@mui/icons-material/MilitaryTechOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { alpha, useTheme } from "@mui/material/styles";
import { TEnrolledCourse } from "@/types/course.types";
import { useNavigate } from "react-router-dom";
import { truncateString } from "@/utils/truncateString";

interface ExtendedCourseCardProps {
  course: TEnrolledCourse;
  isEnrolled?: boolean;
}

const ExtendedCourseCard: React.FC<ExtendedCourseCardProps> = ({
  course,
  isEnrolled = false,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const handleViewDetails = () => {
    navigate(`/courses/preview/${course.guid}`);
  };

  const handleEnroll = () => {
    navigate(`/courses/${course.guid}/enroll`);
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
        <Box
          component="img"
          src={`/images/${course.guid}.jpeg`}
          alt={course.title}
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
              {truncateString(course.title, 50)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {truncateString(course.description, 150)}
            </Typography>
          </Stack>

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
                    {course.total_duration} weeks
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
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/courses/${course.guid}/learn`)}
            fullWidth
          >
            Continue Learning
          </Button>
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
