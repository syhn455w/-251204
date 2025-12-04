import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, MapPin, Clock, AlertCircle, TrainFront, ChevronRight, ExternalLink, Save, ArrowRight } from 'lucide-react';
import { fetchTrainSchedule } from './services/geminiService.ts';
import { TrainInfo, TrainType } from './types.ts';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [trains, setTrains] = useState<TrainInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeHHMM = (date: Date) => {
    return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    // Since data is static/hardcoded now, this is nearly instant, 
    // but we keep the async pattern for consistency.
    try {
      const data = await fetchTrainSchedule(new Date());
      setTrains(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const getRelativeTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const trainDate = new Date(currentTime);
    trainDate.setHours(h, m, 0, 0);
    
    // Handle midnight wrapping if train is early morning and now is late night
    if (trainDate.getTime() < currentTime.getTime() - 60000 && h < 2) {
       trainDate.setDate(trainDate.getDate() + 1);
    }

    const diffMs = trainDate.getTime() - currentTime.getTime();
    const diffMins = Math.ceil(diffMs / 60000);

    if (diffMins <= 0) return "即將發車";
    return `約 ${diffMins} 分鐘`;
  };

  // Filter trains: Future trains only
  const upcomingTrains = trains.filter(t => {
     const [h, m] = t.departureTime.split(':').map(Number);
     const trainTime = h * 60 + m;
     const currentTotal = currentTime.getHours() * 60 + currentTime.getMinutes();
     
     // Handle midnight wrap-around (e.g., showing 00:15 trains when it's 23:50)
     if (currentTotal > 23 * 60 && trainTime < 60) return true; // Next day
     if (trainTime < currentTotal && (currentTotal - trainTime) > 2) return false; // Already departed
     return true;
  });

  // Limit display to next 10 trains
  const displayedTrains = upcomingTrains.slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-10 safe-bottom">
      
      {/* Compact Header */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrainFront className="w-6 h-6 text-purple-400" />
            <div>
              <h1 className="font-bold text-lg leading-none">機捷 A1 時刻表</h1>
              <p className="text-[10px] text-slate-400">往 A8長庚 / A9林口</p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-2xl font-mono font-bold leading-none tracking-wide">
               {formatTimeHHMM(currentTime)}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-3 space-y-4">
        
        {/* Controls */}
        <div className="flex justify-between items-center px-1">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-full shadow-sm inline-flex items-center gap-1">
               <Save className="w-3 h-3" />
               已載入官方表定時刻
            </span>
          </div>
          <button 
            onClick={() => loadSchedule()} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 rounded-full text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            強制更新
          </button>
        </div>

        {/* Train List */}
        <div className="space-y-3 pb-8">
          {displayedTrains.length > 0 ? (
            displayedTrains.map((train, idx) => {
              const isExpress = train.type === TrainType.EXPRESS;
              const isFirst = idx === 0;
              
              return (
                <div 
                  key={idx} 
                  className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-300 
                    ${isFirst 
                      ? 'shadow-xl border-2 border-indigo-500 transform scale-[1.02] z-10 mb-6' 
                      : 'shadow-sm border border-slate-200'
                    }`}
                >
                  {isFirst && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse" />
                  )}
                  
                  {/* Card Header: Type & Status */}
                  <div className={`px-4 py-2 flex justify-between items-center ${isExpress ? 'bg-purple-50' : 'bg-blue-50'} ${isFirst ? 'pt-3' : ''}`}>
                    <div className="flex items-center gap-2">
                       <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${isExpress ? 'bg-purple-600' : 'bg-blue-500'}`}>
                        {isExpress ? '直達車' : '普通車'}
                      </span>
                      {isFirst && (
                         <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 animate-pulse">
                           即將進站
                         </span>
                      )}
                    </div>

                    <span className={`text-xs font-bold flex items-center gap-1 ${isExpress ? 'text-purple-700' : 'text-blue-700'}`}>
                      <Clock className="w-3 h-3" />
                      {getRelativeTime(train.departureTime)}後發車
                    </span>
                  </div>

                  {/* Time Grid */}
                  <div className="grid grid-cols-3 divide-x divide-slate-100 py-4">
                    {/* A1 */}
                    <div className="flex flex-col items-center justify-center px-1">
                      <span className="text-[10px] text-slate-400 font-bold mb-1">A1 出發</span>
                      <span className={`font-black font-mono tracking-tighter text-slate-900 ${isFirst ? 'text-3xl' : 'text-2xl'}`}>
                        {train.departureTime}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">台北車站</span>
                    </div>

                    {/* A8 */}
                    <div className="flex flex-col items-center justify-center px-1 bg-slate-50/50">
                      <span className="text-[10px] text-slate-500 font-bold mb-1">A8 抵達</span>
                      <span className={`font-bold font-mono tracking-tighter ${isFirst ? 'text-2xl' : 'text-xl'} ${isExpress ? 'text-purple-700' : 'text-slate-700'}`}>
                        {train.arrivalTimeA8}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">長庚醫院</span>
                    </div>

                    {/* A9 */}
                    <div className="flex flex-col items-center justify-center px-1">
                      <span className="text-[10px] text-slate-400 font-bold mb-1">A9 抵達</span>
                      <span className={`font-bold font-mono tracking-tighter ${isFirst ? 'text-2xl' : 'text-xl'} ${isExpress ? 'text-slate-500' : 'text-slate-700'}`}>
                        {train.arrivalTimeA9 || '-'}
                      </span>
                      <span className={`text-[10px] mt-1 px-1.5 py-0.5 rounded-full ${isExpress ? 'bg-orange-100 text-orange-700' : 'text-slate-400'}`}>
                        {isExpress ? '需轉乘' : '林口'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Next Train Visual Cue for First Item */}
                  {isFirst && (
                    <div className="bg-indigo-50 px-4 py-2 flex items-center justify-center text-indigo-700 text-xs font-bold gap-2">
                       <span>本班次為下一班列車</span>
                       <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
             <div className="text-center py-12 text-slate-400">
                <p>今日營運已結束 (末班車已駛離)</p>
             </div>
          )}
        </div>

        {/* Footer Legend */}
        <div className="text-[10px] text-center text-slate-400 mt-6 pb-4 space-y-2">
          <p>時刻表來源：桃園捷運官方時刻表 (2025)</p>
          <p className="opacity-70">A1 到站時間以實際發車為準，直達車往 A9 需在 A8 轉乘</p>
        </div>
      </main>
    </div>
  );
};

export default App;