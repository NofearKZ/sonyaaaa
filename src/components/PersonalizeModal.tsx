import React, { useState } from 'react';
import { X, Sparkles, Trash2, Plus, Palette, Heart } from 'lucide-react';
import { MoodTheme, NoteItem } from '../types';
import { sound } from '../utils/audio';

interface PersonalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  herName: string;
  onSaveName: (name: string) => void;
  theme: MoodTheme;
  onSelectTheme: (theme: MoodTheme) => void;
  notes: NoteItem[];
  onDeleteNote: (id: string) => void;
  onAddNote: (text: string, category: NoteItem['category']) => void;
  onResetDefaults: () => void;
}

export const PersonalizeModal: React.FC<PersonalizeModalProps> = ({
  isOpen,
  onClose,
  herName,
  onSaveName,
  theme,
  onSelectTheme,
  notes,
  onDeleteNote,
  onAddNote,
  onResetDefaults,
}) => {
  const [tempName, setTempName] = useState(herName);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<NoteItem['category']>('compliment');

  if (!isOpen) return null;

  const themes: { id: MoodTheme; label: string; color: string }[] = [
    { id: 'blush', label: 'Нежный румянец', color: 'bg-rose-400' },
    { id: 'sunset', label: 'Теплый персик', color: 'bg-amber-400' },
    { id: 'lavender', label: 'Лаванда', color: 'bg-purple-400' },
    { id: 'mint', label: 'Мятный уют', color: 'bg-emerald-400' },
  ];

  const handleSave = () => {
    onSaveName(tempName.trim());
    sound.playChime(1.2);
    onClose();
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddNote(newText.trim(), newCategory);
    setNewText('');
    sound.playPop(480);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-current" />
            <h3 className="font-display font-bold text-lg text-stone-800">
              Настройка под неё
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Name input */}
        <div className="py-4 border-b border-stone-100">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Её имя или милое обращение:
          </label>
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="Например: Алина, Малыш, Солнышко..."
            className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-none"
          />
          <p className="text-2xs text-stone-500 mt-1.5">
            Имя будет автоматически отображаться в заголовке, письмах и записках.
          </p>
        </div>

        {/* Theme color picker */}
        <div className="py-4 border-b border-stone-100">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Цветовая атмосфера:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onSelectTheme(t.id);
                  sound.playPop(400);
                }}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  theme === t.id
                    ? 'border-rose-400 bg-rose-50/50 shadow-2xs'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${t.color}`} />
                <span className="text-xs font-semibold text-stone-700">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick add custom note */}
        <div className="py-4 border-b border-stone-100">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Добавить записку в банку:
          </label>
          <form onSubmit={handleAddSubmit} className="space-y-2">
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Напиши что-то, что заставит её улыбнуться..."
              rows={2}
              className="w-full p-2.5 text-xs sm:text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-none"
            />
            <div className="flex items-center justify-between gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as NoteItem['category'])}
                className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 bg-stone-50 text-stone-700"
              >
                <option value="compliment">Комплимент</option>
                <option value="support">Поддержка</option>
                <option value="reminder">Забота</option>
                <option value="smile">Для улыбки</option>
                <option value="sweet">Нежность</option>
              </select>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить</span>
              </button>
            </div>
          </form>
        </div>

        {/* Notes list preview & delete */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Все записки ({notes.length}):
            </label>
            <button
              onClick={() => {
                if (confirm('Сбросить записки к начальным?')) {
                  onResetDefaults();
                }
              }}
              className="text-2xs text-stone-400 hover:text-rose-600 transition-colors"
            >
              Сброс к исходным
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {notes.map((n) => (
              <div
                key={n.id}
                className="p-2 text-xs bg-stone-50 rounded-lg border border-stone-100 flex items-center justify-between gap-2"
              >
                <span className="line-clamp-1 text-stone-700">{n.text}</span>
                {notes.length > 3 && (
                  <button
                    onClick={() => onDeleteNote(n.id)}
                    className="text-stone-400 hover:text-red-500 p-1"
                    title="Удалить"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors shadow-xs"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
