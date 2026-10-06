import React, { useState } from 'react';
import { Sparkles, RefreshCw, Coffee, Film, Heart } from 'lucide-react';
import { COZY_ACTIVITIES } from '../data/defaultContent';
import { sound } from '../utils/audio';

export const CozyDecider: React.FC = () => {
  const [selectedActivity, setSelectedActivity] = useState<typeof COZY_ACTIVITIES[0] | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollActivity = () => {
    sound.playPop(340);
    setIsRolling(true);

    let count = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * COZY_ACTIVITIES.length);
      setSelectedActivity(COZY_ACTIVITIES[randomIdx]);
      sound.playPop(420 + count * 20);
      count++;

      if (count > 7) {
        clearInterval(interval);
        setIsRolling(false);
        sound.playChime(1.15);
      }
    }, 70);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white/80 border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs text-center">
        <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase">
          Генератор уюта
        </span>
        <h3 className="font-display font-bold text-lg sm:text-xl text-stone-800 mt-1 mb-2">
          «Чем порадовать себя прямо сейчас?»
        </h3>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mb-6">
          Когда сложно выбрать или нет сил думать — нажми кнопку, и пусть случай подскажет уютное занятие.
        </p>

        {selectedActivity ? (
          <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-6 mb-6 animate-scaleIn">
            <span className="text-4xl mb-3 block">{selectedActivity.icon}</span>
            <h4 className="font-display font-bold text-base sm:text-lg text-stone-800 mb-1">
              {selectedActivity.title}
            </h4>
            <p className="text-xs sm:text-sm text-stone-600">{selectedActivity.hint}</p>
          </div>
        ) : (
          <div className="bg-stone-50 border border-dashed border-stone-200 rounded-2xl p-6 mb-6 flex flex-col items-center justify-center">
            <span className="text-3xl mb-2">✨</span>
            <p className="text-xs text-stone-500">Нажми на кнопку ниже, чтобы получить подсказку</p>
          </div>
        )}

        <button
          onClick={rollActivity}
          disabled={isRolling}
          className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 mx-auto cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
          <span>{selectedActivity ? 'Выбрать что-то другое' : 'Сделать выбор за меня'}</span>
        </button>
      </div>
    </div>
  );
};
