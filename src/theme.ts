import { Theme } from './types';

export const THEMES: Record<string, Theme> = {
  sage: {
    id: 'sage',
    bg: '#F2F5F1', card: '#FFFFFF', accent: '#3D6B4F', accentLight: '#E5EFE9',
    text: '#111827', textSec: '#6B7280', tabActive: '#3D6B4F', tabInactive: '#9CA3AF',
    navBg: 'rgba(242,245,241,0.94)', border: '#E5E7EB', warn: '#D97706', danger: '#EF4444',
    inputBg: '#F6F9F6',
  },
  warm: {
    id: 'warm',
    bg: '#FBF7F0', card: '#FFFFFF', accent: '#B86B2A', accentLight: '#FEF0E0',
    text: '#1C1410', textSec: '#7C6B5A', tabActive: '#B86B2A', tabInactive: '#B0A090',
    navBg: 'rgba(251,247,240,0.94)', border: '#E8DFD0', warn: '#D97706', danger: '#DC2626',
    inputBg: '#FBF5EE',
  },
  night: {
    id: 'night',
    bg: '#111827', card: '#1F2937', accent: '#818CF8', accentLight: '#312E81',
    text: '#F9FAFB', textSec: '#9CA3AF', tabActive: '#818CF8', tabInactive: '#4B5563',
    navBg: 'rgba(17,24,39,0.97)', border: '#374151', warn: '#FBBF24', danger: '#F87171',
    inputBg: '#374151',
  },
};
