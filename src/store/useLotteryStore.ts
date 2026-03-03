import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { checkLottery } from '../utils/lottery';

interface Draw {
  id: string;
  draw_date: string;
  first_prize: string;
  front_three: string[];
  back_three: string[];
  last_two: string;
  second_prize?: string[];
  third_prize?: string[];
  fourth_prize?: string[];
  fifth_prize?: string[];
}

interface LotteryState {
  latestDraws: Draw[];
  loading: boolean;
  error: string | null;
  fetchLatestDraws: () => Promise<void>;
  fetchAllDraws: (page?: number, limit?: number, date?: string) => Promise<{ data: Draw[], total: number }>;
  checkResult: (number: string, date?: string) => Promise<any>;
}

export const useLotteryStore = create<LotteryState>((set) => ({
  latestDraws: [],
  loading: false,
  error: null,
  fetchLatestDraws: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("draws")
        .select("*")
        .order("draw_date", { ascending: false })
        .limit(2);

      if (error) throw error;
      set({ latestDraws: data || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  fetchAllDraws: async (page = 1, limit = 10, date?: string) => {
    try {
      const offset = (page - 1) * limit;
      let query = supabase
        .from("draws")
        .select("*", { count: "exact" })
        .order("draw_date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (date) {
        query = query.eq("draw_date", date);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: data || [],
        total: count || 0
      };
    } catch (err: any) {
      console.error('Failed to fetch all draws:', err);
      return { data: [], total: 0 };
    }
  },
  checkResult: async (number: string, date?: string) => {
    try {
      let draw;
      if (date) {
        const { data, error } = await supabase
          .from("draws")
          .select("*")
          .eq("draw_date", date)
          .single();
        
        if (error || !data) return { error: "ไม่พบข้อมูลการออกรางวัลในวันที่ระบุ" };
        draw = data;
      } else {
        const { data, error } = await supabase
          .from("draws")
          .select("*")
          .order("draw_date", { ascending: false })
          .limit(1)
          .single();
        
        if (error || !data) return { error: "ไม่พบข้อมูลการออกรางวัล" };
        draw = data;
      }

      const result = checkLottery(number, draw);

      // Log check to Supabase
      await supabase.from("check_logs").insert({
        number,
        draw_date: draw.draw_date,
        is_winner: result.is_winner,
        prize_type: result.prizes.join(", "),
      });

      return result;
    } catch (err: any) {
      return { error: err.message };
    }
  },
}));
