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
} from "@mui/material";
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

  const [downloading, setDownloading] = useState(false);

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
    } catch (err) {
      alert("Failed to download certificate.");
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
          src={
            course?.image ? course?.image : "/images/logos/horizontal_logo.png"
          }
          alt={course.title}
        />
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
            right: 12,

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
