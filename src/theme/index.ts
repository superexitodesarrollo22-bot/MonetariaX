import Colors from './colors';
import Typography from './typography';
import Spacing from './spacing';
import { shadowSm, shadowMd, shadowLg } from './shadows';

export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  shadows: { sm: shadowSm, md: shadowMd, lg: shadowLg },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
};

export default Theme;
