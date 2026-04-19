import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Item, Theme } from '../types';

interface Props {
  item: Item;
  theme: Theme;
  onUpdateQty: (id: number, qty: number) => void;
  onPress: () => void;
}

export function ItemCard({ item, theme: t, onUpdateQty, onPress }: Props) {
  const isOut = item.quantity === 0;
  const isLow = !isOut && item.quantity < item.minThreshold;
  const statusColor = isOut ? t.danger : isLow ? t.warn : t.accent;
  const pct = item.minThreshold > 0 ? Math.min(item.quantity / item.minThreshold, 1) : 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, {
        backgroundColor: t.card,
        borderColor: isOut ? t.danger + '30' : isLow ? t.warn + '30' : t.border,
      }]}
      activeOpacity={0.7}
    >
      <View style={styles.nameRow}>
        <Text style={[styles.name, { color: t.text }]} numberOfLines={2}>{item.name}</Text>
        {(isLow || isOut) && (
          <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{isOut ? 'OUT' : 'LOW'}</Text>
          </View>
        )}
      </View>

      <View style={styles.qtyRow}>
        <Text style={[styles.qty, { color: isOut ? t.danger : isLow ? t.warn : t.text }]}>
          {item.quantity}
        </Text>
        <Text style={[styles.unit, { color: t.textSec }]}>{item.unit}</Text>
      </View>

      <View style={[styles.barBg, { backgroundColor: t.border }]}>
        <View style={[styles.barFill, { width: `${pct * 100}%` as any, backgroundColor: statusColor }]} />
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity
          onPress={() => { if (item.quantity > 0) onUpdateQty(item.id, +(item.quantity - 0.5).toFixed(1)); }}
          style={[styles.btn, { backgroundColor: t.bg, borderColor: t.border, opacity: item.quantity === 0 ? 0.35 : 1 }]}
          disabled={item.quantity === 0}
        >
          <Text style={[styles.btnText, { color: t.danger }]}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onUpdateQty(item.id, +(item.quantity + 0.5).toFixed(1))}
          style={[styles.btn, { backgroundColor: t.accentLight, borderColor: 'transparent' }]}
        >
          <Text style={[styles.btnText, { color: t.accent }]}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 12, borderWidth: 1, gap: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 },
  name: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 18 },
  badge: { borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  qtyRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  qty: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  unit: { fontSize: 12, fontWeight: '500' },
  barBg: { height: 3, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 3, borderRadius: 2 },
  btnRow: { flexDirection: 'row', gap: 6 },
  btn: { flex: 1, height: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 20, lineHeight: 24 },
});
