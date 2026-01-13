import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/navigation/paths";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 8 }}>
      <Box>
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist. It might have been moved or
          deleted.
        </Typography>
        <Button variant="contained" onClick={() => navigate(PATHS.HOME)}>
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
