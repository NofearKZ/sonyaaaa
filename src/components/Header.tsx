import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  SlidersHorizontal,
  CloudRain,
  Cloud,
  CheckCircle,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { sound } from '../utils/audio';

interface HeaderProps {
  herName: string;
  onOpenSettings: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isSaving: boolean;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({
  herName,
  onOpenSettings,
  user,
  onSignIn,
  onSignOut,
  isSaving,
  activeSection,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [rainActive, setRainActive] = useState(false);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMute(next);
    if (next && rainActive) {
      setRainActive(false);
      sound.toggleRain(false);
    }
  };

  const toggleRain = () => {
    if (isMuted) {
      setIsMuted(false);
      sound.setMute(false);
    }
    const next = !rainActive;
    setRainActive(next);
    sound.toggleRain(next);
  };

  const navItems = [
    { id: 'jar', label: 'Записки' },
    { id: 'hug', label: 'Обнимашка' },
    { id: 'letters', label: 'Конверты' },
    { id: 'antistress', label: 'Антистресс' },
    { id: 'care', label: 'Забота' },
    { id: 'decider', label: 'Радости' },
  ];

  const scrollTo = (id: string) => {
    sound.playPop(420);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-rose-100/70 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display font-bold text-lg sm:text-xl text-stone-800 tracking-tight hover:text-rose-600 transition-colors whitespace-nowrap"
        >
          {herName ? `Для ${herName} 🌿` : 'Уголок Уюта 🌿'}
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`whitespace-nowrap transition-colors py-1 relative ${
                activeSection === item.id
                  ? 'text-rose-600 font-semibold'
                  : 'hover:text-stone-900'
              }`}
            >
              {item.label}
              {activeSection === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Cloud Database Status */}
          {user ? (
            <div
              title={`Синхронизировано в Firestore (${user.email})`}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-2xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>{isSaving ? 'Сохранение...' : 'Облако'}</span>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              title="Войти через Google для сохранения в базе данных"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-2xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
            >
              <LogIn className="w-3 h-3 text-rose-500" />
              <span>Синхронизация</span>
            </button>
          )}

          {/* Rain Sound Toggle */}
          <button
            onClick={toggleRain}
            title={rainActive ? 'Выключить звук дождя' : 'Включить уютный звук дождя'}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
              rainActive
                ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-2xs'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <CloudRain className="w-4 h-4" />
          </button>

          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Включить звуки' : 'Отключить звуки'}
            className="p-2 rounded-lg text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Settings modal button */}
          <button
            onClick={onOpenSettings}
            className="px-3 py-2 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Настроить</span>
          </button>

          {user && (
            <button
              onClick={onSignOut}
              title="Выйти из аккаунта"
              className="p-2 rounded-lg text-stone-500 hover:text-stone-800 bg-stone-50 border border-stone-200 hover:bg-stone-100"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="lg:hidden flex overflow-x-auto py-2 px-4 gap-3 text-xs font-medium border-t border-rose-50 bg-stone-50/60 scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors ${
              activeSection === item.id
                ? 'bg-rose-100 text-rose-700 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {item.label}
          </button>
        ))}
        {!user && (
          <button
            onClick={onSignIn}
            className="whitespace-nowrap px-2 py-1 rounded-md text-rose-600 font-semibold flex items-center gap-1 bg-white border border-rose-200"
          >
            <LogIn className="w-3 h-3" />
            <span>В облако</span>
          </button>
        )}
      </div>
    </header>
  );
};
