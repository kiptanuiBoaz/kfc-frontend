import React from "react";
import { Box, Typography, Paper, Stack, Grid, Card, CardContent, Avatar } from "@mui/material";
import { useUser } from "@/hooks/useAuth";
import { Users, BookOpen, Award, TrendingUp, Activity } from "lucide-react";

const Home: React.FC<{ title: string }> = () => {
  const user = useUser();
  const orgName = user?.organization?.org_name || "Organization";

  const stats = [
    { title: "Total Users", value: "124", icon: Users, color: "#3b82f6", bg: "#eff6ff" },
    { title: "Active Courses", value: "12", icon: BookOpen, color: "#10b981", bg: "#ecfdf5" },
    { title: "Certificates", value: "856", icon: Award, color: "#8b5cf6", bg: "#f5f3ff" },
    { title: "Completion Rate", value: "68%", icon: TrendingUp, color: "#f59e0b", bg: "#fffbeb" },
  ];

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="h4"
          sx={{
            mb: 1,
            fontWeight: 700,
            color: "text.primary",
            letterSpacing: "-0.01em",
          }}
        >
          Welcome to {orgName}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Here is an overview of your organization's learning progress and user activity.
        </Typography>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: stat.bg, color: stat.color, width: 48, height: 48 }}>
                      <stat.icon size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Recent Activity
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              border: "1px dashed",
              borderColor: "divider",
              backgroundColor: "grey.50",
            }}
          >
            <Activity size={40} color="#9ca3af" style={{ marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No recent activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Once your users start enrolling in courses, their activities will appear here.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Stack>
  );
};

export default Home;
