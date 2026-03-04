import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">นโยบายความเป็นส่วนตัว (Privacy Policy)</h1>
        <p className="text-slate-500">ปรับปรุงล่าสุดเมื่อ: {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 space-y-10">
        <section className="space-y-4">
          <div className="flex items-center space-x-3 text-logo-primary">
            <Shield className="h-6 w-6" />
            <h2 className="text-xl font-black">1. ข้อมูลที่เราเก็บรวบรวม</h2>
          </div>
          <div className="pl-9 space-y-3 text-slate-600 leading-relaxed">
            <p>เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ ข้อมูลที่เราอาจเก็บรวบรวม ได้แก่:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>ข้อมูลการใช้งาน:</strong> เช่น หมายเลข IP, ประเภทเบราว์เซอร์, และหน้าเว็บที่คุณเข้าชม เพื่อปรับปรุงประสบการณ์การใช้งาน</li>
              <li><strong>ข้อมูลคุกกี้:</strong> เราใช้คุกกี้เพื่อจดจำการตั้งค่าของคุณและเพื่อวัตถุประสงค์ในการโฆษณา</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center space-x-3 text-logo-primary">
            <Lock className="h-6 w-6" />
            <h2 className="text-xl font-black">2. การใช้ข้อมูล</h2>
          </div>
          <div className="pl-9 space-y-3 text-slate-600 leading-relaxed">
            <p>เราใช้ข้อมูลที่เก็บรวบรวมเพื่อ:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>ให้บริการและปรับปรุงประสิทธิภาพของแอปพลิเคชัน</li>
              <li>แสดงโฆษณาที่เกี่ยวข้องผ่านทาง Google AdMob</li>
              <li>วิเคราะห์สถิติการใช้งานเพื่อพัฒนาฟีเจอร์ใหม่ๆ</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center space-x-3 text-logo-primary">
            <Eye className="h-6 w-6" />
            <h2 className="text-xl font-black">3. การโฆษณา (Google AdMob)</h2>
          </div>
          <div className="pl-9 space-y-3 text-slate-600 leading-relaxed">
            <p>แอปพลิเคชันนี้ใช้ Google AdMob เพื่อแสดงโฆษณา:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Google อาจใช้คุกกี้เพื่อแสดงโฆษณาตามการเข้าชมเว็บไซต์นี้หรือเว็บไซต์อื่นๆ ของผู้ใช้</li>
              <li>ผู้ใช้สามารถเลือกไม่รับการโฆษณาที่ปรับให้เหมาะกับบุคคลได้โดยไปที่ <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-logo-primary underline">การตั้งค่าโฆษณาของ Google</a></li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center space-x-3 text-logo-primary">
            <FileText className="h-6 w-6" />
            <h2 className="text-xl font-black">4. การรักษาความปลอดภัย</h2>
          </div>
          <div className="pl-9 text-slate-600 leading-relaxed">
            <p>เราใช้มาตรการทางเทคนิคที่เหมาะสมเพื่อปกป้องข้อมูลของคุณจากการเข้าถึงโดยไม่ได้รับอนุญาต อย่างไรก็ตาม การส่งข้อมูลผ่านอินเทอร์เน็ตไม่มีความปลอดภัย 100% เราจึงไม่สามารถรับประกันความปลอดภัยได้อย่างสมบูรณ์</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center space-x-3 text-logo-primary">
            <h2 className="text-xl font-black">5. การติดต่อเรา</h2>
          </div>
          <div className="pl-9 text-slate-600 leading-relaxed">
            <p>หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ โปรดติดต่อเราผ่านทางช่องทางที่ระบุไว้ในแอปพลิเคชัน</p>
          </div>
        </section>
      </div>

      <div className="text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} ตรวจหวยวันนี้. สงวนลิขสิทธิ์.</p>
      </div>
    </motion.div>
  );
}
