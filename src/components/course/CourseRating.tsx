import React, { useState } from "react";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  List,
  ListItem,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { apiClient } from "@/api/apiClient";
import { TCourse } from "@/types/course.types";
import Notiflix from "notiflix";

export const CourseRating = ({ course }: { course: TCourse }) => {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userReview, setUserReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const staticReviews = [
    {
      id: 1,
      name: "Jane Doe",
      avatar: "",
      rating: 5,
      review: "Excellent course! Learned a lot.",
      date: "2026-03-20",
    },
    {
      id: 2,
      name: "John Smith",
      avatar: "",
      rating: 4,
      review: "Good content, well structured.",
      date: "2026-03-18",
    },
  ];

  const handleSubmitReview = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // POST rating
      await apiClient.post("/main/v1/courses/interactions/", {
        course_guid: course.guid,
        interaction_type: "rating",
        rating: userRating,
      });
      // POST review
      await apiClient.post("/main/v1/courses/interactions/", {
        course_guid: course.guid,
        interaction_type: "review",
        rating: userRating,
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

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Add Your Rating & Review
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
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
            sx={{ flex: 1 }}
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
        {staticReviews.map((review) => (
          <Paper key={review.id} sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Avatar>{review.name[0]}</Avatar>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2">{review.name}</Typography>
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography variant="caption" color="text.secondary">
                    {review.date}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {review.review}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};
