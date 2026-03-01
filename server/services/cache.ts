import { supabase } from "../services/supabase";

interface Draw {
  id: string;
  draw_date: string;
  first_prize: string;
  front_three: string[];
  back_three: string[];
  last_two: string;
}

class CacheService {
  private latestDraws: Draw[] | null = null;
  private lastFetch: number = 0;
  private TTL = 60 * 1000; // 1 minute cache

  async getLatestDraws(force = false): Promise<Draw[]> {
    const now = Date.now();
    if (!force && this.latestDraws && (now - this.lastFetch < this.TTL)) {
      return this.latestDraws;
    }

    try {
      const { data, error } = await supabase
        .from("draws")
        .select("*")
        .order("draw_date", { ascending: false })
        .limit(2);

      if (error) throw error;
      
      this.latestDraws = data || [];
      this.lastFetch = now;
      return this.latestDraws;
    } catch (error) {
      console.error("Cache fetch error:", error);
      return this.latestDraws || []; // Return stale if fetch fails
    }
  }

  invalidate() {
    this.latestDraws = null;
    this.lastFetch = 0;
  }
}

export const lotteryCache = new CacheService();

// Log Buffer for high-concurrency logging
class LogBuffer {
  private logs: any[] = [];
  private MAX_SIZE = 100;
  private FLUSH_INTERVAL = 5000; // 5 seconds

  constructor() {
    setInterval(() => this.flush(), this.FLUSH_INTERVAL);
  }

  add(log: any) {
    this.logs.push(log);
    if (this.logs.length >= this.MAX_SIZE) {
      this.flush();
    }
  }

  async flush() {
    if (this.logs.length === 0) return;
    
    const logsToFlush = [...this.logs];
    this.logs = [];

    try {
      const { error } = await supabase.from("check_logs").insert(logsToFlush);
      if (error) console.error("Log flush error:", error);
    } catch (error) {
      console.error("Log flush exception:", error);
    }
  }
}

export const logBuffer = new LogBuffer();
