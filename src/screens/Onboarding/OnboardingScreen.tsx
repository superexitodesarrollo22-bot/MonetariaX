import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
  TouchableOpacity, Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../../theme';
import Button from '../../components/common/Button';
import { useConfigStore } from '../../store/configStore';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: 'cash-fast',
    iconColor: Theme.colors.secondary,
    bg: '#E0FFF7',
    title: '¡Bienvenido a MonetariaX!',
    description:
      'Controla tus ingresos, gastos y deudas en un solo lugar.\nTu dinero, claro como el agua.',
  },
  {
    icon: 'chart-areaspline',
    iconColor: Theme.colors.primary,
    bg: '#E8EDFF',
    title: 'Registra cada movimiento',
    description:
      'Anota lo que entra y lo que sale al instante.\nCategoriza tus gastos y lleva un control real de tu dinero día a día.',
  },
  {
    icon: 'credit-card-clock-outline',
    iconColor: Theme.colors.accent,
    bg: '#FFF3E0',
    title: 'Controla tus deudas',
    description:
      'Sabe exactamente cuánto debes, cuándo terminas de pagar y cuánto pagas en intereses.\nSin sorpresas.',
  },
  {
    icon: 'bug-outline',
    iconColor: Theme.colors.danger,
    bg: '#FFE5E7',
    title: 'Detecta gastos hormiga',
    description:
      'Esos pequeños gastos que se acumulan sin que los notes.\nMonetariaX los detecta y te alerta para que recuperes el control.',
  },
];

interface OnboardingScreenProps {
  onFinish: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { marcarOnboardingCompletado } = useConfigStore();

  const goNext = () => {
    if (current < slides.length - 1) {
      const next = current + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setCurrent(next);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await marcarOnboardingCompletado();
    onFinish();
  };

  const slide = slides[current];

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      >
        {slides.map((s, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { backgroundColor: s.bg }]}>
              <MaterialCommunityIcons name={s.icon as any} size={72} color={s.iconColor} />
            </View>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.description}>{s.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsWrap}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === current && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        {current < slides.length - 1 ? (
          <TouchableOpacity onPress={handleFinish} style={styles.skipBtn}>
            <Text style={styles.skipText}>Omitir</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}

        <Button
          label={current < slides.length - 1 ? 'Siguiente' : '¡Comenzar!'}
          onPress={goNext}
          variant="primary"
          size="lg"
          style={{ flex: 1, marginLeft: Theme.spacing.md }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  iconWrap: {
    width: 160,
    height: 160,
    borderRadius: Theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: Theme.typography.fontSize.xxl,
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  description: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Theme.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Theme.colors.primary,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: 40,
    paddingTop: Theme.spacing.sm,
  },
  skipBtn: {
    paddingHorizontal: Theme.spacing.sm,
    justifyContent: 'center',
    height: 48,
  },
  skipText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.textLight,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});

export default OnboardingScreen;
