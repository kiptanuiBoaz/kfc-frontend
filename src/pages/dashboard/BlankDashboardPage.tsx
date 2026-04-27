import React from "react";
import { Box, Typography, Paper, Stack } from "@mui/material";
import { useUser } from "@/hooks/useAuth";

const BlankDashboardPage: React.FC<{ title: string }> = ({ title }) => {
  const user = useUser();
  const orgName = user?.organization?.org_name || "Organization";

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 800,
            color: "text.primary",
            letterSpacing: "-0.01em",
          }}
        >
          {orgName} {title}
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 4,
            border: "2px dashed",
            borderColor: "divider",
            backgroundColor: "grey.50",
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {title.toLowerCase()} data available yet.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Once details are fed for {orgName}, they will appear here.
          </Typography>
        </Paper>
      </Box>
    </Stack>
  );
};

export default BlankDashboardPage;
