import { Platform } from 'react-native';

export const shadowSm = Platform.select({
  ios: {
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  android: { elevation: 2 },
});

export const shadowMd = Platform.select({
  ios: {
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  android: { elevation: 5 },
});

export const shadowLg = Platform.select({
  ios: {
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  android: { elevation: 10 },
});
