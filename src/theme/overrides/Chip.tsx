import { CloseIcon } from './CustomIcons';

// ----------------------------------------------------------------------

export default function Chip(theme: any) {
  return {
    MuiChip: {
      defaultProps: {
        size: "small",
        deleteIcon: <CloseIcon />,
      },

      styleOverrides: {
        root: {
          fontWeight: "bold",
          paddingLeft: theme.spacing(1), // Use theme.spacing for consistent scaling
          paddingRight: theme.spacing(1),
        },
        colorDefault: {
          '& .MuiChip-avatarMedium, .MuiChip-avatarSmall': {
            color: theme.palette.text.secondary,
          },
        },
        outlined: {
          borderColor: 'transparent', // No border
          '&.MuiChip-colorPrimary': {
            backgroundColor: theme.palette.primary.lighter, // Lighter background color
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: theme.palette.secondary.lighter, // Lighter background color
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: theme.palette.info.lighter, // Lighter background color
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: theme.palette.success.lighter, // Lighter background color
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: theme.palette.warning.lighter, // Lighter background color
            color: theme.palette.warning.main
          },
          '&.MuiChip-colorError': {
            backgroundColor: theme.palette.error.lighter, // Lighter background color
          },
        },
        //
        avatarColorInfo: {
          color: theme.palette.info.contrastText,
          backgroundColor: theme.palette.info.dark,
        },
        avatarColorSuccess: {
          color: theme.palette.success.contrastText,
          backgroundColor: theme.palette.success.dark,
        },
        avatarColorWarning: {
          color: theme.palette.warning.contrastText,
          backgroundColor: theme.palette.warning.dark,
        },
        avatarColorError: {
          color: theme.palette.error.contrastText,
          backgroundColor: theme.palette.error.dark,
        },
      },
    },
  };
}
