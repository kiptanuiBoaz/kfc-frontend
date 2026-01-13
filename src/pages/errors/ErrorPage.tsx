import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/navigation/paths";

const ErrorPage: React.FC<{ message: string }> = ({ message }) => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 8 }}>
      <Box>
        <Typography variant="h1" component="h1" gutterBottom>
          Oops!
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          {message}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          An unexpected error occurred. Please try again later or contact
          support if the problem persists.
        </Typography>
        <Button variant="contained" onClick={() => navigate(PATHS.HOME)}>
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
};

export default ErrorPage;
