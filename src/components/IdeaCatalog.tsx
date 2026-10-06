import React from 'react';
import { Sparkles, ArrowRight, Lightbulb, Heart, CheckCircle2 } from 'lucide-react';
import { CONCEPT_IDEAS, ConceptIdea } from '../data/defaultContent';
import { sound } from '../utils/audio';

interface IdeaCatalogProps {
  onSelectConcept: (conceptId: string) => void;
}

export const IdeaCatalog: React.FC<IdeaCatalogProps> = ({ onSelectConcept }) => {
  const mapConceptToTab = (id: string) => {
    switch (id) {
      case 'jar-of-notes': return 'jar';
      case 'virtual-hug': return 'hug';
      case 'secret-letters': return 'letters';
      case 'gentle-checkin': return 'care';
      case 'sound-sanctuary': return 'anti-stress';
      case 'cozy-decider': return 'jar';
      default: return 'jar';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase">
          Вдохновение и форматы
        </span>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-stone-800 mt-2 mb-3">
          6 простых и душевных идей для её настроения
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Когда сайт делается не ради сложного функционала, а ради одного её теплого вздоха и улыбки.
          Все эти идеи легко реализуются и уже интерактивно работают прямо на этой странице!
        </p>
      </div>

      {/* Grid of Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CONCEPT_IDEAS.map((concept) => (
          <div
            key={concept.id}
            className="bg-white/90 border border-stone-200/80 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-1 group"
          >
            <div>
              {/* Top meta */}
              <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
                <span className="font-mono font-bold text-rose-500 text-sm">
                  {concept.number}
                </span>
                <span className="text-xs font-medium text-stone-500">
                  {concept.difficulty}
                </span>
              </div>

              <h3 className="font-display font-bold text-lg text-stone-800 mb-1 group-hover:text-rose-600 transition-colors">
                {concept.title}
              </h3>
              <p className="text-xs font-medium text-rose-600/90 mb-3">
                {concept.subtitle}
              </p>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                {concept.description}
              </p>

              {/* Why she loves it */}
              <div className="bg-rose-50/60 rounded-xl p-3 mb-4 text-xs text-rose-900 border border-rose-100/60">
                <span className="font-semibold block mb-0.5">Почему это работает:</span>
                <span className="text-stone-700">{concept.whySheLovesIt}</span>
              </div>

              {/* Features list */}
              <ul className="space-y-1.5 mb-6 text-xs text-stone-600">
                {concept.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom action */}
            <button
              onClick={() => {
                sound.playPop(420);
                onSelectConcept(mapConceptToTab(concept.id));
              }}
              className="w-full py-2.5 px-3 bg-stone-50 hover:bg-rose-500 hover:text-white border border-stone-200 hover:border-rose-500 text-stone-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 group/btn cursor-pointer"
            >
              <span>Попробовать в действии</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {/* Secret Sauce / Advice Box */}
      <div className="bg-gradient-to-r from-amber-50/80 via-rose-50/60 to-purple-50/80 border border-rose-200/60 rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs flex items-center justify-center shrink-0 text-amber-500">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base sm:text-lg text-stone-800 mb-2">
              Секрет идеального простого сайта: 3 детали, которые растопят сердечко
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-xs text-stone-600">
              <div className="bg-white/80 p-3.5 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-800 block mb-1">1. Личные мелочи</span>
                Не пиши абстрактные цитаты. Вспомни, какой кофе она заказывает, её любимый стикер в Telegram или вашу общую смешную историю.
              </div>
              <div className="bg-white/80 p-3.5 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-800 block mb-1">2. Никакого визуального шума</span>
                Мягкие теплые цвета (персиковый, кремовый, пыльно-розовый), отсутствие навязчивой рекламы и плавная аккуратная анимация.
              </div>
              <div className="bg-white/80 p-3.5 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-800 block mb-1">3. Всегда под рукой</span>
                Сайт можно сохранить как ярлык на экран её смартфона — и когда будет трудный день, она сможет открыть его за 1 секунду.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
