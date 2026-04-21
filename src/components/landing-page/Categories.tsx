import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";

interface Category {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const categories: Category[] = [
  {
    id: "production",
    title: "Production & Farm Operations",
    description:
      "Master the fundamentals of floriculture production, farm management, and operational excellence.",
    icon: <AgricultureIcon sx={{ fontSize: 48 }} />,
    color: "#2e7d32", // green
  },
  {
    id: "postharvest",
    title: "Post-Harvest, Quality & Logistics",
    description:
      "Learn best practices in post-harvest handling, quality assurance, and supply chain logistics.",
    icon: <LocalShippingIcon sx={{ fontSize: 48 }} />,
    color: "#1976d2", // blue
  },
  {
    id: "compliance",
    title: "Compliance & ESG (Export Readiness)",
    description:
      "Strengthen export readiness through compliance standards, sustainability, and ESG frameworks.",
    icon: <VerifiedIcon sx={{ fontSize: 48 }} />,
    color: "#d32f2f", // red
  },
  {
    id: "business",
    title: "Business, Markets & Leadership",
    description:
      "Develop strategic business acumen, market insights, and leadership capabilities.",
    icon: <BusinessCenterIcon sx={{ fontSize: 48 }} />,
    color: "#f57c00", // orange
  },
];

export default function Categories() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryTitle: string) => {
    // Navigate to browse courses with category filter
    navigate(`/courses?category=${encodeURIComponent(categoryTitle)}`);
  };

  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            color="primary"
            gutterBottom
            textAlign={"center"}
            variant="h3"
          >
            Explore Our Schools
          </Typography>
          <Typography
            textAlign={"center"}
            variant="body1"
            color="text.secondary"
          >
            Strengthening export readiness across the floriculture value chain
            through specialized learning pathways
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={3} key={category.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                  },
                  borderTop: `4px solid ${category.color}`,
                }}
              >
                <CardActionArea
                  onClick={() => handleCategoryClick(category.title)}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    justifyContent: "flex-start",
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      py: 4,
                      px: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        backgroundColor: `${category.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                        color: category.color,
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        mb: 2,
                      }}
                    >
                      {category.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7 }}
                    >
                      {category.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
