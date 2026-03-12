import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonBox from './SkeletonBox';
import Theme from '../../theme';

const DashboardSkeleton: React.FC = () => (
  <View style={styles.container}>
    <SkeletonBox height={180} borderRadius={Theme.borderRadius.xl} style={styles.hero} />
    <View style={styles.row}>
      <SkeletonBox width="48%" height={100} borderRadius={Theme.borderRadius.lg} />
      <SkeletonBox width="48%" height={100} borderRadius={Theme.borderRadius.lg} />
    </View>
    <SkeletonBox height={60} borderRadius={Theme.borderRadius.md} style={styles.item} />
    <SkeletonBox height={60} borderRadius={Theme.borderRadius.md} style={styles.item} />
    <SkeletonBox height={60} borderRadius={Theme.borderRadius.md} style={styles.item} />
  </View>
);

const styles = StyleSheet.create({
  container: { padding: Theme.spacing.md },
  hero: { marginBottom: Theme.spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  item: { marginBottom: Theme.spacing.sm },
});

export default DashboardSkeleton;
