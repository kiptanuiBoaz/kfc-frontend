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
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        background: alpha(theme.palette[color].main, 0.04),
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px -8px ${alpha(theme.palette[color].main, 0.15)}`,
          background: alpha(theme.palette[color].main, 0.08),
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                p: 1.25,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette[color].main, 0.12),
                color: theme.palette[color].main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {React.cloneElement(icon as React.ReactElement<any>, {
                size: 22,
              })}
            </Box>
            {trend && (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 10,
                  backgroundColor: alpha(
                    trend.isPositive
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                    0.12
                  ),
                  color: trend.isPositive
                    ? theme.palette.success.dark
                    : theme.palette.error.dark,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {trend.value}
              </Box>
            )}
          </Box>
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: theme.palette[color].dark,
                mb: 0.5,
                fontSize: "1.75rem",
                letterSpacing: "-0.02em",
              }}
            >
              {value}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 0.25,
                fontSize: "1rem",
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
