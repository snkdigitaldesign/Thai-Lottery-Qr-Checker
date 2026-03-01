import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Save, BarChart3, History, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingDraw, setFetchingDraw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const initialFormState = {
    id: '', // Add ID field
    draw_date: new Date().toISOString().split('T')[0],
    first_prize: '',
    front_three: ['', ''],
    back_three: ['', ''],
    last_two: '',
    second_prize: '',
    third_prize: '',
    fourth_prize: '',
    fifth_prize: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email || null));
  }, []);

  useEffect(() => {
    if (formData.draw_date) {
      fetchDrawByDate(formData.draw_date);
    }
  }, [formData.draw_date]);

  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrawByDate = async (date: string) => {
    setFetchingDraw(true);
    try {
      const response = await fetch(`/api/draws?date=${date}&limit=1`);
      const result = await response.json();
      
      if (result.data && result.data.length > 0) {
        const draw = result.data[0];
        setFormData({
          id: draw.id, // Set ID
          draw_date: draw.draw_date,
          first_prize: draw.first_prize,
          front_three: draw.front_three,
          back_three: draw.back_three,
          last_two: draw.last_two,
          second_prize: draw.second_prize?.join(', ') || '',
          third_prize: draw.third_prize?.join(', ') || '',
          fourth_prize: draw.fourth_prize?.join(', ') || '',
          fifth_prize: draw.fifth_prize?.join(', ') || '',
        });
        setIsEditing(true);
      } else {
        // Reset form but keep the date
        setFormData(prev => ({
          ...initialFormState,
          draw_date: prev.draw_date
        }));
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error fetching draw:", err);
    } finally {
      setFetchingDraw(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Parse comma/space separated strings into arrays
    const parsePrizes = (str: string, count: number) => {
      const arr = str.split(/[,\s]+/).filter(n => n.length === 6 && /^\d+$/.test(n));
      return arr;
    };

    const second = parsePrizes(formData.second_prize, 5);
    const third = parsePrizes(formData.third_prize, 10);
    const fourth = parsePrizes(formData.fourth_prize, 50);
    const fifth = parsePrizes(formData.fifth_prize, 100);

    if (second.length > 5 || third.length > 10 || fourth.length > 50 || fifth.length > 100) {
      setMessage({ 
        type: 'error', 
        text: `จำนวนหมายเลขเกินกำหนด: รางวัลที่ 2 (สูงสุด 5), รางวัลที่ 3 (สูงสุด 10), รางวัลที่ 4 (สูงสุด 50), รางวัลที่ 5 (สูงสุด 100)` 
      });
      setSaving(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/admin/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          ...formData,
          second_prize: second,
          third_prize: third,
          fourth_prize: fourth,
          fifth_prize: fifth,
        }),
      });

      const data = await response.json().catch(() => null);
      
      if (response.ok && data) {
        setMessage({ type: 'success', text: 'บันทึกข้อมูลเรียบร้อยแล้ว!' });
        fetchStats(); // Refresh stats
      } else {
        const errorMsg = data?.error || `เกิดข้อผิดพลาด (Status: ${response.status})`;
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: `ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">แดชบอร์ดผู้ดูแลระบบ</h1>
        <div className="flex flex-col items-end">
          <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            แอดมิน
          </div>
          {userEmail && <span className="text-[10px] text-slate-400 mt-1">{userEmail}</span>}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <span className="block text-sm font-bold text-slate-400 uppercase">จำนวนการตรวจทั้งหมด</span>
            <span className="text-2xl font-black text-slate-800">{stats?.total_checks}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="bg-emerald-100 p-3 rounded-2xl">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <span className="block text-sm font-bold text-slate-400 uppercase">จำนวนผู้ถูกรางวัล</span>
            <span className="text-2xl font-black text-slate-800">{stats?.winning_checks}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 px-8 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isEditing ? <History className="h-5 w-5 text-emerald-400" /> : <Plus className="h-5 w-5" />}
            <span className="font-bold">{isEditing ? 'แก้ไขผลการออกรางวัล' : 'บันทึกผลการออกรางวัลใหม่'}</span>
          </div>
          {fetchingDraw && <div className="text-xs animate-pulse text-slate-400">กำลังดึงข้อมูลเดิม...</div>}
        </div>
        
        <form onSubmit={handleUpdate} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">งวดประจำวันที่</label>
              <input
                type="date"
                required
                value={formData.draw_date}
                onChange={(e) => setFormData({ ...formData, draw_date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">รางวัลที่ 1 (6 หลัก)</label>
              <input
                type="text"
                required
                maxLength={6}
                value={formData.first_prize}
                onChange={(e) => setFormData({ ...formData, first_prize: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-xl tracking-widest"
                placeholder="000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 block">เลขหน้า 3 ตัว (2 ชุด)</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={formData.front_three[0]}
                  onChange={(e) => {
                    const newFront = [...formData.front_three];
                    newFront[0] = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, front_three: newFront });
                  }}
                  className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-center font-mono"
                  placeholder="000"
                />
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={formData.front_three[1]}
                  onChange={(e) => {
                    const newFront = [...formData.front_three];
                    newFront[1] = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, front_three: newFront });
                  }}
                  className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-center font-mono"
                  placeholder="000"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 block">เลขท้าย 3 ตัว (2 ชุด)</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={formData.back_three[0]}
                  onChange={(e) => {
                    const newBack = [...formData.back_three];
                    newBack[0] = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, back_three: newBack });
                  }}
                  className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-center font-mono"
                  placeholder="000"
                />
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={formData.back_three[1]}
                  onChange={(e) => {
                    const newBack = [...formData.back_three];
                    newBack[1] = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, back_three: newBack });
                  }}
                  className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-center font-mono"
                  placeholder="000"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 block">เลขท้าย 2 ตัว</label>
              <input
                type="text"
                required
                maxLength={2}
                value={formData.last_two}
                onChange={(e) => setFormData({ ...formData, last_two: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-center font-mono text-xl"
                placeholder="00"
              />
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">รางวัลที่ 2 (5 หมายเลข)</label>
                <span className={`text-xs font-bold ${formData.second_prize.split(/[,\s]+/).filter(n => n.length === 6).length === 5 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  บันทึกแล้ว: {formData.second_prize.split(/[,\s]+/).filter(n => n.length === 6).length} / 5
                </span>
              </div>
              <textarea
                required
                rows={2}
                value={formData.second_prize}
                onChange={(e) => setFormData({ ...formData, second_prize: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                placeholder="123456, 234567, ..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">รางวัลที่ 3 (10 หมายเลข)</label>
                <span className={`text-xs font-bold ${formData.third_prize.split(/[,\s]+/).filter(n => n.length === 6).length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  บันทึกแล้ว: {formData.third_prize.split(/[,\s]+/).filter(n => n.length === 6).length} / 10
                </span>
              </div>
              <textarea
                required
                rows={2}
                value={formData.third_prize}
                onChange={(e) => setFormData({ ...formData, third_prize: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                placeholder="123456, 234567, ..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">รางวัลที่ 4 (50 หมายเลข)</label>
                <span className={`text-xs font-bold ${formData.fourth_prize.split(/[,\s]+/).filter(n => n.length === 6).length === 50 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  บันทึกแล้ว: {formData.fourth_prize.split(/[,\s]+/).filter(n => n.length === 6).length} / 50
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={formData.fourth_prize}
                onChange={(e) => setFormData({ ...formData, fourth_prize: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                placeholder="123456, 234567, ..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">รางวัลที่ 5 (100 หมายเลข)</label>
                <span className={`text-xs font-bold ${formData.fifth_prize.split(/[,\s]+/).filter(n => n.length === 6).length === 100 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  บันทึกแล้ว: {formData.fifth_prize.split(/[,\s]+/).filter(n => n.length === 6).length} / 100
                </span>
              </div>
              <textarea
                required
                rows={6}
                value={formData.fifth_prize}
                onChange={(e) => setFormData({ ...formData, fifth_prize: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                placeholder="123456, 234567, ..."
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl flex items-center space-x-3 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={saving || fetchingDraw}
              className="flex-grow bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>{saving ? 'กำลังบันทึก...' : isEditing ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}</span>
            </button>
            {isEditing && (
              <button
                type="button"
                disabled={saving || fetchingDraw}
                onClick={async () => {
                  if (!isDeleting) {
                    setIsDeleting(true);
                    setTimeout(() => setIsDeleting(false), 3000);
                    return;
                  }
                  
                  console.log(`[Admin] Delete confirmed. ID: ${formData.id}, Date: ${formData.draw_date}`);
                  setIsDeleting(false);
                  setSaving(true);
                  try {
                    console.log('[Admin] Getting session...');
                    const { data: { session } } = await supabase.auth.getSession();
                    console.log('[Admin] Session status:', session ? 'Active' : 'Missing');
                    
                    if (!session) {
                      alert('กรุณาเข้าสู่ระบบใหม่');
                      return;
                    }

                    console.log('[Admin] Sending POST request to /api/admin/delete');
                    const response = await fetch('/api/admin/delete', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ id: formData.id, date: formData.draw_date }),
                    });

                    console.log('[Admin] Response status:', response.status);
                    const responseData = await response.json().catch(() => ({}));
                    console.log('[Admin] Response data:', responseData);

                    if (response.ok) {
                      console.log('[Admin] Delete successful');
                      setMessage({ type: 'success', text: 'ลบข้อมูลเรียบร้อยแล้ว' });
                      setFormData({ ...initialFormState, draw_date: formData.draw_date });
                      setIsEditing(false);
                      fetchStats();
                    } else {
                      const errorMsg = responseData.error || `เกิดข้อผิดพลาด (Status: ${response.status})`;
                      setMessage({ type: 'error', text: errorMsg });
                    }
                  } catch (err: any) {
                    console.error('[Admin] Delete exception:', err);
                    setMessage({ type: 'error', text: err.message });
                  } finally {
                    setSaving(false);
                  }
                }}
                className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 ${
                  isDeleting 
                    ? 'bg-red-600 text-white animate-pulse' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                <Trash2 className="h-5 w-5" />
                <span>{isDeleting ? 'คลิกอีกครั้งเพื่อยืนยัน' : 'ลบงวดนี้'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                const { data: { session } } = await supabase.auth.getSession();
                const response = await fetch('/api/admin/debug-draws', {
                  headers: { Authorization: `Bearer ${session?.access_token}` }
                });
                const data = await response.json();
                console.log('[Admin Debug] Draw IDs:', data);
                alert(`Found ${data.length} draws. Check console for IDs.`);
              }}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
            >
              Debug IDs
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...initialFormState,
                  draw_date: formData.draw_date
                });
                setIsEditing(false);
                setMessage(null);
              }}
              className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              ล้างข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
