import { ERROR, GREY, INFO, PRIMARTY, SECONDARY, SUCCESS, WARNING } from '@/lib/palette_colors'
import { alpha } from '@mui/material/styles'


// Utility to create gradient backgrounds
function createGradient(color1: string, color2: string) {
  return `linear-gradient(to bottom, ${color1}, ${color2})`
}

function createGradientWithOpacity(color1: string, color2: string, opacity: number) {
  return `linear-gradient(to bottom, ${alpha(color1, opacity)}, ${alpha(
    color2,
    opacity
  )})`
}


export const buildPalette = () => {
  // Use the project's chosen green palette (dark green primary, light green secondary)
  const PRIMARY = {
    lighter: PRIMARTY.lighter,
    light: PRIMARTY.light,
    main: PRIMARTY.main,
    dark: PRIMARTY.dark,
    darker: PRIMARTY.darker,
    contrastText: PRIMARTY.contrastText,
  };

  const SECONDARY_PALETTE = {
    lighter: SECONDARY.lighter,
    light: SECONDARY.light,
    main: SECONDARY.main,
    dark: SECONDARY.dark,
    darker: SECONDARY.darker,
    contrastText: SECONDARY.contrastText,
  };

  const GRADIENTS = {
    primary: createGradient(PRIMARY.light, PRIMARY.main),
    secondary: createGradient(SECONDARY_PALETTE.light, SECONDARY_PALETTE.main),
    lightBackgroundWithOpacity: createGradientWithOpacity('#f3e8f5', PRIMARY.light, 0.7),
    lightBackground: createGradient('#f3e8f5', PRIMARY.light),
    info: createGradient(INFO.light, INFO.main),
    success: createGradient(SUCCESS.light, SUCCESS.main),
    warning: createGradient(WARNING.light, WARNING.main),
    error: createGradient(ERROR.light, ERROR.main)
  }
  const COMMON = {
    common: { black: '#000', white: '#fff' },
    primary: { ...PRIMARY, contrastText: '#fff' },
    secondary: { ...SECONDARY_PALETTE, contrastText: '#fff' },
    info: { ...INFO, contrastText: '#fff' },
    success: { ...SUCCESS, contrastText: '#fff' },
    warning: { ...WARNING, contrastText: GREY[800] },
    error: { ...ERROR, contrastText: '#fff' },
    grey: GREY,
    gradients: GRADIENTS,
    divider: GREY[500_24],
    action: {
      hover: GREY[500_8],
      selected: GREY[500_16],
      disabled: GREY[500_80],
      disabledBackground: GREY[500_24],
      focus: GREY[500_24],
      hoverOpacity: 0.08,
      disabledOpacity: 0.48
    }
  }
  return {
    mode: 'light',
    text: { primary: '#181c31', secondary: GREY[600], disabled: GREY[500] },
    background: { paper: GREY[200], default: '#ffff', neutral: GREY[200] },
    ...COMMON
  }
}

// Backwards compatibility default export for any legacy imports
export const palette = buildPalette()
