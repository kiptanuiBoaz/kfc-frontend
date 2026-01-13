import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Edit, Eye, BookOpen, Users, Clock } from "lucide-react";
import { TCourse } from "@/types/course.types";
import { getStatusColor } from "@/utils/getStatusColor";

interface CourseRowCardProps {
  course: TCourse;
  onViewDetails: (course: TCourse) => void;
  onEdit?: (course: TCourse) => void;
}

export const CourseRowCard: React.FC<CourseRowCardProps> = ({
  course,
  onViewDetails,
  onEdit,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger navigation if clicking on action buttons
    if ((e.target as HTMLElement).closest('[data-action="true"]')) {
      return;
    }
    onViewDetails(course);
  };

  return (
    <Card
      sx={{
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: (theme) => theme.shadows[4],
          transform: "translateY(-2px)",
        },
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={3} alignItems="center">
          {/* Course Image/Avatar */}
          {/* <Avatar
            variant="rounded"
            sx={{
              width: 80,
              height: 80,
              bgcolor: "primary.main",
              fontSize: "2rem",
              fontWeight: 700,
            }}
          >
            {course.title.charAt(0).toUpperCase()}
          </Avatar> */}

          {/* Course Info */}
          <Box flex={1} minWidth={0}>
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {course.title}
              </Typography>
              <Chip
                label={course.status}
                size="small"
                color={getStatusColor(course.status) as any}
                variant="filled"
                sx={{ textTransform: "capitalize", fontWeight: 500 }}
              />
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                mb: 1,
              }}
            >
              {course.description}
            </Typography>

            <Stack direction="row" spacing={3} alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <BookOpen size={16} color="#666" />
                <Typography variant="caption" color="text.secondary">
                  {course.modules?.length || 0} modules
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Users size={16} color="#666" />
                <Typography variant="caption" color="text.secondary">
                  {course.expertise_level}
                </Typography>
              </Stack>

              {course.isPaid && course.amount && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="primary.main"
                  >
                    {course.currency ?? "USD"} {course.amount}
                  </Typography>
                </Stack>
              )}

              {!course.isPaid && (
                <Chip
                  label="Free"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem", height: 20 }}
                />
              )}
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(course);
                }}
                data-action="true"
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                <Eye size={16} />
              </IconButton>
            </Tooltip>

            {onEdit && (
              <Tooltip title="Edit Course">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(course);
                  }}
                  data-action="true"
                  sx={{
                    bgcolor: "grey.100",
                    "&:hover": {
                      bgcolor: "grey.200",
                    },
                  }}
                >
                  <Edit size={16} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
