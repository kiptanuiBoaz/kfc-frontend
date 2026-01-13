import { Box } from "@mui/material";
import React from "react";

export const CustomContainer = ({ children }) => {
  return <Box sx={{ pr: [2, 0, 0], px: [0, 4, 8] }}>{children}</Box>;
};
