import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { THEMES } from '../theme';

export function AuthScreen() {
  const t = THEMES.sage;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      setError('Sign in failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={styles.inner}>
        <Text style={styles.logo}>🥫</Text>
        <Text style={[styles.title, { color: t.text }]}>PantryPal</Text>
        <Text style={[styles.subtitle, { color: t.textSec }]}>
          Household inventory, together.
        </Text>

        <TouchableOpacity
          onPress={signIn}
          disabled={loading}
          style={[styles.googleBtn, { borderColor: t.border, backgroundColor: t.card }]}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color={t.accent} />
            : <>
                <Text style={styles.googleG}>G</Text>
                <Text style={[styles.googleBtnText, { color: t.text }]}>Continue with Google</Text>
              </>
          }
        </TouchableOpacity>

        {!!error && <Text style={[styles.error, { color: t.danger }]}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: '100vh' as any },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  logo: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 36, fontWeight: '800', letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 48, textAlign: 'center' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24,
    width: '100%', maxWidth: 360, justifyContent: 'center', cursor: 'pointer' as any,
  },
  googleG: { fontSize: 18, fontWeight: '700', color: '#4285F4' },
  googleBtnText: { fontSize: 16, fontWeight: '600' },
  error: { marginTop: 16, fontSize: 14 },
});
