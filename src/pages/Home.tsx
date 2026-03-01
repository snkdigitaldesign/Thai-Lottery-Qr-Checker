import { useEffect } from 'react';
import { useLotteryStore } from '../store/useLotteryStore';
import { motion } from 'motion/react';
import { Calendar, Award, Hash, ArrowRight, Sparkles, TrendingUp, AlertCircle, QrCode, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { latestDraws, fetchLatestDraws, loading } = useLotteryStore();

  useEffect(() => {
    fetchLatestDraws();
  }, [fetchLatestDraws]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="text-slate-400 font-medium animate-pulse">กำลังโหลดข้อมูลล่าสุด...</p>
      </div>
    );
  }

  const latest = latestDraws[0];
  const previous = latestDraws[1];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-16 pb-20 bg-slate-50 min-h-screen"
    >
      {/* Hero Section - Matching Screenshot */}
      <section className="bg-emerald-600 pt-12 pb-24 px-6 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-emerald-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative space-y-2">
          <motion.h1 
            variants={item}
            className="text-6xl md:text-8xl font-black tracking-tighter"
          >
            ตรวจหวย
          </motion.h1>
          <motion.h2 
            variants={item}
            className="text-6xl md:text-8xl font-black tracking-tighter"
          >
            สแกนหวย
          </motion.h2>
          
          <motion.div variants={item} className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/check"
              className="inline-flex items-center space-x-3 bg-white text-emerald-600 px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-black/10 hover:scale-105 transition-transform"
            >
              <QrCode className="h-7 w-7" />
              <span>สแกน QR Code</span>
            </Link>
            <Link 
              to="/check?mode=multiple"
              className="inline-flex items-center space-x-3 bg-emerald-500 text-white px-10 py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-emerald-700/20 hover:scale-105 transition-transform border-2 border-emerald-400"
            >
              <Search className="h-7 w-7" />
              <span>ตรวจหลายใบ</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Results Bento Grid */}
      {latest && (
        <section className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
          <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 space-y-2 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-100 p-2.5 rounded-2xl">
                <Calendar className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 font-display">
                  งวดวันที่ {new Date(latest.draw_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Official Results</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* Main Prize Card */}
            <motion.div 
              variants={item}
              className="md:col-span-8 bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group border border-white/5"
            >
              <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Award className="h-40 w-40 md:h-72 md:w-72 text-emerald-500" />
              </div>
              
              <div className="relative space-y-8 md:space-y-12 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <div className="bg-emerald-500/20 px-4 py-1.5 rounded-full">
                    <span className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-emerald-400">รางวัลที่ 1</span>
                  </div>
                </div>
                
                <div className="text-7xl md:text-[11rem] font-black tracking-tighter text-white font-display flex justify-center md:justify-start drop-shadow-2xl">
                  {latest.first_prize.split('').map((char, i) => (
                    <motion.span 
                      key={i}
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.4 + (i * 0.08) 
                      }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>
                
                <div className="pt-2 md:pt-4 flex flex-col md:flex-row items-center justify-center md:justify-start gap-6">
                  <div className="px-8 py-3 bg-emerald-500 text-slate-900 rounded-3xl font-black text-xl md:text-2xl shadow-xl shadow-emerald-500/30">
                    ฿ 6,000,000
                  </div>
                  <div className="text-slate-400 font-bold flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>เงินรางวัลต่อใบ</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Last 2 Digits Card */}
            <motion.div 
              variants={item}
              className="md:col-span-4 bg-emerald-600 rounded-[2.5rem] p-8 md:p-10 text-white flex flex-col justify-between shadow-xl shadow-emerald-100/50 text-center md:text-left relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 opacity-10">
                <Hash className="h-32 w-32" />
              </div>
              <div className="space-y-1 relative">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">เลขท้าย 2 ตัว</span>
                <h3 className="text-lg md:text-xl font-black">รางวัลเลขท้าย</h3>
              </div>
              
              <div className="text-8xl md:text-9xl font-black font-display tracking-tighter py-4 relative">
                {latest.last_two}
              </div>
              
              <div className="relative">
                <div className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-xs md:text-sm font-black">
                  ฿ 2,000
                </div>
              </div>
            </motion.div>

            {/* Front 3 Digits */}
            <motion.div 
              variants={item}
              className="md:col-span-6 bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100"
            >
              <div className="flex items-center justify-between mb-4 md:mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">เลขหน้า 3 ตัว</span>
                <Hash className="h-4 w-4 md:h-5 md:w-5 text-slate-200" />
              </div>
              
              <div className="flex justify-around items-center">
                {latest.front_three.map((num, i) => (
                  <div key={i} className="text-center space-y-1 md:space-y-2">
                    <div className="text-4xl md:text-6xl font-black text-slate-800 font-display tracking-tight">
                      {num}
                    </div>
                    <div className="text-[8px] md:text-[10px] font-bold text-slate-300 uppercase">ชุดที่ {i + 1}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                รางวัลละ 4,000 บาท
              </div>
            </motion.div>

            {/* Back 3 Digits */}
            <motion.div 
              variants={item}
              className="md:col-span-6 bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100"
            >
              <div className="flex items-center justify-between mb-4 md:mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">เลขท้าย 3 ตัว</span>
                <Hash className="h-4 w-4 md:h-5 md:w-5 text-slate-200" />
              </div>
              
              <div className="flex justify-around items-center">
                {latest.back_three.map((num, i) => (
                  <div key={i} className="text-center space-y-1 md:space-y-2">
                    <div className="text-4xl md:text-6xl font-black text-slate-800 font-display tracking-tight">
                      {num}
                    </div>
                    <div className="text-[8px] md:text-[10px] font-bold text-slate-300 uppercase">ชุดที่ {i + 1}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                รางวัลละ 4,000 บาท
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Previous Result - Minimal Strip */}
      {previous && (
        <section className="max-w-6xl mx-auto px-4">
          <motion.div 
            variants={item}
            className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">งวดก่อนหน้า</span>
              <h3 className="text-xl font-bold font-display">
                {new Date(previous.draw_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
            </div>
            
            <div className="flex items-center justify-center space-x-6 md:space-x-12">
              <div className="text-center">
                <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">รางวัลที่ 1</span>
                <span className="text-2xl md:text-3xl font-black font-display tracking-tight">{previous.first_prize}</span>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div className="text-center">
                <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">เลขท้าย 2 ตัว</span>
                <span className="text-2xl md:text-3xl font-black font-display tracking-tight text-emerald-400">{previous.last_two}</span>
              </div>
            </div>
            
            <Link 
              to="/previous"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
            >
              ดูทั้งหมด
            </Link>
          </motion.div>
        </section>
      )}

      {!latest && !loading && (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 max-w-4xl mx-auto">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">ยังไม่มีข้อมูลผลรางวัล</h3>
          <p className="text-slate-400">กรุณาตรวจสอบอีกครั้งภายหลัง หรือติดต่อผู้ดูแลระบบ</p>
        </div>
      )}

      {/* Disclaimer Section */}
      <section className="max-w-4xl mx-auto px-4 pt-16">
        <div className="bg-slate-100 rounded-[2.5rem] p-8 md:p-10 border border-slate-200/50">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="bg-white p-4 rounded-[1.5rem] shadow-sm">
              <AlertCircle className="h-8 w-8 text-slate-400" />
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-black text-slate-900 font-display">ข้อควรระวังและคำแนะนำ</h4>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                แอพพลิเคชั่นนี้เป็นเพียงเครื่องมืออำนวยความสะดวกในการตรวจสอบผลรางวัลสลากกินแบ่งรัฐบาลเท่านั้น 
                เราไม่มีส่วนเกี่ยวข้องกับสำนักงานสลากกินแบ่งรัฐบาล (GLO) 
                โปรดตรวจสอบความถูกต้องอีกครั้งกับใบสลากและแหล่งข้อมูลทางการเพื่อความถูกต้อง 100% ก่อนการขึ้นเงินรางวัล
              </p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
