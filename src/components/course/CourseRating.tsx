import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import { apiClient } from "@/api/apiClient";
import { TCourse, TCourseInterractions } from "@/types/course.types";
import Notiflix from "notiflix";
import { useQuery } from "@tanstack/react-query";
import { MEDIA_BASE_URL } from "@/api/axios";

export const CourseRating = ({ course }: { course: TCourse }) => {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userReview, setUserReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    data: courseInteractions,
    isLoading,
    error,
  } = useQuery<TCourseInterractions>({
    queryKey: ["course-interactions", course.guid],
    queryFn: async () => {
      const response = await apiClient.get<{ data: TCourseInterractions }>(
        `/main/v1/interactions/${course.guid}/all/`,
      );
      return response?.data || {
        summary: {
          likes: 0,
          saves: 0,
          average_rating: 0,
          ratings_count: 0,
          reviews_count: 0,
          user_liked: false,
          user_saved: false,
          user_rating: null,
        },
        reviews: [],
      };
    },
    enabled: !!course.guid,
  });

  const handleSubmitReview = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // POST rating
      await apiClient.post("/main/v1/interactions/create/", {
        course_guid: course.guid,
        interaction_type: "rating",
        rating: userRating,
      });
      // POST review
      await apiClient.post("/main/v1/interactions/create/", {
        course_guid: course.guid,
        interaction_type: "review",
        // rating: userRating,
        review_text: userReview,
      });
      setUserRating(null);
      setUserReview("");
      Notiflix.Notify.success("Your review has been submitted successfully!");
    } catch (err) {
      setSubmitError("Failed to submit review. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading and error states
  if (isLoading) {
    return <CircularProgress size={24} />;
  }
  if (error || !courseInteractions) {
    return <Typography color="error">Failed to load reviews.</Typography>;
  }

  const { summary, reviews } = courseInteractions;

  return (
    <Box sx={{ mt: 2 }}>
      {/* Summary Section */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
        {/* <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ mb: 2, flexWrap: "wrap" }}
        >
          <Rating
            value={summary.average_rating || 0}
            precision={0.1}
            readOnly
          />
          <Typography variant="subtitle1">
            {summary.average_rating ? summary.average_rating.toFixed(1) : "-"} /
            5
          </Typography>
          <Chip label={`${summary.ratings_count} ratings`} size="small" />
          <Chip label={`${summary.reviews_count} reviews`} size="small" />
          <Chip label={`${summary.likes} likes`} size="small" />
          <Chip label={`${summary.saves} saves`} size="small" />
        </Stack> */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          Add Your Rating & Review
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ mb: 1, flexWrap: "wrap" }}
        >
          <Rating
            name="user-rating"
            value={userRating}
            onChange={(_, value) => setUserRating(value)}
          />
          <TextField
            label="Write a review"
            value={userReview}
            onChange={(e) => setUserReview(e.target.value)}
            size="small"
            multiline
            minRows={1}
            maxRows={3}
            sx={{ flex: 1, minWidth: 180 }}
          />
          <Button
            variant="contained"
            disabled={submitting || !userRating}
            onClick={handleSubmitReview}
          >
            Submit
          </Button>
        </Stack>
        {submitError && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {submitError}
          </Typography>
        )}
      </Paper>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Previous Reviews
      </Typography>
      <Stack spacing={2}>
        {reviews.length === 0 ? (
          <Typography color="text.secondary">No reviews yet.</Typography>
        ) : (
          reviews.map((review: any) => (
            <Paper key={review.guid} sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar src={`${MEDIA_BASE_URL}${review.user.image}`}>
                  {review.user.first_name?.[0]}
                </Avatar>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2">
                      {review.user.first_name} {review.user.last_name}
                    </Typography>
                    {review.rating !== null && (
                      <Rating value={review.rating} readOnly size="small" />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.created_at).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  {review.review_text && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {review.review_text}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          ))
        )}
      </Stack>
    </Box>
  );
};
