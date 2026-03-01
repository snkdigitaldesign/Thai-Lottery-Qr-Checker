import { create } from "zustand";
import { supabase } from "../lib/supabase";

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

    const { data, error } = await supabase
      .from("draws")
      .select("*")
      .order("draw_date", { ascending: false })
      .limit(2);

    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ latestDraws: data || [], loading: false });
    }
  },

  fetchAllDraws: async () => {
    const { data } = await supabase
      .from("draws")
      .select("*")
      .order("draw_date", { ascending: false })
      .limit(100);

    return data || [];
  },

  checkResult: async (number: string, date?: string) => {
    let query = supabase.from("draws").select("*");

    if (date) {
      query = query.eq("draw_date", date);
    }

    const { data } = await query;

    if (!data) return null;

    const result = data.find((draw) =>
      draw.first_prize === number ||
      draw.last_two === number ||
      draw.front_three?.includes(number) ||
      draw.back_three?.includes(number)
    );

    return result || null;
  },
}));
