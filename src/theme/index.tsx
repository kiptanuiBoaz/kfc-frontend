import PropTypes from "prop-types";
import { useMemo } from "react";
// @mui
import { CssBaseline } from "@mui/material";
import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";

import typography from "./typography";
import breakpoints from "./breakpoints";
import componentsOverride from "./overrides";
import shadows, { customShadows } from "./shadows";
import { buildPalette } from "./palette";
import { useSelector } from "react-redux";
import { selectThemePreferences } from "../redux/slices/preferencesSlice";

// ----------------------------------------------------------------------

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { primaryColor, secondaryColor } = useSelector(selectThemePreferences);

  const themeOptions = useMemo(() => {
    const dynamicPalette = buildPalette();
    return {
      palette: dynamicPalette,
      typography,
      breakpoints,
      shape: { borderRadius: 4 },
      direction: "ltr",
      shadows: shadows.light,
      customShadows: customShadows.light,
    };
  }, [primaryColor, secondaryColor]);

  // @ts-ignore
  const theme = createTheme(themeOptions);

  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
