import React from "react";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import { Hero } from "@/components/landing-page/Hero";
import Categories from "@/components/landing-page/Categories";
import FeaturedCourses from "@/components/landing-page/FeaturedCourses";
import { TrainingCalendar } from "@/components/landing-page/TrainingCalendar";

export default function LandingPage() {
  return (
    <Box>
      <Hero />
      <Categories />
      <FeaturedCourses />
      <TrainingCalendar />
    </Box>
  );
}
