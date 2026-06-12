import React from "react";
import { Box, Typography, Container, Paper, Stack } from "@mui/material";
import { Layout } from "lucide-react";

interface BlankDashboardPageProps {
  title: string;
}

const BlankDashboardPage: React.FC<BlankDashboardPageProps> = ({ title }) => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: "-0.01em",
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Management and overview of your {title.toLowerCase()} sections.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 4,
            border: "1px dashed",
            borderColor: "divider",
            backgroundColor: "rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "primary.light",
              color: "primary.main",
              mb: 3,
              opacity: 0.8,
            }}
          >
            <Layout size={40} />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {title} Module Coming Soon
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mx: "auto" }}>
            We are currently building this section to provide you with the best possible experience. 
            Stay tuned for updates!
          </Typography>
        </Paper>
      </Stack>
    </Container>
  );
};

export default BlankDashboardPage;
