import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Theme } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: any) => void;
  theme: Theme;
  locations: string[];
  locIcons: Record<string, string>;
  defaultMember: string;
}

const DEFAULT_FORM = { name: '', location: 'Pantry', category: '', unit: '', quantity: 1, minThreshold: 2 };

export function AddItemSheet({ visible, onClose, onAdd, theme: t, locations, locIcons, defaultMember }: Props) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const upd = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) return;
    onAdd({ ...form, addedBy: defaultMember });
    setForm(DEFAULT_FORM);
    onClose();
  };

  const inputStyle = [styles.input, { backgroundColor: t.inputBg, borderColor: t.border, color: t.text }];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
          <TouchableOpacity activeOpacity={1} style={[styles.sheet, { backgroundColor: t.bg }]}>
            <View style={[styles.handle, { backgroundColor: t.border }]} />

            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: t.text }]}>Add Item</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={[styles.closeBtn, { color: t.textSec }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={[styles.label, { color: t.textSec }]}>ITEM NAME</Text>
              <TextInput
                value={form.name}
                onChangeText={v => upd('name', v)}
                placeholder="e.g. Olive Oil"
                placeholderTextColor={t.textSec}
                autoCapitalize="words"
                style={inputStyle}
              />

              <Text style={[styles.label, { color: t.textSec }]}>UNIT</Text>
              <TextInput
                value={form.unit}
                onChangeText={v => upd('unit', v)}
                placeholder="bag, bottle, can…"
                placeholderTextColor={t.textSec}
                style={[inputStyle, { marginBottom: 16 }]}
              />

              <Text style={[styles.label, { color: t.textSec }]}>CATEGORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {locations.map(l => (
                    <TouchableOpacity
                      key={l}
                      onPress={() => upd('location', l)}
                      style={[styles.pill, {
                        backgroundColor: form.location === l ? t.accent : t.card,
                        borderColor: form.location === l ? t.accent : t.border,
                      }]}
                    >
                      <Text>{locIcons[l] || '📦'}</Text>
                      <Text style={{ fontSize: 13, fontWeight: form.location === l ? '600' : '400', color: form.location === l ? '#fff' : t.textSec }}>
                        {l}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.stepperRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: t.textSec }]}>CURRENT QTY</Text>
                  <View style={styles.stepper}>
                    <TouchableOpacity onPress={() => upd('quantity', Math.max(0, form.quantity - 1))} style={[styles.stepBtn, { borderColor: t.border, backgroundColor: t.card }]}>
                      <Text style={[styles.stepBtnText, { color: t.text }]}>−</Text>
                    </TouchableOpacity>
                    <Text style={[styles.stepValue, { color: t.text }]}>{form.quantity}</Text>
                    <TouchableOpacity onPress={() => upd('quantity', form.quantity + 1)} style={[styles.stepBtn, { borderColor: t.border, backgroundColor: t.card }]}>
                      <Text style={[styles.stepBtnText, { color: t.text }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: t.textSec }]}>MIN THRESHOLD</Text>
                  <View style={styles.stepper}>
                    <TouchableOpacity onPress={() => upd('minThreshold', Math.max(0.5, +(form.minThreshold - 0.5).toFixed(1)))} style={[styles.stepBtn, { borderColor: t.border, backgroundColor: t.card }]}>
                      <Text style={[styles.stepBtnText, { color: t.text }]}>−</Text>
                    </TouchableOpacity>
                    <Text style={[styles.stepValue, { color: t.text }]}>{form.minThreshold}</Text>
                    <TouchableOpacity onPress={() => upd('minThreshold', +(form.minThreshold + 0.5).toFixed(1))} style={[styles.stepBtn, { borderColor: t.border, backgroundColor: t.card }]}>
                      <Text style={[styles.stepBtnText, { color: t.text }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={submit}
                style={[styles.submitBtn, { backgroundColor: form.name.trim() ? t.accent : t.border }]}
                disabled={!form.name.trim()}
              >
                <Text style={styles.submitText}>Add to Inventory</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  kav: { justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 40, maxHeight: '85%' },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '700' },
  closeBtn: { fontSize: 18, padding: 4 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 7 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 16 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5 },
  stepperRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 20 },
  stepValue: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '700' },
  submitBtn: { borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
