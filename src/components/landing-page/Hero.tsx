import React from "react";
import {
  Typography,
  Button,
  Box,
  Grid,
  Stack,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Link as RouterLink } from "react-router-dom";
import { PATHS } from "@/navigation/paths";
import { CustomContainer } from "@/components/shared/CustomContainer";

export const Hero = () => {
  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url(/images/farmer.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          zIndex: 1,
        },
      }}
    >
      <CustomContainer sx={{ position: "relative", zIndex: 2 }}>
        <Grid
          container
          spacing={{ xs: 3, md: 4 }}
          alignItems="center"
          justifyContent="center"
        >
          <Grid
            item
            xs={12}
            md={10}
            lg={8}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 3,
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: { xs: 1, md: 2 },
                fontSize: {
                  xs: "2.2rem",
                  sm: "2.6rem",
                  md: "3.5rem",
                  lg: "4rem",
                },
                lineHeight: { xs: 1.2, md: 1.3 },
                color: "white",
              }}
            >
              Grow a Thriving Flower Farm
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: { xs: 2, md: 3 },
                maxWidth: { xs: "100%", md: "90%", lg: "80%" },
                color: "white",
                fontSize: { xs: "1rem", md: "1.125rem" },
              }}
            >
              Learn floriculture best practices—from propagation and greenhouse
              management to post-harvest handling, market access, and business
              operations. Build the skills to scale your flower farming
              sustainably and profitably.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ justifyContent: "center", alignItems: "center" }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to={PATHS.COURSES}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                }}
              >
                Explore Flower Courses
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to={PATHS.SIGN_UP}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderColor: "white",
                  color: "white",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Get Started Free
              </Button>
            </Stack>

            <Stack
              spacing={2}
              sx={{ mt: { xs: 2, md: 3 }, alignItems: "center" }}
            >
              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                justifyContent="center"
                sx={{ color: "white" }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocalFloristIcon sx={{ color: "white" }} />
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Propagation mastery
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <WaterDropIcon sx={{ color: "white" }} />
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Greenhouse & irrigation
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TrendingUpIcon sx={{ color: "white" }} />
                  <Typography variant="body2" sx={{ color: "white" }}>
                    Post-harvest & markets
                  </Typography>
                </Stack>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                justifyContent="center"
                sx={{ mt: 1 }}
              >
                <Chip
                  label="Roses"
                  variant="outlined"
                  sx={{ borderColor: "white", color: "white" }}
                />
                <Chip
                  label="Greenhouse"
                  variant="outlined"
                  sx={{ borderColor: "white", color: "white" }}
                />
                <Chip
                  label="Irrigation"
                  variant="outlined"
                  sx={{ borderColor: "white", color: "white" }}
                />
                <Chip
                  label="Post-harvest"
                  variant="outlined"
                  sx={{ borderColor: "white", color: "white" }}
                />
                <Chip
                  label="Marketing"
                  variant="outlined"
                  sx={{ borderColor: "white", color: "white" }}
                />
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CustomContainer>
    </Box>
  );
};
