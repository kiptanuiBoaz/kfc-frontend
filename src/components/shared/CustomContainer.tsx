import { Box } from "@mui/material";
import React from "react";

interface CustomContainerProps {
  children: React.ReactNode;
  sx?: object;
}

export const CustomContainer: React.FC<CustomContainerProps> = ({
  children,
  sx,
}) => {
  return <Box sx={{ pr: [2, 0, 0], px: [0, 4, 8], ...sx }}>{children}</Box>;
};
