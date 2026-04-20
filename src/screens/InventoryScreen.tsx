import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 16;
const GRID_GAP = 8;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;
import { useApp } from '../AppContext';
import { ItemCard } from '../components/ItemCard';
import { AddItemSheet } from '../components/AddItemSheet';
import { ItemDetailSheet } from '../components/ItemDetailSheet';
import { Item } from '../types';
import { groupBy } from '../data';

export function InventoryScreen() {
  const { theme: t, items, updateQty, updateThreshold, updateItem, addItem, deleteItem, locations, locIcons, members } = useApp();
  const [search, setSearch] = useState('');
  const [activeLoc, setActiveLoc] = useState('All');
  const [addVisible, setAddVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const filtered = items.filter(i => {
    const matchLoc = activeLoc === 'All' || i.location === activeLoc;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return matchLoc && matchSearch;
  });

  const grouped = groupBy(filtered, 'location');
  const sortedLocs = Object.keys(grouped).sort((a, b) => locations.indexOf(a) - locations.indexOf(b));
  const lowCount = items.filter(i => i.quantity < i.minThreshold).length;
  const defaultMember = members[0]?.name ?? 'You';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.brandRow}>
            <Text style={styles.brandIcon}>🫙</Text>
            <Text style={[styles.brandName, { color: t.accent }]}>PantryPal</Text>
          </View>
          <Text style={[styles.subtitle, { color: t.textSec }]}>
            {items.length} items ·{' '}
            <Text style={{ color: lowCount > 0 ? t.warn : t.textSec }}>{lowCount} need restocking</Text>
          </Text>
        </View>
        <TouchableOpacity onPress={() => setAddVisible(true)} style={[styles.addBtn, { backgroundColor: t.accent }]}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: t.inputBg, borderColor: t.border }]}>
        <Text style={{ color: t.textSec, fontSize: 16 }}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search items…"
          placeholderTextColor={t.textSec}
          style={[styles.searchInput, { color: t.text }]}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: t.textSec, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Location filter pills */}
      <View style={styles.pillRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, alignItems: 'center', flexGrow: 1 }}>
          {['All', ...locations].map(l => {
            const active = activeLoc === l;
            return (
              <TouchableOpacity
                key={l}
                onPress={() => setActiveLoc(l)}
                style={[styles.pill, { backgroundColor: active ? t.accent : t.card, borderColor: active ? t.accent : t.border }]}
              >
                <Text style={{ fontSize: 14 }}>{l === 'All' ? '🏠' : (locIcons[l] || '📦')}</Text>
                <Text style={{ fontSize: 13, fontWeight: active ? '600' : '400', color: active ? '#fff' : t.textSec }}>{l}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Items */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 10, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {sortedLocs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: t.text }]}>No items found</Text>
            <Text style={[styles.emptySubtitle, { color: t.textSec }]}>Try a different search or location</Text>
          </View>
        ) : sortedLocs.map(loc => (
          <View key={loc} style={{ marginBottom: 4 }}>
            <View style={styles.locHeader}>
              <Text style={{ fontSize: 16 }}>{locIcons[loc] || loc[0]}</Text>
              <Text style={[styles.locLabel, { color: t.textSec }]}>{loc.toUpperCase()}</Text>
            </View>
            <View style={styles.grid}>
              {grouped[loc].map(item => (
                <View key={item.id} style={styles.gridItem}>
                  <ItemCard
                    item={item}
                    theme={t}
                    onUpdateQty={updateQty}
                    onPress={() => setSelectedItem(item)}
                  />
                </View>
              ))}
            </View>
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

      <ItemDetailSheet
        item={selectedItem}
        visible={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onUpdateQty={(id, qty) => { updateQty(id, qty); setSelectedItem(prev => prev ? { ...prev, quantity: qty } : null); }}
        onUpdateThreshold={(id, threshold) => { updateThreshold(id, threshold); setSelectedItem(prev => prev ? { ...prev, minThreshold: threshold } : null); }}
        onUpdateItem={(id, updates) => { updateItem(id, updates); setSelectedItem(prev => prev ? { ...prev, ...updates } : null); }}
        onDelete={(id) => { deleteItem(id); setSelectedItem(null); }}
        theme={t}
        locIcons={locIcons}
        locations={locations}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandIcon: { fontSize: 26 },
  brandName: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 2 },
  addBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 24, lineHeight: 28 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  pillRow: { height: 46, justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5 },
  locHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, marginBottom: 10 },
  locLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
  gridItem: { width: CARD_WIDTH },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptySubtitle: { fontSize: 13, marginTop: 4 },
});
