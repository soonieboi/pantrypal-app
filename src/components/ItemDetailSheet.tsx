import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Item, Theme } from '../types';
import { timeAgo } from '../data';

interface Props {
  item: Item | null;
  visible: boolean;
  onClose: () => void;
  onUpdateQty: (id: number, qty: number) => void;
  onUpdateThreshold: (id: number, threshold: number) => void;
  onDelete: (id: number) => void;
  theme: Theme;
  locIcons: Record<string, string>;
}

export function ItemDetailSheet({ item, visible, onClose, onUpdateQty, onUpdateThreshold, onDelete, theme: t, locIcons }: Props) {
  if (!item) return null;

  const isOut = item.quantity === 0;
  const isLow = !isOut && item.quantity < item.minThreshold;
  const statusColor = isOut ? t.danger : isLow ? t.warn : t.accent;
  const pct = item.minThreshold > 0 ? Math.min(item.quantity / item.minThreshold, 1) : 1;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[styles.sheet, { backgroundColor: t.bg }]}>
          <View style={[styles.handle, { backgroundColor: t.border }]} />

          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemName, { color: t.text }]}>{item.name}</Text>
              <Text style={[styles.location, { color: t.textSec }]}>{locIcons[item.location] || '📦'} {item.location}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeBtn, { color: t.textSec }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {(isLow || isOut) && (
            <View style={[styles.statusBanner, { backgroundColor: statusColor + '14', borderColor: statusColor + '28' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {isOut ? '⚠️ Out of stock' : '📉 Running low'} — on your buy list
              </Text>
            </View>
          )}

          {/* Qty Control */}
          <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={[styles.cardLabel, { color: t.textSec }]}>CURRENT STOCK</Text>
            <View style={styles.qtyControl}>
              <TouchableOpacity
                onPress={() => onUpdateQty(item.id, Math.max(0, +(item.quantity - 0.5).toFixed(1)))}
                style={[styles.controlBtn, { backgroundColor: t.bg, borderColor: t.border, borderWidth: 1 }]}
              >
                <Text style={[styles.controlBtnText, { color: t.text }]}>−</Text>
              </TouchableOpacity>
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.bigQty, { color: statusColor }]}>{item.quantity}</Text>
                <Text style={[styles.bigUnit, { color: t.textSec }]}>{item.unit}</Text>
              </View>
              <TouchableOpacity
                onPress={() => onUpdateQty(item.id, +(item.quantity + 0.5).toFixed(1))}
                style={[styles.controlBtn, { backgroundColor: t.accent }]}
              >
                <Text style={[styles.controlBtnText, { color: '#fff' }]}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.barBg, { backgroundColor: t.border }]}>
              <View style={[styles.barFill, { width: `${pct * 100}%` as any, backgroundColor: statusColor }]} />
            </View>
            <View style={styles.barLabels}>
              <Text style={[styles.barLabel, { color: t.textSec }]}>0</Text>
              <Text style={[styles.barLabel, { color: t.textSec }]}>Min: {item.minThreshold}</Text>
            </View>
          </View>

          {/* Threshold Control */}
          <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border, marginTop: 12 }]}>
            <Text style={[styles.cardLabel, { color: t.textSec }]}>MIN THRESHOLD</Text>
            <View style={styles.thresholdRow}>
              <TouchableOpacity
                onPress={() => onUpdateThreshold(item.id, Math.max(0.5, +(item.minThreshold - 0.5).toFixed(1)))}
                style={[styles.threshBtn, { borderColor: t.border, backgroundColor: t.bg, borderWidth: 1 }]}
              >
                <Text style={[styles.controlBtnText, { color: t.text }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.threshValue, { color: t.text }]}>{item.minThreshold} {item.unit}</Text>
              <TouchableOpacity
                onPress={() => onUpdateThreshold(item.id, +(item.minThreshold + 0.5).toFixed(1))}
                style={[styles.threshBtn, { backgroundColor: t.accent }]}
              >
                <Text style={[styles.controlBtnText, { color: '#fff' }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => { onDelete(item.id); onClose(); }}
            style={[styles.deleteBtn, { backgroundColor: t.danger + '14', borderColor: t.danger + '30' }]}
          >
            <Text style={[styles.deleteBtnText, { color: t.danger }]}>Remove Item</Text>
          </TouchableOpacity>

          <Text style={[styles.footer, { color: t.textSec }]}>
            Added by {item.addedBy} · {timeAgo(item.updatedAt)}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 40 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  itemName: { fontSize: 22, fontWeight: '700' },
  location: { fontSize: 13, marginTop: 3 },
  closeBtn: { fontSize: 18, padding: 4 },
  statusBanner: { borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1 },
  statusText: { fontSize: 13, fontWeight: '600' },
  card: { borderRadius: 16, padding: 18, borderWidth: 1 },
  cardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 14 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  controlBtn: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  controlBtnText: { fontSize: 24 },
  bigQty: { fontSize: 44, fontWeight: '800', lineHeight: 48 },
  bigUnit: { fontSize: 14, marginTop: 4 },
  barBg: { height: 5, borderRadius: 3, overflow: 'hidden', marginTop: 16 },
  barFill: { height: 5, borderRadius: 3 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  barLabel: { fontSize: 11 },
  thresholdRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  threshBtn: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  threshValue: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700' },
  deleteBtn: { marginTop: 12, padding: 13, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  deleteBtnText: { fontSize: 15, fontWeight: '600' },
  footer: { fontSize: 11, textAlign: 'center', marginTop: 10 },
});
