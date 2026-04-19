import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection, doc, onSnapshot, setDoc, updateDoc,
  deleteDoc, getDoc, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase';
import { Item, Member, Theme } from './types';
import { THEMES } from './theme';

interface AppState {
  householdId: string;
  theme: Theme;
  items: Item[];
  members: Member[];
  locations: string[];
  locIcons: Record<string, string>;
  inviteCode: string;
  updateQty: (id: number, qty: number) => void;
  updateThreshold: (id: number, threshold: number) => void;
  addItem: (item: Omit<Item, 'id' | 'updatedAt'>) => void;
  deleteItem: (id: number) => void;
  boughtItem: (id: number, buyQty: number) => void;
  addMember: (m: { name: string; email: string; color: string }) => void;
  removeMember: (id: number) => void;
  addLocation: (name: string, icon: string) => void;
  deleteLocation: (name: string, withItems?: boolean) => void;
}

const AppContext = createContext<AppState>(null as any);
export const useApp = () => useContext(AppContext);

interface Props {
  householdId: string;
  children: React.ReactNode;
}

export function AppProvider({ householdId, children }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [locIcons, setLocIcons] = useState<Record<string, string>>({});
  const [inviteCode, setInviteCode] = useState('');
  const [themeId] = useState('sage');

  const householdRef = doc(db, 'households', householdId);
  const itemsRef = collection(db, 'households', householdId, 'items');

  // Real-time household listener (members, locations, inviteCode)
  useEffect(() => {
    const unsub = onSnapshot(householdRef, snap => {
      const data = snap.data();
      if (!data) return;
      setMembers(data.members || []);
      setLocations(data.locations || []);
      setLocIcons(data.locIcons || {});
      setInviteCode(data.inviteCode || '');
    });
    return unsub;
  }, [householdId]);

  // Real-time items listener
  useEffect(() => {
    const unsub = onSnapshot(itemsRef, snap => {
      setItems(snap.docs.map(d => d.data() as Item));
    });
    return unsub;
  }, [householdId]);

  const updateQty = useCallback((id: number, qty: number) => {
    setDoc(doc(db, 'households', householdId, 'items', String(id)), { quantity: qty, updatedAt: Date.now() }, { merge: true });
  }, [householdId]);

  const updateThreshold = useCallback((id: number, threshold: number) => {
    setDoc(doc(db, 'households', householdId, 'items', String(id)), { minThreshold: threshold, updatedAt: Date.now() }, { merge: true });
  }, [householdId]);

  const addItem = useCallback((item: Omit<Item, 'id' | 'updatedAt'>) => {
    const id = Date.now();
    setDoc(doc(db, 'households', householdId, 'items', String(id)), { ...item, id, updatedAt: Date.now() });
  }, [householdId]);

  const deleteItem = useCallback((id: number) => {
    deleteDoc(doc(db, 'households', householdId, 'items', String(id)));
  }, [householdId]);

  const boughtItem = useCallback((id: number, buyQty: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setDoc(doc(db, 'households', householdId, 'items', String(id)), {
      quantity: +(item.quantity + buyQty).toFixed(1),
      updatedAt: Date.now(),
    }, { merge: true });
  }, [householdId, items]);

  const addMember = useCallback((m: { name: string; email: string; color: string }) => {
    const member: Member = { ...m, id: Date.now(), joinedAt: Date.now() };
    updateDoc(householdRef, { members: arrayUnion(member) });
  }, [householdId]);

  const removeMember = useCallback((id: number) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    updateDoc(householdRef, { members: arrayRemove(member) });
  }, [householdId, members]);

  const addLocation = useCallback((name: string, icon: string) => {
    const newLocations = [...locations, name];
    const newIcons = { ...locIcons, [name]: icon };
    updateDoc(householdRef, { locations: newLocations, locIcons: newIcons });
  }, [householdId, locations, locIcons]);

  const deleteLocation = useCallback((name: string, withItems = false) => {
    const newLocations = locations.filter(l => l !== name);
    const newIcons = { ...locIcons };
    delete newIcons[name];
    updateDoc(householdRef, { locations: newLocations, locIcons: newIcons });
    if (withItems) {
      items.filter(i => i.location === name).forEach(i => deleteItem(i.id));
    }
  }, [householdId, locations, locIcons, items]);

  return (
    <AppContext.Provider value={{
      householdId, inviteCode,
      theme: THEMES[themeId] ?? THEMES.sage,
      items, members, locations, locIcons,
      updateQty, updateThreshold, addItem, deleteItem, boughtItem,
      addMember, removeMember, addLocation, deleteLocation,
    }}>
      {children}
    </AppContext.Provider>
  );
}
