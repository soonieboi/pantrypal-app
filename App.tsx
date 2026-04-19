import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
          tabBarStyle: { backgroundColor: t.navBg, borderTopColor: t.border, borderTopWidth: 1 },
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
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [checkingHousehold, setCheckingHousehold] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setCheckingHousehold(true);
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        setHouseholdId(userDoc.data()?.householdId ?? null);
        setCheckingHousehold(false);
      } else {
        setHouseholdId(null);
      }
    });
  }, []);

  // Loading
  if (user === undefined || checkingHousehold) return <Splash />;

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
