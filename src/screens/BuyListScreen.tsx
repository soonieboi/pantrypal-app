import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useApp } from '../AppContext';
import { AppHeader } from '../components/AppHeader';
import { groupBy, pluralize } from '../data';

export function BuyListScreen() {
  const { theme: t, items, boughtItem, locations, locIcons } = useApp();
  const needItems = items.filter(i => i.quantity < i.minThreshold);

  const [buyQty, setBuyQty] = useState<Record<number, number>>(() =>
    needItems.reduce((acc, i) => ({ ...acc, [i.id]: Math.max(1, Math.round(i.minThreshold - i.quantity)) }), {})
  );
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setBuyQty(prev => {
      const next = { ...prev };
      needItems.forEach(i => {
        if (next[i.id] === undefined) next[i.id] = Math.max(1, Math.round(i.minThreshold - i.quantity));
      });
      return next;
    });
  }, [items]);

  const toggle = (id: number) => setChecked(p => ({ ...p, [id]: !p[id] }));
  const adjustQty = (id: number, delta: number) => setBuyQty(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));
  const checkedCount = Object.values(checked).filter(Boolean).length;

  const markBought = () => {
    Object.entries(checked).forEach(([id, v]) => {
      if (v) boughtItem(Number(id), buyQty[Number(id)] || 1);
    });
    setChecked({});
  };

  const grouped = groupBy(needItems, 'location');
  const sortedLocs = Object.keys(grouped).sort((a, b) => locations.indexOf(a) - locations.indexOf(b));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <AppHeader
        theme={t}
        title="Buy List"
        subtitle={needItems.length === 0 ? 'All stocked up!' : `${needItems.length} items below threshold`}
        right={checkedCount > 0
          ? <TouchableOpacity onPress={markBought} style={[styles.boughtBtn, { backgroundColor: t.accent }]}>
              <Text style={styles.boughtBtnText}>Bought</Text>
            </TouchableOpacity>
          : undefined
        }
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {needItems.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 52, marginBottom: 16 }}>🎉</Text>
            <Text style={[styles.emptyTitle, { color: t.text }]}>All stocked up!</Text>
            <Text style={[styles.emptySubtitle, { color: t.textSec }]}>Everything is above its minimum threshold</Text>
          </View>
        ) : sortedLocs.map(loc => (
          <View key={loc} style={{ marginBottom: 20 }}>
            <View style={styles.locHeader}>
              <Text style={{ fontSize: 15 }}>{locIcons[loc] || loc[0]}</Text>
              <Text style={[styles.locLabel, { color: t.textSec }]}>{loc.toUpperCase()}</Text>
            </View>
            {grouped[loc].map(item => {
              const isChecked = !!checked[item.id];
              const qty = buyQty[item.id] || 1;
              const willReach = +(item.quantity + qty).toFixed(1);
              const isOut = item.quantity === 0;

              return (
                <View
                  key={item.id}
                  style={[styles.itemCard, { backgroundColor: t.card, borderColor: isChecked ? t.accent + '40' : t.border, opacity: isChecked ? 0.55 : 1 }]}
                >
                  <TouchableOpacity style={styles.itemRow} onPress={() => toggle(item.id)} activeOpacity={0.7}>
                    <View style={[styles.checkbox, { borderColor: isChecked ? t.accent : t.border, backgroundColor: isChecked ? t.accent : 'transparent' }]}>
                      {isChecked && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemName, { color: t.text, textDecorationLine: isChecked ? 'line-through' : 'none' }]}>{item.name}</Text>
                      <Text style={[styles.itemDetail, { color: t.textSec }]}>
                        Have {item.quantity} {pluralize(item.quantity, item.unit)} · Min {item.minThreshold}
                      </Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: isOut ? t.danger : t.warn }]}>
                      <Text style={styles.statusPillText}>{isOut ? 'Out' : 'Low'}</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={[styles.stepperRow, { backgroundColor: t.bg }]}>
                    <Text style={[styles.buyingLabel, { color: t.textSec }]}>Buying</Text>
                    <TouchableOpacity onPress={() => adjustQty(item.id, -1)} style={[styles.stepBtn, { borderColor: t.border, backgroundColor: t.card, borderWidth: 1 }]}>
                      <Text style={[styles.stepBtnText, { color: t.text }]}>−</Text>
                    </TouchableOpacity>
                    <Text style={[styles.stepValue, { color: t.text }]}>{qty}</Text>
                    <TouchableOpacity onPress={() => adjustQty(item.id, 1)} style={[styles.stepBtn, { backgroundColor: t.accentLight }]}>
                      <Text style={[styles.stepBtnText, { color: t.accent }]}>+</Text>
                    </TouchableOpacity>
                    <Text style={[styles.stepUnit, { color: t.textSec }]}>{item.unit}</Text>
                  </View>

                  <Text style={[styles.afterBuying, { color: t.textSec }]}>
                    Stock after buying:{' '}
                    <Text style={{ fontWeight: '600', color: willReach >= item.minThreshold ? t.accent : t.warn }}>
                      {willReach} {pluralize(willReach, item.unit)}
                    </Text>
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  boughtBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  boughtBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, marginTop: 6, textAlign: 'center' },
  locHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  locLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  itemCard: { borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 15, fontWeight: '600' },
  itemDetail: { fontSize: 12, marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusPillText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 8 },
  buyingLabel: { fontSize: 12, flex: 1 },
  stepBtn: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 16 },
  stepValue: { fontSize: 16, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  stepUnit: { fontSize: 12 },
  afterBuying: { fontSize: 11, marginTop: 6, paddingLeft: 2 },
});
