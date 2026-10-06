import React, { useState } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Heart, PlusCircle, ArrowRight } from 'lucide-react';
import { NoteItem } from '../types';
import { sound } from '../utils/audio';

interface NoteJarProps {
  notes: NoteItem[];
  herName: string;
  onAddCustomNote: (text: string, category: NoteItem['category']) => void;
}

export const NoteJar: React.FC<NoteJarProps> = ({ notes, herName, onAddCustomNote }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentNote, setCurrentNote] = useState<NoteItem | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<NoteItem['category']>('compliment');

  const filteredNotes = selectedCategory === 'all'
    ? notes
    : notes.filter((n) => n.category === selectedCategory);

  const pullRandomNote = () => {
    sound.playPop(350);
    setIsShaking(true);
    setCopied(false);

    setTimeout(() => {
      setIsShaking(false);
      const pool = filteredNotes.length > 0 ? filteredNotes : notes;
      const otherNotes = pool.filter((n) => !currentNote || n.id !== currentNote.id);
      const chosen = otherNotes.length > 0
        ? otherNotes[Math.floor(Math.random() * otherNotes.length)]
        : pool[0];

      setCurrentNote(chosen);
      sound.playChime(1.1);
    }, 400);
  };

  const copyNote = () => {
    if (!currentNote) return;
    navigator.clipboard.writeText(currentNote.text);
    setCopied(true);
    sound.playPop(520);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddCustomNote(newNoteText.trim(), newNoteCategory);
    setNewNoteText('');
    setShowAddForm(false);
    sound.playChime(1.3);
  };

  const categoryLabels: Record<string, string> = {
    all: 'Все записки',
    compliment: 'Комплименты',
    support: 'Поддержка',
    reminder: 'Забота',
    smile: 'Для улыбки',
    sweet: 'Нежность',
  };

  return (
    <div className="w-full">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-stone-100/80 rounded-xl max-w-xl mx-auto mb-8 border border-stone-200/60">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setSelectedCategory(key);
              sound.playPop(420);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedCategory === key
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
        {/* Left: The Interactive Jar */}
        <div className="lg:col-span-5 flex flex-col items-center text-center">
          <div
            onClick={pullRandomNote}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                pullRandomNote();
              }
            }}
            className={`relative cursor-pointer select-none transition-transform duration-300 group ${
              isShaking ? 'animate-bounce' : 'hover:scale-[1.02]'
            }`}
            title="Нажми на баночку, чтобы достать записку!"
          >
            {/* Ambient glow behind jar */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-rose-200/40 via-amber-100/30 to-purple-100/40 rounded-full blur-xl -z-10 group-hover:opacity-100 transition-opacity" />

            {/* Stylized SVG Jar */}
            <svg
              className="w-56 h-72 sm:w-64 sm:h-80 drop-shadow-md mx-auto"
              viewBox="0 0 200 260"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Wooden / Cork Lid */}
              <rect x="65" y="10" width="70" height="14" rx="4" fill="#D4A373" />
              <rect x="68" y="8" width="64" height="6" rx="2" fill="#BC6C25" />
              {/* Ribbon around neck */}
              <rect x="62" y="24" width="76" height="8" rx="2" fill="#E29578" />
              <path
                d="M100 28 L92 42 M100 28 L108 42"
                stroke="#BC6C25"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Glass Body */}
              <rect
                x="40"
                y="32"
                width="120"
                height="215"
                rx="24"
                fill="url(#glassGrad)"
                stroke="#E5E7EB"
                strokeWidth="2.5"
              />

              {/* Reflection Highlight */}
              <path
                d="M52 48 C52 48, 50 180, 50 220"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.6"
              />

              {/* Little folded notes inside */}
              <g className="transition-transform duration-500">
                {/* Note 1 */}
                <rect x="60" y="180" width="36" height="22" rx="3" fill="#FDE2E4" transform="rotate(-15 60 180)" />
                {/* Note 2 */}
                <rect x="110" y="195" width="34" height="20" rx="3" fill="#FFF1E6" transform="rotate(20 110 195)" />
                {/* Note 3 */}
                <rect x="80" y="160" width="38" height="24" rx="3" fill="#E2ECE9" transform="rotate(5 80 160)" />
                {/* Note 4 */}
                <rect x="115" y="145" width="32" height="22" rx="3" fill="#DFE7FD" transform="rotate(-25 115 145)" />
                {/* Note 5 */}
                <rect x="58" y="125" width="36" height="22" rx="3" fill="#FAD2E1" transform="rotate(18 58 125)" />
                {/* Note 6 */}
                <rect x="95" y="110" width="34" height="24" rx="3" fill="#FFDDD2" transform="rotate(-10 95 110)" />
                {/* Note 7 */}
                <rect x="75" y="80" width="36" height="22" rx="3" fill="#E2ECE9" transform="rotate(12 75 80)" />
              </g>

              {/* Jar Tag */}
              <rect x="65" y="130" width="70" height="42" rx="5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1" />
              <text x="100" y="148" textAnchor="middle" fill="#881337" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                ДЛЯ ТЕБЯ
              </text>
              <text x="100" y="162" textAnchor="middle" fill="#9CA3AF" fontSize="8" fontFamily="sans-serif">
                {filteredNotes.length} записок
              </text>

              {/* Glass Gradient */}
              <defs>
                <linearGradient id="glassGrad" x1="40" y1="32" x2="160" y2="247" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" stopOpacity="0.85" />
                  <stop offset="0.7" stopColor="#F8FAFC" stopOpacity="0.4" />
                  <stop offset="1" stopColor="#F1F5F9" stopOpacity="0.75" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={pullRandomNote}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Вытянуть записку</span>
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 text-xs font-semibold rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Добавить свою</span>
            </button>
          </div>

          <p className="text-xs text-stone-500 mt-2">
            Кликни на банку или кнопку выше · Записки не заканчиваются
          </p>
        </div>

        {/* Right: Unfolded Note Display */}
        <div className="lg:col-span-7">
          {currentNote ? (
            <div className="relative bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6 sm:p-8 shadow-xs transition-all">
              {/* Paper Fold effect / decorative pin */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-400 shadow-inner border border-white/60" />

              <div className="flex items-center justify-between text-xs text-stone-500 mb-4 pt-2">
                <span className="font-medium text-rose-700">
                  {categoryLabels[currentNote.category] || 'Записка с теплом'}
                </span>
                <span>{currentNote.authorNote || 'С любовью'}</span>
              </div>

              {/* Heartfelt Note Content in handwriting style */}
              <div className="my-6">
                <p className="font-handwriting text-2xl sm:text-3xl text-stone-800 leading-relaxed tracking-wide">
                  «{currentNote.text}»
                </p>
              </div>

              {herName && (
                <div className="text-right text-xs text-stone-500 italic mb-6">
                  Специально для {herName}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-amber-200/60">
                <button
                  onClick={copyNote}
                  className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white/80 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Скопировать</span>
                    </>
                  )}
                </button>

                <button
                  onClick={pullRandomNote}
                  className="px-4 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-100/70 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Еще одну</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 border border-stone-200 rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center justify-center min-h-[260px]">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-display font-semibold text-base sm:text-lg text-stone-800 mb-2">
                Баночка наполнена теплом
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-sm mb-6 leading-relaxed">
                Нажми на баночку слева или кнопку «Вытянуть записку», чтобы достать первое теплое послание на сегодня.
              </p>
              <button
                onClick={pullRandomNote}
                className="px-5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Открыть первую записку</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Form to add custom notes */}
          {showAddForm && (
            <form
              onSubmit={handleCreateNote}
              className="mt-6 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Добавить личную записку
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  Отмена
                </button>
              </div>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Напиши что-то личное (шутку, теплое воспоминание, комплимент)..."
                rows={3}
                className="w-full text-xs sm:text-sm p-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 bg-stone-50/50"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">Тип:</span>
                  <select
                    value={newNoteCategory}
                    onChange={(e) => setNewNoteCategory(e.target.value as NoteItem['category'])}
                    className="text-xs border border-stone-200 rounded-lg px-2 py-1 bg-white"
                  >
                    <option value="compliment">Комплимент</option>
                    <option value="support">Поддержка</option>
                    <option value="reminder">Забота</option>
                    <option value="smile">Для улыбки</option>
                    <option value="sweet">Нежность</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
                >
                  Положить в банку
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
