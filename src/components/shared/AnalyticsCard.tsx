import React from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  useTheme,
  alpha,
  Chip,
} from "@mui/material";

export interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        borderRadius: 3,
        background: alpha(theme.palette[color].main, 0.05),
        border: `1px solid ${alpha(theme.palette[color].main, 0.15)}`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette[color].main, 0.1),
                color: theme.palette[color].main,
              }}
            >
              {icon}
            </Box>
            {trend && (
              <Chip
                label={trend.value}
                size="small"
                color={trend.isPositive ? "success" : "error"}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
          <Box>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 700,
                color: theme.palette[color].main,
                mb: 0.5,
              }}
            >
              {value}
            </Typography>
            <Typography variant="h6" color="text.primary" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
