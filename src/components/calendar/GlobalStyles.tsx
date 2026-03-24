import { useTheme } from "@mui/material";
import React from "react";
import { Global } from "@emotion/react";

export const GlobalStyles = () => {
  const theme = useTheme();
  return (
    <Global
      styles={{
        ".fc .fc-button": {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          border: "none",
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: "none",
          transition: "background 0.2s",
          padding: "6px 16px",
          margin: "0 2px",
        },
        ".fc .fc-button:hover, .fc .fc-button:focus": {
          backgroundColor: theme.palette.primary.dark,
          color: theme.palette.primary.contrastText,
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
        },
        // Increase specificity and use !important for active button
        ".fc .fc-button.fc-button-active, .fc .fc-button.fc-button-active:focus, .fc .fc-button.fc-button-active:hover":
          {
            backgroundColor: `${theme.palette.secondary.main} !important`,
            color: `${theme.palette.secondary.contrastText} !important`,
            border: "none",
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
          },
        ".fc .fc-button:active": {
          backgroundColor: theme.palette.secondary.dark,
          color: theme.palette.secondary.contrastText,
        },
        ".fc .fc-button:disabled": {
          backgroundColor: theme.palette.action.disabled,
          // @ts-ignore
          color: theme.palette.action.disabledContrast,
          opacity: 0.7,
        },
      }}
    />
  );
};
