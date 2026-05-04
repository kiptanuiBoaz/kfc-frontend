import React from "react";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import { Hero } from "@/components/landing-page/Hero";
import StatsSection from "@/components/landing-page/StatsSection";
import Categories from "@/components/landing-page/Categories";
import FeaturedCourses from "@/components/landing-page/FeaturedCourses";
import { TrainingCalendar } from "@/components/landing-page/TrainingCalendar";

export default function LandingPage() {
  return (
    <Box>
      <Hero />
      <StatsSection />
      <Categories />
      <FeaturedCourses />
      <TrainingCalendar />
    </Box>
  );
}
