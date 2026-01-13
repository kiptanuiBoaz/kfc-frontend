// ----------------------------------------------------------------------

export default function Button(theme: any) {
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          "&:hover": {
            boxShadow: "none",
          },
        },
        sizeLarge: {
          height: 42,
        },
        // contained
        containedInherit: {
          color: theme.palette.grey[800],
          boxShadow: theme.customShadows.z8,
          "&:hover": {
            backgroundColor: theme.palette.grey[400],
          },
        },
        containedPrimary: {
          boxShadow: `0 8px 16px 0 ${theme.palette.primary.main}1A`,
        },
        containedSecondary: {
          boxShadow: theme.customShadows.secondary,
        },
        containedInfo: {
          boxShadow: theme.customShadows.info,
        },
        containedSuccess: {
          boxShadow: theme.customShadows.success,
        },
        containedWarning: {
          boxShadow: theme.customShadows.warning,
        },
        containedError: {
          boxShadow: theme.customShadows.error,
        },
        // outlined
        outlinedInherit: {
          border: `1px solid ${theme.palette.grey[500_32]}`,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        },
        textInherit: {
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        },
        // Add icon button styling
        iconButton: {
          backgroundColor: theme.palette.background.paper,
        },
      },
    },
  };
}
