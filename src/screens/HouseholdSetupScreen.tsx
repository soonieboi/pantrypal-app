import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import {
  doc, setDoc, updateDoc, arrayUnion,
  collection, getDocs, query, where,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { THEMES } from '../theme';
import { MEMBER_PALETTE } from '../data';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function randomColor() {
  return MEMBER_PALETTE[Math.floor(Math.random() * MEMBER_PALETTE.length)];
}

export function HouseholdSetupScreen() {
  const t = THEMES.sage;
  const user = auth.currentUser!;
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createHousehold = async () => {
    setLoading(true);
    setError('');
    try {
      const householdId = doc(collection(db, 'households')).id;
      const inviteCode = generateCode();
      const member = {
        id: user.uid,
        name: user.displayName || 'You',
        email: user.email || '',
        color: randomColor(),
        joinedAt: Date.now(),
      };

      // Write household doc
      await setDoc(doc(db, 'households', householdId), {
        inviteCode,
        createdAt: Date.now(),
        members: [member],
        locations: [],
        locIcons: {},
        theme: 'sage',
      });

      // Write user profile
      await setDoc(doc(db, 'users', user.uid), {
        householdId,
        name: member.name,
        email: member.email,
        color: member.color,
      });

    } catch (e: any) {
      console.error(e);
      setError('Could not create household: ' + e.message);
    }
    setLoading(false);
  };

  const joinHousehold = async () => {
    if (code.trim().length < 4) return;
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'households'), where('inviteCode', '==', code.trim().toUpperCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        setError('No household found with that code. Check it and try again.');
        setLoading(false);
        return;
      }

      const householdId = snap.docs[0].id;
      const member = {
        id: user.uid,
        name: user.displayName || 'You',
        email: user.email || '',
        color: randomColor(),
        joinedAt: Date.now(),
      };

      await updateDoc(doc(db, 'households', householdId), {
        members: arrayUnion(member),
      });

      await setDoc(doc(db, 'users', user.uid), {
        householdId,
        name: member.name,
        email: member.email,
        color: member.color,
      });

    } catch (e: any) {
      console.error(e);
      setError('Could not join household: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={styles.inner}>
        <Text style={styles.emoji}>🏠</Text>
        <Text style={[styles.title, { color: t.text }]}>Set up your household</Text>
        <Text style={[styles.subtitle, { color: t.textSec }]}>
          Create a new household or join one with an invite code.
        </Text>

        <View style={[styles.tabs, { backgroundColor: t.card, borderColor: t.border }]}>
          {(['create', 'join'] as const).map(tabId => (
            <TouchableOpacity
              key={tabId}
              onPress={() => setTab(tabId)}
              style={[styles.tab, tab === tabId && { backgroundColor: t.accent }]}
            >
              <Text style={[styles.tabText, { color: tab === tabId ? '#fff' : t.textSec }]}>
                {tabId === 'create' ? 'Create new' : 'Join existing'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'create' ? (
          <View style={styles.section}>
            <Text style={[styles.hint, { color: t.textSec }]}>
              We'll create a household and give you an invite code to share with your partner.
            </Text>
            <TouchableOpacity
              onPress={createHousehold}
              disabled={loading}
              style={[styles.btn, { backgroundColor: t.accent }]}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Create Household</Text>
              }
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.hint, { color: t.textSec }]}>
              Ask your household member for their 6-character invite code.
            </Text>
            <TextInput
              value={code}
              onChangeText={v => setCode(v.toUpperCase())}
              placeholder="e.g. A3B9KX"
              placeholderTextColor={t.textSec}
              autoCapitalize="characters"
              maxLength={6}
              style={[styles.codeInput, { backgroundColor: t.card, borderColor: t.border, color: t.text }]}
            />
            <TouchableOpacity
              onPress={joinHousehold}
              disabled={loading || code.trim().length < 4}
              style={[styles.btn, { backgroundColor: code.trim().length >= 4 ? t.accent : t.border }]}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Join Household</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {!!error && <Text style={[styles.error, { color: t.danger }]}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: '100vh' as any },
  inner: { flex: 1, padding: 24, justifyContent: 'center', maxWidth: 480, alignSelf: 'center', width: '100%' },
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  tabs: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 4, marginBottom: 28 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '600' },
  section: { gap: 16 },
  hint: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  btn: { borderRadius: 14, padding: 15, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  codeInput: {
    borderWidth: 1, borderRadius: 12, padding: 14,
    fontSize: 24, fontWeight: '700', textAlign: 'center', letterSpacing: 6,
  },
  error: { marginTop: 16, fontSize: 13, textAlign: 'center' },
});
