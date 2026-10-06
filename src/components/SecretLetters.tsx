import React, { useState } from 'react';
import { Mail, Sparkles, X, ChevronRight } from 'lucide-react';
import { SECRET_LETTERS_DATA } from '../data/defaultContent';
import { sound } from '../utils/audio';

interface SecretLettersProps {
  herName: string;
}

export const SecretLetters: React.FC<SecretLettersProps> = ({ herName }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedLetter = SECRET_LETTERS_DATA.find((l) => l.id === selectedId);

  const handleOpen = (id: string) => {
    sound.playChime(1.15);
    setSelectedId(id);
  };

  const handleClose = () => {
    sound.playPop(380);
    setSelectedId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase">
          Личные послания
        </span>
        <h3 className="font-display font-bold text-xl sm:text-2xl text-stone-800 mt-1">
          Конверты «Открой, когда...»
        </h3>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1">
          Каждый конверт предназначен для особенного настроения. Выбери тот, который откликается прямо сейчас.
        </p>
      </div>

      {/* Grid of Envelopes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECRET_LETTERS_DATA.map((letter) => {
          const isOpened = selectedId === letter.id;
          return (
            <div
              key={letter.id}
              onClick={() => handleOpen(letter.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleOpen(letter.id);
              }}
              className={`p-6 rounded-2xl border transition-all text-left cursor-pointer group bg-gradient-to-br ${letter.color} ${
                isOpened
                  ? 'ring-2 ring-rose-400 shadow-md scale-[1.01]'
                  : 'hover:shadow-sm hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{letter.icon}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/70 text-stone-700 shadow-2xs">
                  {isOpened ? 'Открыто' : 'Запечатано'}
                </span>
              </div>
              <h4 className="font-display font-bold text-base text-stone-800 mb-1 group-hover:text-rose-700 transition-colors">
                {letter.trigger}
              </h4>
              <p className="text-xs text-stone-600 line-clamp-2">
                {letter.title}
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-rose-600 group-hover:translate-x-1 transition-transform">
                <span>Прочитать письмо</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded letter modal / drawer */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-amber-50/95 border border-amber-200 rounded-3xl p-6 sm:p-10 max-w-lg w-full shadow-xl relative animate-scaleIn">
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 bg-white/60 hover:bg-white transition-colors"
              title="Закрыть письмо"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>{selectedLetter.trigger}</span>
            </div>

            <h3 className="font-display font-bold text-xl text-stone-800 mb-6">
              {selectedLetter.title}
            </h3>

            <div className="bg-white/80 border border-amber-100 rounded-2xl p-6 mb-6 shadow-2xs">
              <p className="font-handwriting text-2xl sm:text-3xl text-stone-800 leading-relaxed">
                {herName ? `Милая ${herName}! ` : ''}
                {selectedLetter.content}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-amber-200/50">
              <span className="italic">Всегда на твоей стороне</span>
              <button
                onClick={handleClose}
                className="px-4 py-2 font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
              >
                Спрятать в конверт
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
