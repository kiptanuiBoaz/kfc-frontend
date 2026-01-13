import React from "react";
import { Typography, Button, Box, Container, Grid } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PATHS } from "@/navigation/paths";
import { CustomContainer } from "@/components/shared/CustomContainer";

export const Hero = () => {
  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: "secondary.lighter",
      }}
    >
      <CustomContainer>
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
              textAlign: { xs: "center", md: "left" },
              gap: 2,
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: { xs: 2, md: 3 },
                fontSize: { xs: "2rem", sm: "2.4rem", md: "3rem" },
                lineHeight: { xs: 1.2, md: 1.3 },
              }}
            >
              Empowering Agricultural
              <br />
              Professionals and
              <br />
              Agripreneurs
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: { xs: 3, md: 4 },
                maxWidth: { xs: "100%", md: "80%" },
              }}
            >
              Access expert-led courses, certifications, and resources to grow
              your skills and career in the agricultural sector.
            </Typography>

            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to={PATHS.COURSES}
              sx={{
                alignSelf: { xs: "stretch", sm: "center", md: "flex-start" },
                maxWidth: { xs: "100%", sm: 260 },
              }}
            >
              Explore Courses
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={"/images/farmer.jpg"}
              alt="students"
              sx={{
                display: { xs: "none", md: "block" },
                width: "100%",
                borderRadius: 2,
                boxShadow: 3,
                objectFit: "cover",
                maxHeight: { xs: 320, sm: 400, md: "unset" },
              }}
            />
          </Grid>
        </Grid>
      </CustomContainer>
    </Box>
  );
};
