import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Draw {
  id: string;
  draw_date: string;
  first_prize: string;
  front_three: string[];
  back_three: string[];
  last_two: string;
}

interface LotteryState {
  latestDraws: Draw[];
  loading: boolean;
  error: string | null;
  fetchLatestDraws: () => Promise<void>;
  fetchAllDraws: () => Promise<Draw[]>;
  checkResult: (number: string, date?: string) => Promise<any>;
}

export const useLotteryStore = create<LotteryState>((set) => ({
  latestDraws: [],
  loading: false,
  error: null,
  fetchLatestDraws: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/latest');
      const data = await response.json();
      if (response.ok) {
        set({ latestDraws: data, loading: false });
      } else {
        set({ error: data.error, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  fetchAllDraws: async () => {
    try {
      const response = await fetch('/api/draws?limit=100');
      const data = await response.json();
      return data.data || [];
    } catch (err: any) {
      console.error('Failed to fetch all draws:', err);
      return [];
    }
  },
  checkResult: async (number: string, date?: string) => {
    try {
      const url = `/api/check?number=${number}${date ? `&date=${date}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (err: any) {
      return { error: err.message };
    }
  },
}));
