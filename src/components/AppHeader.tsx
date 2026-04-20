import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../types';

interface Props {
  theme: Theme;
  title: string;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}

export function AppHeader({ theme: t, title, subtitle, right }: Props) {
  return (
    <View style={[styles.header, { borderBottomColor: t.border }]}>
      <View style={{ flex: 1 }}>
        <View style={styles.brandRow}>
          <Text style={styles.brandIcon}>🫙</Text>
          <Text style={[styles.brandLabel, { color: t.accent }]}>PantryPal</Text>
        </View>
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
        {subtitle != null && (
          <Text style={[styles.subtitle, { color: t.textSec }]}>{subtitle}</Text>
        )}
      </View>
      {right != null && <View style={styles.right}>{right}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  brandIcon: { fontSize: 12 },
  brandLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, lineHeight: 34 },
  subtitle: { fontSize: 13, marginTop: 3 },
  right: { paddingBottom: 2 },
});
