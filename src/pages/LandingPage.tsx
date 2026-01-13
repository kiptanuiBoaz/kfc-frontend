import React from "react";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import { Hero } from "@/components/landing-page/Hero";
import FeaturedCourses from "@/components/landing-page/FeaturedCourses";
import Footer from "@/components/landing-page/Footer";

export default function LandingPage() {
  return (
    <Box>
      <Hero />
      <FeaturedCourses />
    </Box>
  );
}
