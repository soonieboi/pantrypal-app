import { Item, Member } from './types';

export const LOCATIONS = ['Freezer', 'Fridge', 'Pantry', 'Bathroom', 'Doggo'];
export const DEFAULT_LOC_ICONS: Record<string, string> = {
  Pantry: '🥫', Fridge: '🧊', Bathroom: '🧴', Freezer: '❄️', Doggo: '🐶',
};
export const EMOJI_OPTIONS = [
  '📦','🛒','🏠','🌿','💊','🍼','🧺','🔧','🎮','🏋️',
  '🧸','🪴','🐱','🐶','🐠','⚗️','🎨','📚','🪵','🧴',
];
export const MEMBER_PALETTE = [
  '#3D6B4F','#B86B2A','#6366F1','#EC4899',
  '#0891B2','#7C3AED','#DC2626','#059669',
];

export const INITIAL_ITEMS: Item[] = [
  { id: 1,  name: 'Rice',          category: 'Grains',        location: 'Pantry',   quantity: 2, unit: 'bag',    minThreshold: 1, addedBy: 'Alex', updatedAt: Date.now() - 86400000 },
  { id: 2,  name: 'Pasta',         category: 'Grains',        location: 'Pantry',   quantity: 0, unit: 'box',    minThreshold: 2, addedBy: 'Sam',  updatedAt: Date.now() - 3600000 },
  { id: 3,  name: 'Oats',          category: 'Grains',        location: 'Pantry',   quantity: 1, unit: 'tub',    minThreshold: 1, addedBy: 'Alex', updatedAt: Date.now() - 172800000 },
  { id: 4,  name: 'Tomato Sauce',  category: 'Canned',        location: 'Pantry',   quantity: 3, unit: 'can',    minThreshold: 2, addedBy: 'Alex', updatedAt: Date.now() - 86400000 },
  { id: 5,  name: 'Chickpeas',     category: 'Canned',        location: 'Pantry',   quantity: 1, unit: 'can',    minThreshold: 3, addedBy: 'Sam',  updatedAt: Date.now() - 7200000 },
  { id: 6,  name: 'Olive Oil',     category: 'Oils & Spices', location: 'Pantry',   quantity: 1, unit: 'bottle', minThreshold: 1, addedBy: 'Alex', updatedAt: Date.now() - 259200000 },
  { id: 7,  name: 'Milk',          category: 'Dairy',         location: 'Fridge',   quantity: 1, unit: 'liter',  minThreshold: 2, addedBy: 'Alex', updatedAt: Date.now() - 3600000 },
  { id: 8,  name: 'Cheddar',       category: 'Dairy',         location: 'Fridge',   quantity: 1, unit: 'block',  minThreshold: 1, addedBy: 'Sam',  updatedAt: Date.now() - 86400000 },
  { id: 9,  name: 'Yogurt',        category: 'Dairy',         location: 'Fridge',   quantity: 0, unit: 'tub',    minThreshold: 2, addedBy: 'Alex', updatedAt: Date.now() - 1800000 },
  { id: 10, name: 'Spinach',       category: 'Produce',       location: 'Fridge',   quantity: 1, unit: 'bag',    minThreshold: 1, addedBy: 'Sam',  updatedAt: Date.now() - 43200000 },
  { id: 11, name: 'Shampoo',       category: 'Hygiene',       location: 'Bathroom', quantity: 1, unit: 'bottle', minThreshold: 1, addedBy: 'Sam',  updatedAt: Date.now() - 604800000 },
  { id: 12, name: 'Toothpaste',    category: 'Hygiene',       location: 'Bathroom', quantity: 0, unit: 'tube',   minThreshold: 2, addedBy: 'Alex', updatedAt: Date.now() - 3600000 },
  { id: 13, name: 'Dish Soap',     category: 'Cleaning',      location: 'Pantry',   quantity: 1, unit: 'bottle', minThreshold: 1, addedBy: 'Alex', updatedAt: Date.now() - 86400000 },
  { id: 14, name: 'Paper Towels',  category: 'Cleaning',      location: 'Pantry',   quantity: 0, unit: 'roll',   minThreshold: 4, addedBy: 'Sam',  updatedAt: Date.now() - 7200000 },
  { id: 15, name: 'Chicken',       category: 'Meat',          location: 'Freezer',  quantity: 2, unit: 'pack',   minThreshold: 1, addedBy: 'Alex', updatedAt: Date.now() - 86400000 },
  { id: 16, name: 'Peas',          category: 'Frozen Veg',    location: 'Freezer',  quantity: 0, unit: 'bag',    minThreshold: 2, addedBy: 'Sam',  updatedAt: Date.now() - 3600000 },
  { id: 17, name: 'Kibbles',       category: 'Food',          location: 'Doggo',    quantity: 1, unit: 'bag',    minThreshold: 1, addedBy: 'Alex', updatedAt: Date.now() - 86400000 },
  { id: 18, name: 'NexGard Spectra', category: 'Medication',  location: 'Doggo',    quantity: 0, unit: 'pack',   minThreshold: 1, addedBy: 'Alex', updatedAt: Date.now() - 172800000 },
  { id: 19, name: 'Treats',        category: 'Treats',        location: 'Doggo',    quantity: 2, unit: 'bag',    minThreshold: 1, addedBy: 'Alex', updatedAt: Date.now() - 259200000 },
];

export const INITIAL_MEMBERS: Member[] = [
  { id: 1, name: 'Alex', email: 'alex@home.com', color: '#3D6B4F', joinedAt: Date.now() - 2592000000 },
  { id: 2, name: 'Sam',  email: 'sam@home.com',  color: '#B86B2A', joinedAt: Date.now() - 1296000000 },
];

export function pluralize(count: number, word: string): string {
  if (!word) return '';
  if (count === 1) return word;
  if (word.endsWith('x') || word.endsWith('ch') || word.endsWith('sh')) return word + 'es';
  return word + 's';
}

export function timeAgo(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60000)     return 'just now';
  if (d < 3600000)   return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000)  return `${Math.floor(d / 3600000)}h ago`;
  if (d < 172800000) return 'Yesterday';
  return `${Math.floor(d / 86400000)}d ago`;
}

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
