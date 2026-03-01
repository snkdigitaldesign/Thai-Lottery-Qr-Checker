import express from "express";
import { lotteryCache, logBuffer } from "../services/cache";
import { validateQuery } from "../middleware/validator";
import { checkQuerySchema } from "../utils/schemas";
import { supabase } from "../services/supabase";

const router = express.Router();

// GET /api/latest - Get latest 2 draws (Cached)
router.get("/latest", async (req, res, next) => {
  try {
    const data = await lotteryCache.getLatestDraws();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/draws - Get paginated and filtered draws
router.get("/draws", async (req, res, next) => {
  const { page = 1, limit = 10, date } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  try {
    let query = supabase
      .from("draws")
      .select("*", { count: "exact" })
      .order("draw_date", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (date) {
      query = query.eq("draw_date", date);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    console.log(`[Lottery] Fetched ${data?.length} draws. IDs:`, data?.map(d => d.id));

    res.json({
      data,
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/check?number=123456&date=YYYY-MM-DD
router.get("/check", validateQuery(checkQuerySchema), async (req, res, next) => {
  const { number, date } = req.query as any;

  try {
    const latestDraws = await lotteryCache.getLatestDraws();
    
    let draw;
    if (date) {
      draw = latestDraws.find(d => d.draw_date === date);
      
      if (!draw) {
        // Fetch from DB if not in cache
        const { data, error } = await supabase
          .from("draws")
          .select("*")
          .eq("draw_date", date)
          .single();
        
        if (error || !data) return res.status(404).json({ error: "ไม่พบข้อมูลการออกรางวัลในวันที่ระบุ" });
        draw = data;
      }
    } else {
      draw = latestDraws[0];
    }

    if (!draw) {
      return res.status(404).json({ error: "ไม่พบข้อมูลการออกรางวัล" });
    }

    let isWinner = false;
    let prizes = [];

    if (number === draw.first_prize) {
      isWinner = true;
      prizes.push("FIRST_PRIZE");
    }

    // First Prize Neighbors (รางวัลข้างเคียงรางวัลที่ 1)
    const firstPrizeInt = parseInt(draw.first_prize);
    const neighbor1 = (firstPrizeInt === 0 ? 999999 : firstPrizeInt - 1).toString().padStart(6, '0');
    const neighbor2 = (firstPrizeInt === 999999 ? 0 : firstPrizeInt + 1).toString().padStart(6, '0');
    
    if (number === neighbor1 || number === neighbor2) {
      isWinner = true;
      prizes.push("FIRST_PRIZE_NEIGHBORS");
    }

    if (draw.front_three.includes(number.substring(0, 3))) {
      isWinner = true;
      prizes.push("FRONT_THREE");
    }

    if (draw.back_three.includes(number.substring(3, 6))) {
      isWinner = true;
      prizes.push("BACK_THREE");
    }

    if (number.substring(4, 6) === draw.last_two) {
      isWinner = true;
      prizes.push("LAST_TWO");
    }

    if (draw.second_prize?.includes(number)) {
      isWinner = true;
      prizes.push("SECOND_PRIZE");
    }

    if (draw.third_prize?.includes(number)) {
      isWinner = true;
      prizes.push("THIRD_PRIZE");
    }

    if (draw.fourth_prize?.includes(number)) {
      isWinner = true;
      prizes.push("FOURTH_PRIZE");
    }

    if (draw.fifth_prize?.includes(number)) {
      isWinner = true;
      prizes.push("FIFTH_PRIZE");
    }

    const PRIZE_AMOUNTS: Record<string, number> = {
      FIRST_PRIZE: 6000000,
      FIRST_PRIZE_NEIGHBORS: 100000,
      SECOND_PRIZE: 200000,
      THIRD_PRIZE: 80000,
      FOURTH_PRIZE: 40000,
      FIFTH_PRIZE: 20000,
      FRONT_THREE: 4000,
      BACK_THREE: 4000,
      LAST_TWO: 2000,
    };

    const totalPrize = prizes.reduce((sum, prize) => sum + (PRIZE_AMOUNTS[prize] || 0), 0);

    // Buffered Logging (Async)
    logBuffer.add({
      number,
      draw_date: draw.draw_date,
      is_winner: isWinner,
      prize_type: prizes.join(", "),
      ip_address: req.ip,
    });

    res.json({
      draw_date: draw.draw_date,
      number,
      is_winner: isWinner,
      prizes: prizes,
      total_prize: totalPrize,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
