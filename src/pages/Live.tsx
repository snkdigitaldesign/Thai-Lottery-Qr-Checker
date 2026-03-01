import React from 'react';
import { motion } from 'motion/react';
import { Tv, AlertCircle, ExternalLink } from 'lucide-react';

export default function Live() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">ถ่ายทอดสดการออกรางวัล</h1>
        <p className="text-slate-500">รับชมการถ่ายทอดสดผลการออกสลากกินแบ่งรัฐบาล</p>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="aspect-video bg-slate-900 relative">
          {/* YouTube Embed for GLO Official Channel Live */}
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/live_stream?channel=UCpD6_oY8o_L6N8S_3V6_m9g"
            title="GLO Live Stream"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        
        <div className="p-10 space-y-8">
          <div className="flex items-start space-x-5 p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem]">
            <AlertCircle className="h-7 w-7 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-black text-emerald-900 text-lg">ข้อมูลการถ่ายทอดสด</h3>
              <p className="text-sm text-emerald-700 leading-relaxed font-medium">
                การออกรางวัลสลากกินแบ่งรัฐบาลจะเริ่มถ่ายทอดสดในเวลาประมาณ 14:30 น. ของทุกวันที่ 1 และ 16 ของเดือน 
                (หรือตามวันที่สำนักงานสลากฯ กำหนด)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.a 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="https://www.youtube.com/@GloOfficialChannel/streams" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center space-x-3 bg-slate-900 text-white px-8 py-5 rounded-[1.5rem] font-black hover:bg-slate-800 transition-all shadow-xl"
            >
              <ExternalLink className="h-6 w-6" />
              <span>ดูบน YouTube</span>
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="https://www.glo.or.th" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center space-x-3 bg-white border-2 border-slate-100 text-slate-900 px-8 py-5 rounded-[1.5rem] font-black hover:bg-slate-50 transition-all"
            >
              <Tv className="h-6 w-6" />
              <span>เว็บไซต์ GLO</span>
            </motion.a>
          </div>
        </div>
      </div>

      <div className="text-center text-slate-400 text-sm">
        <p>* ข้อมูลการถ่ายทอดสดอาจมีการเปลี่ยนแปลงตามประกาศของสำนักงานสลากกินแบ่งรัฐบาล</p>
      </div>
    </motion.div>
  );
}
