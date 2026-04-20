import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Item, Theme } from '../types';
import { timeAgo } from '../data';

interface Props {
  item: Item | null;
  visible: boolean;
  onClose: () => void;
  onUpdateQty: (id: number, qty: number) => void;
  onUpdateThreshold: (id: number, threshold: number) => void;
  onUpdateItem: (id: number, updates: Partial<Omit<Item, 'id' | 'updatedAt'>>) => void;
  onDelete: (id: number) => void;
  theme: Theme;
  locIcons: Record<string, string>;
  locations: string[];
}

export function ItemDetailSheet({ item, visible, onClose, onUpdateQty, onUpdateThreshold, onUpdateItem, onDelete, theme: t, locIcons, locations }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', unit: '', location: '', category: '' });

  useEffect(() => {
    if (item) {
      setEditForm({ name: item.name, unit: item.unit, location: item.location, category: item.category });
      setIsEditing(false);
    }
  }, [item?.id]);

  if (!item) return null;

  const isOut = item.quantity === 0;
  const isLow = !isOut && item.quantity < item.minThreshold;
  const statusColor = isOut ? t.danger : isLow ? t.warn : t.accent;
  const pct = item.minThreshold > 0 ? Math.min(item.quantity / item.minThreshold, 1) : 1;

  const upd = (k: string, v: string) => setEditForm(p => ({ ...p, [k]: v }));

  const saveEdit = () => {
    if (!editForm.name.trim()) return;
    onUpdateItem(item.id, editForm);
    setIsEditing(false);
  };

  const inputStyle = [styles.input, { backgroundColor: t.inputBg, borderColor: t.border, color: t.text }];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
          <TouchableOpacity activeOpacity={1} style={[styles.sheet, { backgroundColor: t.bg }]}>
            <View style={[styles.handle, { backgroundColor: t.border }]} />

            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: t.text }]}>{item.name}</Text>
                <Text style={[styles.location, { color: t.textSec }]}>{locIcons[item.location] || '📦'} {item.location}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditing(e => !e)}
                style={[styles.editBtn, { backgroundColor: isEditing ? t.accent + '20' : t.card, borderColor: isEditing ? t.accent : t.border }]}
              >
                <Text style={[styles.editBtnText, { color: isEditing ? t.accent : t.textSec }]}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={{ marginLeft: 8 }}>
                <Text style={[styles.closeBtn, { color: t.textSec }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {isEditing ? (
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={[styles.label, { color: t.textSec }]}>ITEM NAME</Text>
                <TextInput
                  value={editForm.name}
                  onChangeText={v => upd('name', v)}
                  placeholder="e.g. Olive Oil"
                  placeholderTextColor={t.textSec}
                  style={inputStyle}
                />

                <Text style={[styles.label, { color: t.textSec }]}>UNIT</Text>
                <TextInput
                  value={editForm.unit}
                  onChangeText={v => upd('unit', v)}
                  placeholder="bag, bottle, can…"
                  placeholderTextColor={t.textSec}
                  style={[inputStyle, { marginBottom: 16 }]}
                />

                <Text style={[styles.label, { color: t.textSec }]}>CATEGORY</Text>
                <TextInput
                  value={editForm.category}
                  onChangeText={v => upd('category', v)}
                  placeholder="e.g. Oils, Grains…"
                  placeholderTextColor={t.textSec}
                  style={[inputStyle, { marginBottom: 16 }]}
                />

                <Text style={[styles.label, { color: t.textSec }]}>LOCATION</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {locations.map(l => (
                      <TouchableOpacity
                        key={l}
                        onPress={() => upd('location', l)}
                        style={[styles.pill, {
                          backgroundColor: editForm.location === l ? t.accent : t.card,
                          borderColor: editForm.location === l ? t.accent : t.border,
                        }]}
                      >
                        <Text>{locIcons[l] || '📦'}</Text>
                        <Text style={{ fontSize: 13, fontWeight: editForm.location === l ? '600' : '400', color: editForm.location === l ? '#fff' : t.textSec }}>
                          {l}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  onPress={saveEdit}
                  style={[styles.saveBtn, { backgroundColor: editForm.name.trim() ? t.accent : t.border }]}
                  disabled={!editForm.name.trim()}
                >
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <>
                {(isLow || isOut) && (
                  <View style={[styles.statusBanner, { backgroundColor: statusColor + '14', borderColor: statusColor + '28' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {isOut ? '⚠️ Out of stock' : '📉 Running low'} — on your buy list
                    </Text>
                  </View>
                )}

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
              </>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  kav: { justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 40, maxHeight: '90%' },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 8 },
  itemName: { fontSize: 22, fontWeight: '700' },
  location: { fontSize: 13, marginTop: 3 },
  editBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start' },
  editBtnText: { fontSize: 13, fontWeight: '600' },
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
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 7 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 16 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5 },
  saveBtn: { borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 4, marginBottom: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
