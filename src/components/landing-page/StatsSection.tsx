import React from "react";
import { Box, Grid, Skeleton, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { AnalyticsCard } from "@/components/shared/AnalyticsCard";
import { CustomContainer } from "@/components/shared/CustomContainer";
import SchoolIcon from "@mui/icons-material/School";
import GroupIcon from "@mui/icons-material/Group";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

type TGlobalStats = {
  total_courses: number;
  total_enrollments: number;
  total_users: number;
  total_trainers: number;
  average_module_progress_percentage: number;
};

type TGlobalStatsResponse = {
  status: string;
  message: string;
  data: TGlobalStats;
};

const fmt = (n: number | undefined) =>
  n !== undefined ? n.toLocaleString() : "—";

const StatsSection = () => {
  const { data, isLoading } = useQuery<TGlobalStats>({
    queryKey: ["global-statistics"],
    queryFn: async () => {
      const response = await apiClient.get<TGlobalStatsResponse>(
        "/main/v1/global/statistics/"
      );
      return response!.data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const stats = [
    {
      title: "Total Courses",
      value: fmt(data?.total_courses),
      subtitle: "Available learning programs",
      icon: <SchoolIcon />,
      color: "primary" as const,
    },
    {
      title: "Enrollments",
      value: fmt(data?.total_enrollments),
      subtitle: "Active course enrolments",
      icon: <GroupIcon />,
      color: "success" as const,
      trend: data?.average_module_progress_percentage !== undefined
        ? { value: `${data.average_module_progress_percentage}% avg progress`, isPositive: true }
        : undefined,
    },
    {
      title: "Trainers",
      value: fmt(data?.total_trainers),
      subtitle: "Expert instructors",
      icon: <RecordVoiceOverIcon />,
      color: "warning" as const,
    },
    {
      title: "Total Users",
      value: fmt(data?.total_users),
      subtitle: "Registered platform users",
      icon: <PeopleAltIcon />,
      color: "info" as const,
    },
  ];

  return (
    <Box sx={{ py: 8, bgcolor: "grey.50" }}>
      <CustomContainer>
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight={700}
          gutterBottom
        >
          Our Impact at a Glance
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 5 }}
        >
          Empowering floriculture professionals across the fresh produce industry
        </Typography>
        <Grid container spacing={3}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Skeleton
                    variant="rectangular"
                    height={160}
                    sx={{ borderRadius: 4 }}
                  />
                </Grid>
              ))
            : stats.map((stat) => (
                <Grid item xs={12} sm={6} md={3} key={stat.title}>
                  <AnalyticsCard {...stat} />
                </Grid>
              ))}
        </Grid>
      </CustomContainer>
    </Box>
  );
};

export default StatsSection;
