import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1, tension: 60, friction: 8, useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1, duration: 600, useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0, duration: 500, useNativeDriver: true,
        }),
        Animated.timing(taglineAnim, {
          toValue: 1, duration: 500, useNativeDriver: true,
        }),
      ]),
      Animated.delay(1200),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <Animated.View style={[
        styles.logoWrap,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}>
        <View style={styles.iconBg}>
          <MaterialCommunityIcons
            name="cash-fast"
            size={56}
            color={Theme.colors.secondary}
          />
        </View>
      </Animated.View>
      <Animated.View style={{
        transform: [{ translateY: slideAnim }],
        opacity: taglineAnim,
        alignItems: 'center',
      }}>
        <Text style={styles.appName}>MonetariaX</Text>
        <Text style={styles.tagline}>Tu flujo financiero, claro y simple</Text>
      </Animated.View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ecuador · LATAM</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: Theme.colors.primaryLight,
    top: -100,
    right: -100,
    opacity: 0.3,
  },
  bgCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Theme.colors.secondary,
    bottom: -80,
    left: -80,
    opacity: 0.15,
  },
  logoWrap: {
    marginBottom: Theme.spacing.xl,
  },
  iconBg: {
    width: 110,
    height: 110,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
});

export default SplashScreen;
