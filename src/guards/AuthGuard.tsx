import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useIsAuthenticated, useIsAuthRestoring } from "@/hooks/useAuth";
import { PATHS } from "@/navigation/paths";
import { Box, CircularProgress } from "@mui/material";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();
  const isRestoring = useIsAuthRestoring();
  const location = useLocation();

  if (isRestoring) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with the current location as state
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
