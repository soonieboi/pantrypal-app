export interface Item {
  id: number;
  name: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  addedBy: string;
  updatedAt: number;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  color: string;
  joinedAt: number;
}

export interface Theme {
  id: string;
  bg: string;
  card: string;
  accent: string;
  accentLight: string;
  text: string;
  textSec: string;
  tabActive: string;
  tabInactive: string;
  navBg: string;
  border: string;
  warn: string;
  danger: string;
  inputBg: string;
}
