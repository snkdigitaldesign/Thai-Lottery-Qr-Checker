import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, ChevronLeft, ChevronRight, Search, Filter, Award, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

interface Draw {
  id: string;
  draw_date: string;
  first_prize: string;
  front_three: string[];
  back_three: string[];
  last_two: string;
}

export default function PreviousResults() {
  const { user, role } = useAuthStore();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterDate, setFilterDate] = useState('');

  const fetchDraws = async () => {
    setLoading(true);
    try {
      const limit = 5;
      const offset = (page - 1) * limit;
      let query = supabase
        .from("draws")
        .select("*", { count: "exact" })
        .order("draw_date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (filterDate) {
        query = query.eq("draw_date", filterDate);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      setDraws(data || []);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (error) {
      console.error('Failed to fetch draws:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraws();
  }, [page, filterDate]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDate(e.target.value);
    setPage(1); // Reset to first page on filter change
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = async (id: string, date: string) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000); // Reset after 3 seconds
      return;
    }

    console.log(`[Frontend] Delete confirmed. ID=${id}, Date=${date}`);
    setDeleteConfirmId(null);

    if (!id) {
      console.error('[Frontend] Missing ID for deletion');
      alert('ไม่พบ ID ของข้อมูล ไม่สามารถลบได้');
      return;
    }

    try {
      const { error } = await supabase
        .from("draws")
        .delete()
        .eq("id", id);

      if (error) throw error;

      console.log('[Frontend] Delete successful');
      alert('ลบข้อมูลสำเร็จ');
      fetchDraws();
    } catch (error: any) {
      console.error('[Frontend] Delete exception:', error);
      alert(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">ผลการออกรางวัลย้อนหลัง</h1>
        <p className="text-slate-500">ตรวจสอบสถิติและผลการออกรางวัลงวดก่อนหน้า</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-slate-700 font-bold">
          <Filter className="h-5 w-5" />
          <span>ตัวกรองข้อมูล</span>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-slate-500">ค้นหาตามวันที่:</label>
          <input
            type="date"
            value={filterDate}
            onChange={handleFilterChange}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-logo-primary focus:border-transparent outline-none transition-all"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-xs text-red-500 hover:underline"
            >
              ล้างค่า
            </button>
          )}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-logo-primary"></div>
          </div>
        ) : draws.length > 0 ? (
          draws.map((draw) => (
            <motion.div
              key={draw.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center space-x-3 text-slate-900 font-black">
                  <Calendar className="h-5 w-5 text-logo-primary" />
                  <span className="text-base">งวดวันที่ {new Date(draw.draw_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                {user && role === 'admin' && (
                  <button
                    onClick={() => handleDelete(draw.id, draw.draw_date)}
                    className={`p-2 px-3 rounded-xl transition-all flex items-center space-x-2 ${
                      deleteConfirmId === draw.id 
                        ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-200' 
                        : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={deleteConfirmId === draw.id ? "คลิกอีกครั้งเพื่อยืนยันการลบ" : "ลบข้อมูลงวดนี้"}
                  >
                    <Trash2 className="h-5 w-5" />
                    {deleteConfirmId === draw.id && <span className="text-xs font-bold">ยืนยันการลบ</span>}
                  </button>
                )}
              </div>
              <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">รางวัลที่ 1</span>
                  <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter font-display">{draw.first_prize}</div>
                </div>
                <div className="space-y-2 bg-logo-light/30 p-4 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">เลขท้าย 2 ตัว</span>
                  <div className="text-2xl md:text-3xl font-black text-logo-primary tracking-tighter font-display">{draw.last_two}</div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">เลขหน้า 3 ตัว</span>
                  <div className="text-xl md:text-2xl font-black text-slate-700 flex gap-3">
                    {draw.front_three.map((n, i) => <span key={i} className="bg-slate-50 px-2 py-1 rounded-lg">{n}</span>)}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">เลขท้าย 3 ตัว</span>
                  <div className="text-xl md:text-2xl font-black text-slate-700 flex gap-3">
                    {draw.back_three.map((n, i) => <span key={i} className="bg-slate-50 px-2 py-1 rounded-lg">{n}</span>)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-500">ไม่พบข้อมูลผลการออกรางวัล</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 bg-white rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-sm font-bold text-slate-600">
            หน้า {page} จาก {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 bg-white rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
