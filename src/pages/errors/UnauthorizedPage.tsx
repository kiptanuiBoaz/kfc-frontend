import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/navigation/paths";

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 8 }}>
      <Box>
        <Typography variant="h1" component="h1" gutterBottom>
          401
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Unauthorized Access
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </Typography>
        <Button variant="contained" onClick={() => navigate(PATHS.HOME)}>
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
