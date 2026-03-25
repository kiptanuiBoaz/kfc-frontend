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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { useUser } from "@/hooks/useAuth";
import { TCourseDiscussion } from "@/types/course.types";
import { formatDistanceToNow } from "date-fns";

interface DiscussionsProps {
  courseGuid: string;
  instructorGuid: string;
}

const Discussions: React.FC<DiscussionsProps> = ({
  courseGuid,
  instructorGuid,
}) => {
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
        data,
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
    if (!comment.trim() || !user?.guid) return;
    createMutation.mutate({
      course: courseGuid,
      user: user.guid,
      comment: comment.trim(),
    });
  };

  if (isLoading) {
    return <Typography>Loading discussions...</Typography>;
  }

  const getRelativeTime = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Discussions
      </Typography>
      <Paper sx={{ mb: 3 }}>
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
      <List>
        {discussions.map((discussion) => (
          <ListItem disableGutters key={discussion.guid}>
            <Card sx={{ p: 2, width: "100%" }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar>{discussion.user_details?.[0] || "U"}</Avatar>
                <Box flex={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" fontWeight="bold">
                      {discussion.user_details?.name || "Anonymous"}
                    </Typography>
                    {discussion.user_details?.guid === instructorGuid && (
                      <Chip
                        sx={{
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.12),
                          color: (theme) => theme.palette.primary.main,
                        }}
                        label="Instructor"
                        size="small"
                      />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {getRelativeTime(discussion.created_at) || "Just now"}
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
      {discussions.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No discussions yet. Be the first to comment!
        </Typography>
      )}
    </Paper>
  );
};

export default Discussions;
