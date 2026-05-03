import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView, StyleSheet } from 'react-native';
import { Theme } from '../types';

interface Props {
  locations: string[];
  locIcons: Record<string, string>;
  activeLoc: string;
  onSelectLoc: (loc: string) => void;
  onReorder: (newOrder: string[]) => void;
  theme: Theme;
}

export function DraggablePillRow({ locations, locIcons, activeLoc, onSelectLoc, onReorder, theme: t }: Props) {
  const [order, setOrder] = useState<string[]>(locations);
  const [reorderMode, setReorderMode] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const orderRef = useRef<string[]>(locations);
  const dragIdxRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const pillLayouts = useRef<Array<{ x: number; width: number } | null>>([]);
  const pillRefs = useRef<Array<View | null>>([]);
  const panX = useRef(new Animated.Value(0)).current;
  const panScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    orderRef.current = locations;
    setOrder([...locations]);
  }, [JSON.stringify(locations)]);

  const measureAll = () => {
    pillRefs.current.forEach((ref, i) => {
      ref?.measureInWindow((x, _y, width) => {
        if (width > 0) pillLayouts.current[i] = { x, width };
      });
    });
  };

  const getHoverIdx = (pageX: number): number => {
    const layouts = pillLayouts.current;
    for (let i = 0; i < layouts.length; i++) {
      const l = layouts[i];
      if (l && pageX < l.x + l.width / 2) return i;
    }
    return Math.max(0, layouts.filter(Boolean).length - 1);
  };

  const startDrag = useCallback((idx: number, startPageX: number) => {
    dragIdxRef.current = idx;
    dragStartXRef.current = startPageX;
    setDragIdx(idx);
    setHoverIdx(idx);
    panX.setValue(0);
    measureAll();
    Animated.spring(panScale, { toValue: 1.1, useNativeDriver: true, friction: 5 }).start();
  }, []);

  const moveDrag = useCallback((pageX: number) => {
    if (dragIdxRef.current === null) return;
    panX.setValue(pageX - dragStartXRef.current);
    setHoverIdx(getHoverIdx(pageX));
  }, []);

  const releaseDrag = useCallback((pageX: number) => {
    const from = dragIdxRef.current;
    if (from !== null) {
      const to = getHoverIdx(pageX);
      if (to !== from) {
        const newOrder = [...orderRef.current];
        const [item] = newOrder.splice(from, 1);
        newOrder.splice(to, 0, item);
        orderRef.current = newOrder;
        setOrder(newOrder);
        onReorder(newOrder);
      }
    }
    panX.setValue(0);
    Animated.spring(panScale, { toValue: 1, useNativeDriver: true }).start();
    dragIdxRef.current = null;
    setDragIdx(null);
    setHoverIdx(null);
  }, [onReorder]);

  const cancelDrag = useCallback(() => {
    panX.setValue(0);
    panScale.setValue(1);
    dragIdxRef.current = null;
    setDragIdx(null);
    setHoverIdx(null);
  }, []);

  return (
    <View style={styles.container}>
      {/* All pill — never draggable */}
      <TouchableOpacity
        onPress={() => onSelectLoc('All')}
        style={[styles.pill, {
          backgroundColor: activeLoc === 'All' ? t.accent : t.card,
          borderColor: activeLoc === 'All' ? t.accent : t.border,
          marginLeft: 16,
        }]}
      >
        <Text style={{ fontSize: 13 }}>🏠</Text>
        <Text style={{ fontSize: 12, fontWeight: activeLoc === 'All' ? '600' : '400', color: activeLoc === 'All' ? '#fff' : t.textSec }}>All</Text>
      </TouchableOpacity>

      {reorderMode ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={dragIdx === null}
            style={{ flex: 1 }}
            contentContainerStyle={{ gap: 6, paddingHorizontal: 8, alignItems: 'center' }}
          >
            {order.map((loc, idx) => {
              const active = activeLoc === loc;
              const isDragging = dragIdx === idx;
              const isTarget = hoverIdx === idx && dragIdx !== null && dragIdx !== idx;

              return (
                <Animated.View
                  key={loc}
                  ref={(r: any) => { pillRefs.current[idx] = r; }}
                  onLayout={() => setTimeout(() => {
                    (pillRefs.current[idx] as any)?.measureInWindow((x: number, _y: number, w: number) => {
                      if (w > 0) pillLayouts.current[idx] = { x, width: w };
                    });
                  }, 60)}
                  style={[
                    isDragging && {
                      transform: [{ translateX: panX }, { scale: panScale }],
                      zIndex: 10,
                      elevation: 8,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.18,
                      shadowRadius: 6,
                    },
                  ]}
                >
                  <View style={[
                    styles.pill,
                    { backgroundColor: active ? t.accent : t.card, borderColor: isTarget ? t.accent : t.border },
                    isDragging && { opacity: 0.88, borderColor: t.accent },
                    isTarget && { borderWidth: 2.5 },
                  ]}>
                    {/* Drag handle — claims touch immediately */}
                    <View
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={(e) => startDrag(idx, e.nativeEvent.pageX)}
                      onResponderMove={(e) => moveDrag(e.nativeEvent.pageX)}
                      onResponderRelease={(e) => releaseDrag(e.nativeEvent.pageX)}
                      onResponderTerminate={cancelDrag}
                      style={styles.dragHandle}
                    >
                      <Text style={{ color: isDragging ? (active ? '#fff' : t.accent) : t.textSec, fontSize: 14, lineHeight: 18 }}>⠿</Text>
                    </View>
                    <TouchableOpacity onPress={() => { if (!dragIdx) onSelectLoc(loc); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 13 }}>{locIcons[loc] || '📦'}</Text>
                      <Text style={{ fontSize: 12, fontWeight: active ? '600' : '400', color: active ? '#fff' : t.textSec }}>{loc}</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            onPress={() => { cancelDrag(); setReorderMode(false); }}
            style={[styles.doneBtn, { backgroundColor: t.accent }]}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Done</Text>
          </TouchableOpacity>
        </>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 8, paddingRight: 16, alignItems: 'center' }}
        >
          {order.map((loc) => {
            const active = activeLoc === loc;
            return (
              <TouchableOpacity
                key={loc}
                onPress={() => onSelectLoc(loc)}
                onLongPress={() => setReorderMode(true)}
                delayLongPress={400}
                style={[styles.pill, { backgroundColor: active ? t.accent : t.card, borderColor: active ? t.accent : t.border }]}
              >
                <Text style={{ fontSize: 13 }}>{locIcons[loc] || '📦'}</Text>
                <Text style={{ fontSize: 12, fontWeight: active ? '600' : '400', color: active ? '#fff' : t.textSec }}>{loc}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', height: 50 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1.5 },
  dragHandle: { paddingHorizontal: 4, paddingVertical: 2 },
  doneBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginHorizontal: 8 },
});
