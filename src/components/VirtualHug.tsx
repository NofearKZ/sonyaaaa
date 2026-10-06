import React, { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, RefreshCw } from 'lucide-react';
import { sound } from '../utils/audio';

interface VirtualHugProps {
  herName: string;
  hugCount: number;
  onHug: () => void;
}

export const VirtualHug: React.FC<VirtualHugProps> = ({ herName, hugCount, onHug }) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startHold = () => {
    if (completed) return;
    setHolding(true);
    startTimeRef.current = Date.now() - (progress / 100) * 2200;

    const tick = () => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const currentProg = Math.min(100, (elapsed / 2200) * 100);
      setProgress(currentProg);

      // Play soft sound pulse during hold
      if (Math.floor(currentProg) % 25 === 0 && currentProg > 0) {
        sound.playPop(300 + currentProg * 3);
      }

      if (currentProg >= 100) {
        setCompleted(true);
        setHolding(false);
        sound.playChime(1.2);
        onHug();
      } else {
        requestRef.current = requestAnimationFrame(tick);
      }
    };

    requestRef.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    if (completed) return;
    setHolding(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    setProgress(0);
  };

  const resetHug = () => {
    setCompleted(false);
    setProgress(0);
    setHolding(false);
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const circumference = 2 * Math.PI * 72;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <div className="bg-white/80 border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-xs relative overflow-hidden">
        {/* Soft background aura */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-rose-100/40 via-transparent to-pink-100/30 transition-opacity duration-700 pointer-events-none ${
            holding || completed ? 'opacity-100' : 'opacity-20'
          }`}
        />

        <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase mb-2 block">
          Интерактивное объятие
        </span>
        <h3 className="font-display font-bold text-xl sm:text-2xl text-stone-800 mb-2">
          {completed
            ? `Тепло доставлено ${herName ? `для ${herName}` : 'прямо сейчас'}!`
            : 'Зажми кнопку, чтобы отправить обнимашку'}
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto mb-8">
          {completed
            ? 'Почувствуй, как тепло разливается по плечам. Ты в безопасности, тебя любят и ценят.'
            : 'Удерживай палец или курсор на сердечке, пока круг не заполнится на 100%'}
        </p>

        {/* Central Button & Ring */}
        <div className="relative inline-flex items-center justify-center my-4">
          <svg className="w-48 h-48 -rotate-90">
            {/* Background ring */}
            <circle
              cx="96"
              cy="96"
              r="72"
              stroke="#F3F4F6"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="96"
              cy="96"
              r="72"
              stroke="#FB7185"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-75"
            />
          </svg>

          {/* Interactive Core */}
          <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            disabled={completed}
            className={`absolute w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-md select-none touch-none cursor-pointer ${
              completed
                ? 'bg-rose-500 text-white scale-105'
                : holding
                ? 'bg-rose-500 text-white scale-95 shadow-inner'
                : 'bg-rose-50 text-rose-600 hover:bg-rose-100/80 hover:scale-102'
            }`}
          >
            <Heart
              className={`w-12 h-12 transition-transform duration-200 ${
                holding
                  ? 'animate-pulse scale-125 fill-current'
                  : completed
                  ? 'scale-110 fill-current'
                  : 'group-hover:scale-110'
              }`}
            />
            <span className="text-xs font-bold mt-1">
              {completed ? '100% Тепла' : holding ? `${Math.round(progress)}%` : 'Зажми меня'}
            </span>
          </button>
        </div>

        {/* Post-hug action / message */}
        {completed ? (
          <div className="mt-6 flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-rose-700 font-medium bg-rose-50 px-3 py-1.5 rounded-lg mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Окутана заботой и сохранено в базе данных</span>
            </div>
            <button
              onClick={resetHug}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Обнять еще раз</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 text-xs text-stone-400">
            {holding ? 'Не отпускай...' : 'Удерживай 2-3 секунды'}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-center gap-2 text-xs text-stone-500">
          <span>Всего сохранено теплых объятий:</span>
          <span className="font-bold text-stone-800 font-mono tabular-nums">{hugCount}</span>
        </div>
      </div>
    </div>
  );
};
