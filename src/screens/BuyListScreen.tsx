import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Modal, Alert } from 'react-native';
import { useApp } from '../AppContext';
import { AppHeader } from '../components/AppHeader';
import { AddItemSheet } from '../components/AddItemSheet';
import { groupBy, pluralize } from '../data';

export function BuyListScreen() {
  const { theme: t, items, boughtItem, addItem, locations, locIcons, members } = useApp();
  const needItems = items.filter(i => i.quantity < i.minThreshold);

  const [buyQty, setBuyQty] = useState<Record<number, number>>(() =>
    needItems.reduce((acc, i) => ({ ...acc, [i.id]: Math.max(1, Math.round(i.minThreshold - i.quantity)) }), {})
  );
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [addVisible, setAddVisible] = useState(false);
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyMemberIds, setNotifyMemberIds] = useState<Set<number>>(new Set());
  const [notifyItemIds, setNotifyItemIds] = useState<Set<number>>(new Set(needItems.map(i => i.id)));
  const defaultMember = members[0]?.name ?? 'You';

  const openNotify = () => {
    setNotifyMemberIds(new Set());
    setNotifyItemIds(new Set(needItems.map(i => i.id)));
    setNotifyVisible(true);
  };

  const toggleNotifyMember = (id: number) =>
    setNotifyMemberIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const toggleNotifyItem = (id: number) =>
    setNotifyItemIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const sendNotification = () => {
    setNotifyVisible(false);
    Alert.alert('Notification queued', 'Email & in-app push notifications are coming in a future update.');
  };

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
      <View style={styles.inner}>
      <AppHeader
        theme={t}
        title="Buy List"
        subtitle={needItems.length === 0 ? 'All stocked up!' : `${needItems.length} items below threshold`}
        right={
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {checkedCount > 0 && (
              <TouchableOpacity onPress={markBought} style={[styles.boughtBtn, { backgroundColor: t.accent }]}>
                <Text style={styles.boughtBtnText}>Bought</Text>
              </TouchableOpacity>
            )}
            {needItems.length > 0 && (
              <TouchableOpacity onPress={openNotify} style={[styles.notifyBtn, { borderColor: t.accent }]}>
                <Text style={[styles.notifyBtnText, { color: t.accent }]}>🔔 Notify</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setAddVisible(true)} style={[styles.addBtn, { backgroundColor: t.accent }]}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
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
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <AddItemSheet
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onAdd={addItem}
        theme={t}
        locations={locations}
        locIcons={locIcons}
        defaultMember={defaultMember}
      />

      {/* Notify member modal */}
      <Modal visible={notifyVisible} transparent animationType="slide" onRequestClose={() => setNotifyVisible(false)}>
        <View style={styles.notifyOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setNotifyVisible(false)} />
          <View style={[styles.notifySheet, { backgroundColor: t.bg }]}>
            <View style={[styles.handle, { backgroundColor: t.border }]} />
            <Text style={[styles.notifyTitle, { color: t.text }]}>Notify Member</Text>
            <Text style={[styles.notifySubtitle, { color: t.textSec }]}>Select who to notify and which items to include</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <Text style={[styles.notifySectionLabel, { color: t.textSec }]}>MEMBERS</Text>
              {members.length === 0 ? (
                <Text style={[styles.notifyEmpty, { color: t.textSec }]}>No other members in this household</Text>
              ) : members.map(m => (
                <TouchableOpacity key={m.id} style={[styles.notifyRow, { borderColor: t.border }]} onPress={() => toggleNotifyMember(m.id)}>
                  <View style={[styles.notifyCheck, { borderColor: notifyMemberIds.has(m.id) ? t.accent : t.border, backgroundColor: notifyMemberIds.has(m.id) ? t.accent : 'transparent' }]}>
                    {notifyMemberIds.has(m.id) && <Text style={{ color: '#fff', fontSize: 11 }}>✓</Text>}
                  </View>
                  <View style={[styles.notifyAvatar, { backgroundColor: m.color }]}>
                    <Text style={styles.notifyAvatarText}>{m.name[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notifyName, { color: t.text }]}>{m.name}</Text>
                    {!!m.email && <Text style={[styles.notifyEmail, { color: t.textSec }]}>{m.email}</Text>}
                  </View>
                </TouchableOpacity>
              ))}

              <Text style={[styles.notifySectionLabel, { color: t.textSec, marginTop: 16 }]}>ITEMS TO BUY</Text>
              {needItems.map(item => (
                <TouchableOpacity key={item.id} style={[styles.notifyRow, { borderColor: t.border }]} onPress={() => toggleNotifyItem(item.id)}>
                  <View style={[styles.notifyCheck, { borderColor: notifyItemIds.has(item.id) ? t.accent : t.border, backgroundColor: notifyItemIds.has(item.id) ? t.accent : 'transparent' }]}>
                    {notifyItemIds.has(item.id) && <Text style={{ color: '#fff', fontSize: 11 }}>✓</Text>}
                  </View>
                  <Text style={[styles.notifyName, { color: t.text, flex: 1 }]}>{item.name}</Text>
                  <Text style={[styles.notifyEmail, { color: t.textSec }]}>
                    {locIcons[item.location] || '📦'} {item.location}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.notifyFooter, { color: t.textSec }]}>
                📧 Email · 📱 App push (coming soon)
              </Text>
            </ScrollView>

            <TouchableOpacity
              onPress={sendNotification}
              disabled={notifyMemberIds.size === 0 || notifyItemIds.size === 0}
              style={[styles.notifySendBtn, { backgroundColor: notifyMemberIds.size > 0 && notifyItemIds.size > 0 ? t.accent : t.border }]}
            >
              <Text style={styles.notifySendBtnText}>
                Send Notification{notifyMemberIds.size > 0 ? ` to ${notifyMemberIds.size} member${notifyMemberIds.size > 1 ? 's' : ''}` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, maxWidth: 680, width: '100%', alignSelf: 'center' },
  addBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 22, lineHeight: 26 },
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
  notifyBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5 },
  notifyBtnText: { fontSize: 12, fontWeight: '600' },
  notifyOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  notifySheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 36, maxHeight: '80%' },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16, backgroundColor: '#ccc' },
  notifyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  notifySubtitle: { fontSize: 13, marginBottom: 16 },
  notifySectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  notifyEmpty: { fontSize: 13, marginBottom: 12 },
  notifyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  notifyCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  notifyAvatar: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  notifyAvatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  notifyName: { fontSize: 14, fontWeight: '600' },
  notifyEmail: { fontSize: 12, marginTop: 1 },
  notifyFooter: { fontSize: 11, textAlign: 'center', marginTop: 16, marginBottom: 8 },
  notifySendBtn: { borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 12 },
  notifySendBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
