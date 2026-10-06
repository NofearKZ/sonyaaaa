import React, { useState } from 'react';
import { RefreshCw, Heart } from 'lucide-react';
import { sound } from '../utils/audio';

interface Bubble {
  id: number;
  popped: boolean;
  word: string;
}

const WORDS = [
  'Умница ✨', 'Красотка 🌸', 'Спокойствие 🌿', 'Любимая 💖',
  'Уют ☕', 'Нежность ☁️', 'Отдых 🛋️', 'Свет ☀️',
  'Улыбка 😊', 'Гармония 🍃', 'Вдохновение 🎨', 'Тепло 🧣',
  'Счастье 🍀', 'Все получится 💫', 'Ты прекрасна 🌷', 'Обнимаю 🧸'
];

interface StressReliefProps {
  petCount: number;
  onPetCat: () => void;
}

export const StressRelief: React.FC<StressReliefProps> = ({ petCount, onPetCat }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>(() =>
    WORDS.map((w, i) => ({ id: i, popped: false, word: w }))
  );
  const [catHearts, setCatHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const handlePop = (id: number) => {
    setBubbles((prev) =>
      prev.map((b) => {
        if (b.id === id && !b.popped) {
          sound.playPop(400 + (id % 8) * 45);
          return { ...b, popped: true };
        }
        return b;
      })
    );
  };

  const handleResetBubbles = () => {
    sound.playChime(1.1);
    setBubbles((prev) => prev.map((b) => ({ ...b, popped: false })));
  };

  const handlePetCatClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    sound.playPurr();
    onPetCat();

    const newHeart = { id: Date.now() + Math.random(), x, y };
    setCatHearts((prev) => [...prev.slice(-6), newHeart]);

    setTimeout(() => {
      setCatHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
  };

  const allPopped = bubbles.every((b) => b.popped);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      {/* Block 1: Bubble Popper */}
      <div className="bg-white/80 border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-stone-800">
              Пузырьки хорошего настроения
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Лопай пузырьки, чтобы снять напряжение и открыть теплые слова
            </p>
          </div>
          <button
            onClick={handleResetBubbles}
            className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Надуть заново</span>
          </button>
        </div>

        {allPopped && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-center text-xs font-semibold text-rose-700 animate-fadeIn">
            🎉 Все пузырьки лопнуты! Ты со всем справишься, пусть этот день будет лёгким!
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {bubbles.map((b) => (
            <button
              key={b.id}
              onClick={() => handlePop(b.id)}
              className={`h-20 rounded-2xl flex items-center justify-center p-3 text-center transition-all duration-200 select-none cursor-pointer ${
                b.popped
                  ? 'bg-rose-50/70 border border-rose-100 text-stone-700 shadow-inner scale-95 font-medium text-xs'
                  : 'bg-gradient-to-br from-pink-50 to-rose-100/60 border border-pink-200/80 text-rose-800/40 shadow-xs hover:scale-102 hover:shadow-sm font-bold text-lg'
              }`}
            >
              {b.popped ? (
                <span className="leading-tight animate-scaleIn">{b.word}</span>
              ) : (
                <span className="w-8 h-8 rounded-full bg-white/70 shadow-inner flex items-center justify-center text-xs text-rose-400">
                  ●
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Block 2: Pet the sleeping cat */}
      <div className="bg-amber-50/50 border border-amber-200/70 rounded-3xl p-6 sm:p-8 shadow-xs text-center">
        <h3 className="font-display font-bold text-lg sm:text-xl text-stone-800 mb-1">
          Погладь спящего котика
        </h3>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-6">
          Кликай по котику: он довольно замурчит и подарит сердечки
        </p>

        <div
          onClick={handlePetCatClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handlePetCatClick(e as unknown as React.MouseEvent<HTMLDivElement>);
          }}
          className="relative inline-block cursor-pointer select-none group focus:outline-none"
        >
          {/* Animated hearts when petted */}
          {catHearts.map((heart) => (
            <div
              key={heart.id}
              style={{ left: heart.x, top: heart.y }}
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-floatUp text-rose-500"
            >
              <Heart className="w-5 h-5 fill-current" />
            </div>
          ))}

          {/* Stylized sleeping cat SVG */}
          <svg
            className="w-52 h-40 sm:w-64 sm:h-48 mx-auto drop-shadow-sm group-hover:scale-105 transition-transform"
            viewBox="0 0 240 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft cushion */}
            <ellipse cx="120" cy="140" rx="90" ry="25" fill="#E9ECEF" stroke="#CED4DA" strokeWidth="2" />

            {/* Sleeping Cat Body */}
            <ellipse cx="120" cy="115" rx="60" ry="40" fill="#FFCDB2" />
            {/* Fur texture stripes */}
            <path d="M100 85 Q115 100 105 125" stroke="#E5989B" strokeWidth="3" strokeLinecap="round" />
            <path d="M125 80 Q138 98 130 120" stroke="#E5989B" strokeWidth="3" strokeLinecap="round" />
            <path d="M145 88 Q155 105 148 122" stroke="#E5989B" strokeWidth="3" strokeLinecap="round" />

            {/* Head */}
            <circle cx="80" cy="105" r="32" fill="#FFCDB2" />
            {/* Ears */}
            <polygon points="60,85 70,60 82,82" fill="#E5989B" />
            <polygon points="63,82 71,66 79,80" fill="#FFB4A2" />
            <polygon points="85,82 98,62 105,86" fill="#E5989B" />
            <polygon points="88,80 97,68 102,83" fill="#FFB4A2" />

            {/* Sleeping eyes */}
            <path d="M68 108 Q74 114 80 108" stroke="#6D6875" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M88 108 Q94 114 100 108" stroke="#6D6875" strokeWidth="2.5" strokeLinecap="round" />

            {/* Little pink nose & mouth */}
            <polygon points="83,115 87,115 85,118" fill="#B5838D" />
            <path d="M82 121 Q85 124 88 121" stroke="#6D6875" strokeWidth="1.5" strokeLinecap="round" />

            {/* Rosy cheeks */}
            <circle cx="68" cy="114" r="5" fill="#FFB4A2" opacity="0.7" />
            <circle cx="100" cy="114" r="5" fill="#FFB4A2" opacity="0.7" />

            {/* Curled Tail */}
            <path
              d="M175 120 C195 110, 190 85, 175 90 C165 93, 168 110, 172 125"
              stroke="#FFCDB2"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <circle cx="178" cy="90" r="5" fill="#E5989B" />

            {/* Zzz floating symbols */}
            <text x="50" y="55" fill="#B5838D" fontSize="14" fontFamily="sans-serif" fontWeight="bold">z</text>
            <text x="42" y="42" fill="#B5838D" fontSize="11" fontFamily="sans-serif">z</text>
            <text x="36" y="32" fill="#B5838D" fontSize="9" fontFamily="sans-serif">z</text>
          </svg>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500">
          <span>Ты погладила котика:</span>
          <span className="font-bold text-stone-800 font-mono tabular-nums">{petCount}</span>
          <span>раз</span>
        </div>
      </div>
    </div>
  );
};
