import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  role: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchRole: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  fetchRole: async (userId) => {
    // Hardcode check for the specific admin email provided by the user (case-insensitive)
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email?.toLowerCase() === 'snkdigitaldesign@gmail.com') {
      set({ role: 'admin' });
      return;
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (!error && data) {
      set({ role: data.role });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: null });
  },
}));
