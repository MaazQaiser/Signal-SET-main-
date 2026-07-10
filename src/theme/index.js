import { createTheme } from '@mui/material/styles';

import breakpoints from './breakpoints';
import darkThemeConfig from './dark/theme';
import overrides from './overrides';
import palette from './palette';
import typography from './typography';

const buildThemeConfig = (paletteConfig) => {
  const config = {
    palette: paletteConfig,
    typography: typography(paletteConfig),
    overrides: overrides({ palette: paletteConfig }),
    breakpoints: breakpoints,
  };

  return {
    ...config,
    components: {
      MuiButton: config.overrides.MuiButton,
      MuiOutlinedInput: config.overrides.MuiTextField,
      MuiSwitch: config.overrides.MuiSwitch,
      MuiRadio: config.overrides.MuiRadio,
      MuiCheckbox: config.overrides.MuiCheckbox,
      MuiInputLabel: config.overrides.MuiInputLabel,
      MuiTableCell: config.overrides.MuiTableCell,
      MuiChip: config.overrides.MuiChip,
      MuiSelect: config.overrides.MuiSelect,
      MuiMenuItem: config.overrides.MuiMenuItem,
      MuiTooltip: config.overrides.MuiTooltip,
      MuiAccordion: config.overrides.MuiAccordion,
      MuiSkeleton: config.overrides.MuiSkeleton,
      MuiList: config.overrides.MuiList,
      MuiLinearProgress: config.overrides.MuiLinearProgress,
    },
  };
};

export const createAppTheme = (paletteConfig = palette) =>
  createTheme(buildThemeConfig(paletteConfig));

export const theme = createAppTheme();

export const themeDark = createTheme({
  ...darkThemeConfig,
  components: {
    MuiButton: darkThemeConfig.overrides.MuiButton,
  },
});
