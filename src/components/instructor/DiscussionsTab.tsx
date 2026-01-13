import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  List,
  ListItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { TCourseDiscussion } from "@/types/course.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { apiClient } from "@/api/apiClient";
import { useUser } from "@/hooks/useAuth";

export const DiscussionsTab: React.FC = () => {
  const { courseGuid } = useParams<{ courseGuid: string }>();
  const user = useUser();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: discussions = [], isLoading } = useQuery<TCourseDiscussion[]>({
    queryKey: ["discussions", courseGuid],
    queryFn: async () =>
      await apiClient.get(`/main/v1/courses/${courseGuid}/discussions/`),
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      course: string;
      user: string;
      comment: string;
    }) => {
      const response = await apiClient.post(
        "/main/v1/discussions/create/",
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions", courseGuid] });
      setComment("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user?.guid || !courseGuid) return;
    createMutation.mutate({
      course: courseGuid,
      user: user.guid,
      comment: comment.trim(),
    });
  };

  return (
    <Box>
      <Paper sx={{ mb: 1, p: 3 }}>
        <Typography variant="h6" mb={2}>
          Add a Comment
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Share your thoughts..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <Box>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      {/* Display discussions */}
      <List>
        {discussions.map((discussion) => (
          <ListItem key={discussion.guid}>
            <Card variant="outlined" sx={{ p: 2, width: "100%" }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar>{discussion.user_details?.[0] || "U"}</Avatar>
                <Box flex={1}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {discussion.user_details?.name || "Anonymous"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(discussion.created_at || "").toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {discussion.comment}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
