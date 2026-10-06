import React from 'react';
import { Check, Droplets, Utensils, Wind, Sparkles, Coffee, Heart } from 'lucide-react';
import { CareItem } from '../types';
import { sound } from '../utils/audio';

interface CareChecklistProps {
  initialItems: CareItem[];
  checkedIds: string[];
  onToggleCare: (id: string) => void;
  herName: string;
}

export const CareChecklist: React.FC<CareChecklistProps> = ({
  initialItems,
  checkedIds,
  onToggleCare,
  herName,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets': return <Droplets className="w-4 h-4 text-sky-500" />;
      case 'Utensils': return <Utensils className="w-4 h-4 text-amber-500" />;
      case 'Wind': return <Wind className="w-4 h-4 text-teal-500" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'Coffee': return <Coffee className="w-4 h-4 text-orange-500" />;
      default: return <Heart className="w-4 h-4 text-rose-500" />;
    }
  };

  const handleToggle = (id: string) => {
    const isCurrentlyDone = checkedIds.includes(id);
    if (!isCurrentlyDone) {
      sound.playChime(1.2);
    } else {
      sound.playPop(300);
    }
    onToggleCare(id);
  };

  const doneCount = initialItems.filter((i) => checkedIds.includes(i.id)).length;
  const isAllDone = doneCount === initialItems.length;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/80 border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase">
              Маленькие шаги
            </span>
            <h3 className="font-display font-bold text-lg sm:text-xl text-stone-800">
              Чек-лист нежной заботы
            </h3>
          </div>
          <span className="text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-full font-mono tabular-nums">
            {doneCount} / {initialItems.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-300"
            style={{ width: `${(doneCount / initialItems.length) * 100}%` }}
          />
        </div>

        {isAllDone && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs font-medium text-emerald-800 animate-fadeIn">
            🌿 {herName ? `${herName}, ты` : 'Ты'} сегодня потрясающе позаботилась о себе! Все пункты выполнены!
          </div>
        )}

        <div className="space-y-3">
          {initialItems.map((item) => {
            const isDone = checkedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleToggle(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleToggle(item.id);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 text-left ${
                  isDone
                    ? 'bg-rose-50/40 border-rose-200 text-stone-500'
                    : 'bg-white hover:bg-stone-50/80 border-stone-200/80 text-stone-800 shadow-2xs'
                }`}
              >
                <div
                  className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                    isDone
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'bg-stone-50 border-stone-300 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getIcon(item.iconName)}
                    <span className={`text-xs sm:text-sm font-semibold ${isDone ? 'line-through text-stone-400' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                  {isDone && (
                    <p className="text-xs text-rose-600 mt-1 font-medium animate-fadeIn">
                      {item.sweetMessage}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
