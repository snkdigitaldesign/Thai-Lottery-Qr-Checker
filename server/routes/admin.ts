import express from "express";
import { supabase } from "../services/supabase";
import { adminAuth } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { drawSchema } from "../utils/schemas";
import { lotteryCache } from "../services/cache";

const router = express.Router();

// Apply admin authentication to all routes in this router
router.use(adminAuth);

// POST /api/admin/update - Update lottery results
router.post("/update", validate(drawSchema), async (req, res, next) => {
  const { 
    draw_date, 
    first_prize, 
    front_three, 
    back_three, 
    last_two,
    second_prize,
    third_prize,
    fourth_prize,
    fifth_prize
  } = req.body;

  try {
    const { data, error } = await supabase
      .from("draws")
      .upsert({
        draw_date,
        first_prize,
        front_three,
        back_three,
        last_two,
        second_prize,
        third_prize,
        fourth_prize,
        fifth_prize
      }, { onConflict: "draw_date" })
      .select();

    if (error) throw error;

    // Invalidate Cache
    lotteryCache.invalidate();

    res.json({ message: "Draw updated successfully", data });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/delete - Fallback delete endpoint using POST
router.post("/delete", async (req, res, next) => {
  const { id, date } = req.body;
  console.log(`[Admin] Fallback delete request: ID=${id}, Date=${date}`);

  try {
    if (!id && !date) {
      return res.status(400).json({ error: "ต้องระบุ ID หรือ วันที่" });
    }

    let query = supabase.from("draws").delete().select();
    
    if (id) {
      query = query.eq("id", id);
    } else {
      query = query.eq("draw_date", date);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`[Admin] Fallback delete error:`, error);
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "ไม่พบข้อมูลที่ต้องการลบ" });
    }

    console.log(`[Admin] Fallback delete successful for ${id || date}`);
    lotteryCache.invalidate();
    res.json({ message: "ลบข้อมูลเรียบร้อยแล้ว", deleted: data });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/debug-draws - Debug endpoint to list draws and IDs
router.get("/debug-draws", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("draws")
      .select("id, draw_date")
      .order("draw_date", { ascending: false })
      .limit(10);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/draw/:id - Delete a lottery draw
router.delete("/draw/:id", async (req, res, next) => {
  const { id } = req.params;
  console.log(`[Admin] Request to delete draw ID: ${id}`);

  try {
    // First check if it exists
    const { data: existing, error: fetchError } = await supabase
      .from("draws")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      console.warn(`[Admin] Draw not found for deletion: ${id}`);
      return res.status(404).json({ error: "ไม่พบข้อมูลที่ต้องการลบ" });
    }

    const { error } = await supabase
      .from("draws")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`[Admin] Delete error for ID ${id}:`, error);
      throw error;
    }

    console.log(`[Admin] Successfully deleted draw ID: ${id}`);

    // Invalidate Cache
    lotteryCache.invalidate();

    res.json({ message: "ลบข้อมูลเรียบร้อยแล้ว" });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/draw-by-date/:date - Delete a lottery draw by date
router.delete("/draw-by-date/:date", async (req, res, next) => {
  const { date } = req.params;
  console.log(`[Admin] Request to delete draw Date: ${date}`);

  try {
    // First check if it exists
    const { data: existing, error: fetchError } = await supabase
      .from("draws")
      .select("id")
      .eq("draw_date", date)
      .single();

    if (fetchError || !existing) {
      console.warn(`[Admin] Draw not found for deletion: ${date}`);
      return res.status(404).json({ error: "ไม่พบข้อมูลที่ต้องการลบในวันที่ระบุ" });
    }

    const { error } = await supabase
      .from("draws")
      .delete()
      .eq("draw_date", date);

    if (error) {
      console.error(`[Admin] Delete error for date ${date}:`, error);
      throw error;
    }

    console.log(`[Admin] Successfully deleted draw Date: ${date}`);

    // Invalidate Cache
    lotteryCache.invalidate();

    res.json({ message: "ลบข้อมูลเรียบร้อยแล้ว" });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/stats - Basic stats
router.get("/stats", async (req, res, next) => {
  try {
    const { count: totalChecks } = await supabase
      .from("check_logs")
      .select("*", { count: "exact", head: true });

    const { count: winningChecks } = await supabase
      .from("check_logs")
      .select("*", { count: "exact", head: true })
      .eq("is_winner", true);

    res.json({
      total_checks: totalChecks || 0,
      winning_checks: winningChecks || 0,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
