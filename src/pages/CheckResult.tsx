import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLotteryStore } from '../store/useLotteryStore';
import { motion } from 'motion/react';
import { Search, Camera, X, CheckCircle2, AlertCircle, RefreshCw, QrCode, ChevronDown, Plus, Minus } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function CheckResult() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'single' | 'multiple'>('single');
  const [number, setNumber] = useState('');

  useEffect(() => {
    const m = searchParams.get('mode');
    if (m === 'multiple') setMode('multiple');
    else setMode('single');
  }, [searchParams]);
  const [numbers, setNumbers] = useState<string[]>(['', '', '']);
  const [result, setResult] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [draws, setDraws] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const scannerRef = useRef<any>(null);

  const { checkResult, fetchAllDraws } = useLotteryStore();

  useEffect(() => {
    const loadDraws = async () => {
      const { data } = await fetchAllDraws(1, 100);
      setDraws(data);
      if (data.length > 0) {
        setSelectedDate(data[0].draw_date);
      }
    };
    loadDraws();
  }, [fetchAllDraws]);

  const handleCheck = async (e?: React.FormEvent, overrideNumber?: string) => {
    if (e) e.preventDefault();
    
    if (mode === 'single') {
      const targetNumber = overrideNumber || number;
      if (targetNumber.length !== 6) {
        setError('กรุณากรอกหมายเลขให้ครบ 6 หลัก');
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const data = await checkResult(targetNumber, selectedDate);
        if (data.error) {
          setError(data.error);
        } else {
          setResult(data);
        }
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล');
      } finally {
        setLoading(false);
      }
    } else {
      const validNumbers = numbers.filter(n => n.length === 6);
      if (validNumbers.length === 0) {
        setError('กรุณากรอกหมายเลข 6 หลักอย่างน้อย 1 ชุด');
        return;
      }

      setLoading(true);
      setError(null);
      setResults([]);

      try {
        const checkPromises = validNumbers.map(n => checkResult(n, selectedDate));
        const data = await Promise.all(checkPromises);
        setResults(data);
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล');
      } finally {
        setLoading(false);
      }
    }
  };

  const addNumberField = () => {
    if (numbers.length < 10) {
      setNumbers([...numbers, '']);
    }
  };

  const updateNumber = (index: number, value: string) => {
    const newNumbers = [...numbers];
    newNumbers[index] = value.replace(/\D/g, '').substring(0, 6);
    setNumbers(newNumbers);
  };

  const removeNumberField = (index: number) => {
    if (numbers.length > 1) {
      const newNumbers = numbers.filter((_, i) => i !== index);
      setNumbers(newNumbers);
    }
  };

  const startScanner = () => {
    setShowScanner(true);
    setResult(null);
    setError(null);
    
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          "reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          /* verbose= */ false
        );
        
        scanner.render((decodedText) => {
          const urlParams = new URLSearchParams(decodedText.split('?')[1]);
          const qrNumber = urlParams.get('number') || decodedText.match(/\d{6}/)?.[0];
          
          if (qrNumber && qrNumber.length === 6) {
            setNumber(qrNumber);
            scanner.clear().then(() => {
              setShowScanner(false);
              handleCheck(undefined, qrNumber);
            }).catch(err => {
              console.error("Failed to clear scanner", err);
              setShowScanner(false);
            });
          }
        }, (err) => {
          // Scanning...
        });
        scannerRef.current = scanner;
      } catch (err) {
        console.error("Scanner init error", err);
        setError("ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบการอนุญาตสิทธิ์");
        setShowScanner(false);
      }
    }, 300);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setShowScanner(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 pb-20"
    >
      {/* Green Header */}
      <div className="bg-emerald-600 pt-12 pb-24 px-6 text-center text-white">
        <h1 className="text-5xl font-black mb-2 tracking-tight">ตรวจหวย</h1>
        <div className="flex justify-center mt-6">
          <div className="bg-white/20 p-1 rounded-2xl backdrop-blur-md flex">
            <button
              onClick={() => setMode('single')}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                mode === 'single' ? 'bg-white text-emerald-600 shadow-lg' : 'text-white hover:bg-white/10'
              }`}
            >
              ใบเดียว
            </button>
            <button
              onClick={() => setMode('multiple')}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                mode === 'multiple' ? 'bg-white text-emerald-600 shadow-lg' : 'text-white hover:bg-white/10'
              }`}
            >
              หลายใบ
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto -mt-16 px-4 space-y-6">
        {mode === 'single' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={startScanner}
            className="w-full bg-white border-2 border-emerald-500 rounded-[2rem] py-4 flex items-center justify-center space-x-3 shadow-xl shadow-emerald-500/10 group"
          >
            <div className="p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <QrCode className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-xl font-black text-emerald-600">สแกน QR Code</span>
          </motion.button>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-8 border border-slate-100">
          <div className="space-y-4">
            <div className="text-center">
              <label className="text-sm font-black text-slate-900 mb-2 block">เลือกงวดสลาก</label>
              <div className="relative">
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full appearance-none bg-emerald-500 text-white font-black py-3 px-6 rounded-full text-center focus:outline-none shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {draws.map((draw) => (
                    <option key={draw.id} value={draw.draw_date}>
                      งวดวันที่ {new Date(draw.draw_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <form onSubmit={handleCheck} className="space-y-6">
              {mode === 'single' ? (
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={number}
                      onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="ค้นหาเลขรางวัล..."
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold placeholder:text-slate-300"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || number.length !== 6}
                    className="bg-emerald-500 text-white px-6 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'ค้นหา'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {numbers.map((num, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex-grow">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={num}
                          onChange={(e) => updateNumber(index, e.target.value)}
                          placeholder={`ฉบับที่ ${index + 1}`}
                          className="w-full bg-slate-50 border-none rounded-2xl py-3 px-6 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold placeholder:text-slate-300"
                        />
                      </div>
                      {numbers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeNumberField(index)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {numbers.length < 10 && (
                    <button
                      type="button"
                      onClick={addNumberField}
                      className="w-full py-3 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 font-bold text-sm hover:border-emerald-200 hover:text-emerald-500 transition-all flex items-center justify-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>เพิ่มฉบับถัดไป</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={loading || numbers.every(n => n.length !== 6)}
                    className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center space-x-3"
                  >
                    {loading ? (
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <Search className="h-6 w-6" />
                        <span>ตรวจสอบทั้งหมด</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {mode === 'single' && result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pt-4 border-t border-slate-50"
            >
              <div className="text-center space-y-2">
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                  ผลรางวัลประจำงวดวันที่ {new Date(result.draw_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="text-7xl md:text-8xl font-black text-orange-500 tracking-tighter font-display">
                  {result.first_prize || number}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">รางวัลที่ 1</p>
                  <p className="text-slate-500 font-bold">รางวัลละ 6,000,000 บาท</p>
                </div>
              </div>

              {/* Prize Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase">เลขหน้า 3 ตัว</span>
                  <div className="text-xl font-black text-slate-900 flex flex-col">
                    {result.front_three?.map((n: string, i: number) => <span key={i}>{n}</span>)}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">฿ 4,000</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase">เลขท้าย 3 ตัว</span>
                  <div className="text-xl font-black text-slate-900 flex flex-col">
                    {result.back_three?.map((n: string, i: number) => <span key={i}>{n}</span>)}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">฿ 4,000</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase">เลขท้าย 2 ตัว</span>
                  <div className="text-xl font-black text-slate-900 mt-auto">
                    {result.last_two}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">฿ 2,000</div>
                </div>
              </div>

              {result.is_winner ? (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] text-center space-y-2">
                  <div className="flex justify-center mb-2">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-900">ยินดีด้วย!</h3>
                  <p className="text-emerald-700 font-bold">คุณถูกรางวัลสลากกินแบ่ง</p>
                  <div className="text-3xl font-black text-emerald-600 mt-2">
                    {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(result.total_prize)}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] text-center space-y-2">
                  <div className="flex justify-center mb-2">
                    <AlertCircle className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">เสียใจด้วย</h3>
                  <p className="text-slate-500 font-bold">คุณไม่ถูกรางวัลในงวดนี้</p>
                  <p className="text-xs text-slate-400">พยายามใหม่อีกครั้งในงวดหน้า!</p>
                </div>
              )}

              <Link 
                to="/previous"
                className="block w-full py-4 border-2 border-emerald-100 rounded-2xl text-emerald-600 font-black text-sm hover:bg-emerald-50 transition-all text-center"
              >
                ตรวจผลสลากงวดนี้ทั้งหมด
              </Link>
            </motion.div>
          )}

          {mode === 'multiple' && results.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-4 border-t border-slate-50"
            >
              <div className="flex justify-between items-end mb-4">
                <h4 className="text-sm font-black text-slate-900">ผลการตรวจสอบ</h4>
                <p className="text-[10px] font-bold text-emerald-600">
                  งวดวันที่ {new Date(results[0].draw_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="space-y-3">
                {results.map((res, i) => (
                  <div 
                    key={i}
                    className={`p-4 rounded-2xl flex items-center justify-between ${
                      res.is_winner ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-xl font-black text-slate-900 font-display tracking-wider">
                        {res.number}
                      </div>
                      {res.is_winner && (
                        <div className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                          ถูกรางวัล
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {res.is_winner ? (
                        <div className="text-emerald-600 font-black">
                          ฿ {new Intl.NumberFormat('th-TH').format(res.total_prize)}
                        </div>
                      ) : (
                        <div className="text-slate-300 text-xs font-bold">ไม่ถูกรางวัล</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {results.some(r => r.is_winner) && (
                <div className="mt-6 p-6 bg-emerald-600 rounded-[2rem] text-white text-center shadow-xl shadow-emerald-600/20">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">รวมเงินรางวัลทั้งหมด</p>
                  <p className="text-4xl font-black font-display">
                    ฿ {new Intl.NumberFormat('th-TH').format(results.reduce((sum, r) => sum + (r.total_prize || 0), 0))}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {showScanner && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={stopScanner}
              className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="p-8 space-y-4">
              <h3 className="text-xl font-bold text-center">สแกน QR Code</h3>
              <div id="reader" className="w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden"></div>
              <p className="text-sm text-slate-500 text-center">วางคิวอาร์โค้ดบนใบสลากให้อยู่ในกรอบ</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
