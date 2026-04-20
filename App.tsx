import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

import { auth, db } from './src/firebase';
import { AppProvider, useApp } from './src/AppContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { HouseholdSetupScreen } from './src/screens/HouseholdSetupScreen';
import { InventoryScreen } from './src/screens/InventoryScreen';
import { BuyListScreen } from './src/screens/BuyListScreen';
import { HouseholdScreen } from './src/screens/HouseholdScreen';
import { THEMES } from './src/theme';

const Tab = createBottomTabNavigator();

function AppTabs() {
  const { theme: t } = useApp();
  return (
    <NavigationContainer>
      <StatusBar style={t.id === 'night' ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: t.navBg, borderTopColor: t.border, borderTopWidth: 1, paddingBottom: 8, paddingTop: 6, height: 60 },
          tabBarActiveTintColor: t.tabActive,
          tabBarInactiveTintColor: t.tabInactive,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          tabBarIcon: ({ color }) => {
            const icons: Record<string, string> = { Inventory: '▦', 'Buy List': '🛒', Household: '👥' };
            return <Text style={{ fontSize: 20, color }}>{icons[route.name] ?? '●'}</Text>;
          },
        })}
      >
        <Tab.Screen name="Inventory" component={InventoryScreen} />
        <Tab.Screen name="Buy List" component={BuyListScreen} />
        <Tab.Screen name="Household" component={HouseholdScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: THEMES.sage.bg }}>
      <ActivityIndicator color={THEMES.sage.accent} size="large" />
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [householdId, setHouseholdId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let unsubUser: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (unsubUser) { unsubUser(); unsubUser = null; }
      if (u) {
        unsubUser = onSnapshot(doc(db, 'users', u.uid), snap => {
          setHouseholdId(snap.data()?.householdId ?? null);
        });
      } else {
        setHouseholdId(null);
      }
    });
    return () => { unsubAuth(); if (unsubUser) unsubUser(); };
  }, []);

  // Loading
  if (user === undefined || householdId === undefined) return <Splash />;

  // Not signed in
  if (!user) return <AuthScreen />;

  // Signed in but no household yet
  if (!householdId) return <HouseholdSetupScreen />;

  // Fully set up
  return (
    <AppProvider householdId={householdId}>
      <AppTabs />
    </AppProvider>
  );
}
