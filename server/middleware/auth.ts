import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase';

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  console.log(`[Auth] Request to: ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST') {
    console.log('[Auth] Request body:', JSON.stringify(req.body));
  }
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized: No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn("[Auth] Unauthorized: Invalid token or user not found");
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // Hardcode check for the specific admin email provided by the user (case-insensitive)
    if (user.email?.toLowerCase() === 'snkdigitaldesign@gmail.com') {
      console.log(`[Auth] Admin access granted for: ${user.email}`);
      (req as any).user = user;
      return next();
    }

    // Check role in user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError) {
      console.warn(`[Auth] Role check error for ${user.email}:`, roleError);
    }

    if (!roleData || roleData.role !== "admin") {
      console.warn(`[Auth] Forbidden: ${user.email} is not an admin`);
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
};
