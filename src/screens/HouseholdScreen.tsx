import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Share, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useApp } from '../AppContext';
import { AppHeader } from '../components/AppHeader';
import { EMOJI_OPTIONS, MEMBER_PALETTE } from '../data';

export function HouseholdScreen() {
  const { theme: t, items, members, addMember, removeMember, locations, locIcons, addLocation, deleteLocation, inviteCode } = useApp();
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberColor, setMemberColor] = useState(MEMBER_PALETTE[0]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const inputStyle = [styles.input, { backgroundColor: t.inputBg, borderColor: t.border, color: t.text }];

  const handleAddMember = () => {
    if (!memberName.trim()) return;
    addMember({ name: memberName.trim(), email: memberEmail.trim(), color: memberColor });
    setMemberName(''); setMemberEmail(''); setMemberColor(MEMBER_PALETTE[0]);
    setShowAddMember(false);
  };

  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (!name || locations.includes(name)) return;
    addLocation(name, newCatIcon);
    setNewCatName(''); setNewCatIcon('📦'); setShowEmojiPicker(false);
  };

  const handleDeleteLoc = (loc: string) => {
    const count = items.filter(i => i.location === loc).length;
    if (count > 0) setConfirmDelete(loc);
    else deleteLocation(loc);
  };

  const stats = [
    { label: 'Total Items', value: items.length, warn: false },
    { label: 'Low or Out', value: items.filter(i => i.quantity < i.minThreshold).length, warn: true },
    { label: 'Categories', value: locations.length, warn: false },
    { label: 'Item types', value: new Set(items.map(i => i.name)).size, warn: false },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <AppHeader
        theme={t}
        title="Household"
        subtitle="Members, categories & stats"
        right={
          <TouchableOpacity onPress={() => { signOut(auth); }} style={[styles.signOutBtn, { borderColor: t.border }]}>
            <Text style={[styles.signOutText, { color: t.textSec }]}>Sign out</Text>
          </TouchableOpacity>
        }
      />

      {/* Invite code card */}
      {!!inviteCode && (
        <TouchableOpacity
          onPress={() => Share.share({ message: `Join my PantryPal household! Code: ${inviteCode}` })}
          style={[styles.inviteCard, { backgroundColor: t.accentLight, borderColor: t.accent + '40' }]}
          activeOpacity={0.8}
        >
          <View>
            <Text style={[styles.inviteLabel, { color: t.accent }]}>INVITE CODE — tap to share</Text>
            <Text style={[styles.inviteCode, { color: t.accent }]}>{inviteCode}</Text>
          </View>
          <Text style={{ fontSize: 20 }}>🔗</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>

        {/* Members */}
        <Text style={[styles.sectionLabel, { color: t.textSec }]}>MEMBERS</Text>
        <View style={[styles.card, { borderColor: t.border }]}>
          {members.map((m, i) => (
            <View key={m.id} style={[styles.memberRow, { borderBottomColor: t.border, borderBottomWidth: i < members.length - 1 ? 1 : 0 }]}>
              <View style={[styles.avatar, { backgroundColor: m.color }]}>
                <Text style={styles.avatarText}>{m.name[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.memberName, { color: t.text }]}>{m.name}</Text>
                {!!m.email && <Text style={[styles.memberEmail, { color: t.textSec }]}>{m.email}</Text>}
              </View>
              <Text style={[styles.memberItems, { color: t.textSec }]}>{items.filter(it => it.addedBy === m.name).length} items</Text>
              <TouchableOpacity onPress={() => removeMember(m.id)} style={[styles.removeBtn, { borderColor: t.border }]}>
                <Text style={[styles.removeBtnText, { color: t.danger }]}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {!showAddMember ? (
          <TouchableOpacity onPress={() => setShowAddMember(true)} style={[styles.dashedBtn, { borderColor: t.border }]}>
            <Text style={[styles.dashedBtnText, { color: t.textSec }]}>+ Add member</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.card, { borderColor: t.border, padding: 16, marginTop: 8 }]}>
            <Text style={[styles.cardTitle, { color: t.text }]}>Add Member</Text>
            <TextInput value={memberName} onChangeText={setMemberName} placeholder="Name" placeholderTextColor={t.textSec} style={[inputStyle, { marginBottom: 8 }]} />
            <TextInput value={memberEmail} onChangeText={setMemberEmail} placeholder="Email (optional)" placeholderTextColor={t.textSec} style={[inputStyle, { marginBottom: 12 }]} />
            <Text style={[styles.colorLabel, { color: t.textSec }]}>COLOUR</Text>
            <View style={styles.colorRow}>
              {MEMBER_PALETTE.map(c => (
                <TouchableOpacity key={c} onPress={() => setMemberColor(c)} style={[styles.colorDot, { backgroundColor: c, borderWidth: memberColor === c ? 3 : 3, borderColor: memberColor === c ? t.text : 'transparent' }]} />
              ))}
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => setShowAddMember(false)} style={[styles.cancelBtn, { borderColor: t.border }]}>
                <Text style={[styles.cancelBtnText, { color: t.textSec }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddMember} style={[styles.confirmBtn, { backgroundColor: memberName.trim() ? t.accent : t.border }]}>
                <Text style={styles.confirmBtnText}>Add Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Categories */}
        <Text style={[styles.sectionLabel, { color: t.textSec, marginTop: 24 }]}>CATEGORIES</Text>
        <View style={[styles.card, { borderColor: t.border }]}>
          {locations.map((loc, i) => {
            const count = items.filter(it => it.location === loc).length;
            return (
              <View key={loc} style={[styles.catRow, { borderBottomColor: t.border, borderBottomWidth: i < locations.length - 1 ? 1 : 0 }]}>
                {confirmDelete === loc ? (
                  <View style={styles.confirmRow}>
                    <Text style={[styles.confirmText, { color: t.danger, flex: 1 }]}>Remove {count} item{count !== 1 ? 's' : ''} too?</Text>
                    <TouchableOpacity onPress={() => { deleteLocation(loc, true); setConfirmDelete(null); }} style={[styles.deleteAllBtn, { backgroundColor: t.danger }]}>
                      <Text style={styles.deleteAllText}>Delete all</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setConfirmDelete(null)} style={[styles.cancelSmallBtn, { borderColor: t.border }]}>
                      <Text style={[styles.cancelSmallText, { color: t.textSec }]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={{ fontSize: 20 }}>{locIcons[loc] || loc[0]}</Text>
                    <Text style={[styles.catName, { color: t.text, flex: 1 }]}>{loc}</Text>
                    <Text style={[styles.catCount, { color: t.textSec }]}>{count} item{count !== 1 ? 's' : ''}</Text>
                    <TouchableOpacity onPress={() => handleDeleteLoc(loc)} style={[styles.removeBtn, { borderColor: t.border }]}>
                      <Text style={[styles.removeBtnText, { color: t.danger }]}>✕</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            );
          })}
        </View>

        <View style={[styles.card, { borderColor: t.border, padding: 14, marginTop: 8 }]}>
          <Text style={[styles.colorLabel, { color: t.textSec, marginBottom: 10 }]}>ADD CATEGORY</Text>
          <View style={styles.catAddRow}>
            <TouchableOpacity onPress={() => setShowEmojiPicker(p => !p)} style={[styles.emojiBtn, { borderColor: t.border, backgroundColor: t.bg }]}>
              <Text style={{ fontSize: 22 }}>{newCatIcon}</Text>
            </TouchableOpacity>
            <TextInput
              value={newCatName}
              onChangeText={setNewCatName}
              onSubmitEditing={handleAddCategory}
              placeholder="Category name…"
              placeholderTextColor={t.textSec}
              style={[styles.catInput, { backgroundColor: t.inputBg, borderColor: t.border, color: t.text }]}
            />
            <TouchableOpacity onPress={handleAddCategory} style={[styles.catAddBtn, { backgroundColor: newCatName.trim() ? t.accent : t.border }]}>
              <Text style={{ color: '#fff', fontSize: 22, lineHeight: 26 }}>+</Text>
            </TouchableOpacity>
          </View>
          {showEmojiPicker && (
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map(e => (
                <TouchableOpacity key={e} onPress={() => { setNewCatIcon(e); setShowEmojiPicker(false); }} style={[styles.emojiTile, { borderColor: newCatIcon === e ? t.accent : t.border, backgroundColor: newCatIcon === e ? t.accentLight : 'transparent' }]}>
                  <Text style={{ fontSize: 18 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Stats */}
        <Text style={[styles.sectionLabel, { color: t.textSec, marginTop: 24 }]}>STATS</Text>
        <View style={styles.statsGrid}>
          {stats.map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: t.card, borderColor: s.warn && s.value > 0 ? t.warn + '30' : t.border }]}>
              <Text style={[styles.statValue, { color: s.warn && s.value > 0 ? t.warn : t.accent }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: t.textSec }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  signOutBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, marginTop: 6 },
  signOutText: { fontSize: 13 },
  inviteCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 16, borderRadius: 14, borderWidth: 1, padding: 16 },
  inviteLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  inviteCode: { fontSize: 28, fontWeight: '800', letterSpacing: 6 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', backgroundColor: '#fff' },
  memberRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  memberName: { fontSize: 15, fontWeight: '600' },
  memberEmail: { fontSize: 12, marginTop: 1 },
  memberItems: { fontSize: 11 },
  removeBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontSize: 14 },
  dashedBtn: { marginTop: 8, padding: 13, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center' },
  dashedBtnText: { fontSize: 14 },
  cardTitle: { fontSize: 13, fontWeight: '700', marginBottom: 14 },
  colorLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },
  colorRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  actionRow: { flexDirection: 'row', gap: 8 },
  cancelBtn: { flex: 1, padding: 11, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cancelBtnText: { fontSize: 14 },
  confirmBtn: { flex: 2, padding: 11, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  catRow: { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 12 },
  catName: { fontSize: 15, fontWeight: '500' },
  catCount: { fontSize: 12 },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  confirmText: { fontSize: 13 },
  deleteAllBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  deleteAllText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  cancelSmallBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  cancelSmallText: { fontSize: 12 },
  catAddRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  emojiBtn: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  catInput: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 15 },
  catAddBtn: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  emojiTile: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', borderRadius: 14, padding: 14, borderWidth: 1 },
  statValue: { fontSize: 26, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 2 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 15 },
});
