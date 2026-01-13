export default function TableOverrides(theme: any) {
  const cardBg = theme.palette.background.paper;
  const headerBg = theme.palette.grey[50];

  return {
    MuiTable: {
      styleOverrides: {
        root: {
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          backgroundColor: cardBg,
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: theme.shadows[1],
          overflow: "hidden",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          backgroundColor: cardBg,
          transition: theme.transitions.create("background-color", {
            duration: theme.transitions.duration.shortest,
          }),
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "&:last-of-type td, &:last-of-type th": {
            borderBottom: "none",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${theme.palette.divider}`,
          padding: theme.spacing(2, 2.5),
          fontSize: 14,
          color: theme.palette.text.primary,
        },
        head: {
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontSize: 12,
          fontWeight: 600,
          color: theme.palette.text.secondary,
          backgroundColor: headerBg,
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
        stickyHeader: {
          backgroundColor: headerBg,
        },
      },
    },
  };
}
