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
import { alpha } from "@mui/material/styles";
import { TCourse } from "@/types/course.types";
import { truncateString } from "@/utils/truncateString";

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
    image = "https://images.unsplash.com/photo-1525791646156-1c04ccf7b6c1?auto=format&fit=crop&w=1000&q=80",
    isPaid,
    amount,
    expertise_level,
  } = course;

  const handleAction = () => {
    if (onAction) {
      onAction(course);
    }
  };

  return (
    <Card
      onClick={href ? undefined : handleAction}
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
        <Box component="img" src={`/images/${course.guid}.jpeg`} alt={title} />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1.5}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
            {truncateString(title, 50)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {truncateString(description, 200)}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
          {expertise_level && (
            <Chip
              label={expertise_level}
              color="secondary"
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
      {/* <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={href ? undefined : handleAction}
          component={href ? "a" : undefined}
          href={href}
        >
          {ctaLabel}
        </Button>
      </CardActions> */}
    </Card>
  );
};

export default CourseCard;
