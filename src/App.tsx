import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { NoteJar } from './components/NoteJar';
import { VirtualHug } from './components/VirtualHug';
import { StressRelief } from './components/StressRelief';
import { SecretLetters } from './components/SecretLetters';
import { CareChecklist } from './components/CareChecklist';
import { CozyDecider } from './components/CozyDecider';
import { PersonalizeModal } from './components/PersonalizeModal';
import { INITIAL_NOTES, INITIAL_CARE_ITEMS } from './data/defaultContent';
import { MoodTheme, NoteItem } from './types';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { Heart, Cloud, CheckCircle2, Sparkles, ArrowDown } from 'lucide-react';
import { sound } from './utils/audio';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // App State
  const [herName, setHerName] = useState<string>(() => {
    return localStorage.getItem('cozy_her_name') || 'Тебя';
  });

  const [theme, setTheme] = useState<MoodTheme>(() => {
    return (localStorage.getItem('cozy_theme') as MoodTheme) || 'blush';
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('cozy_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_NOTES;
      }
    }
    return INITIAL_NOTES;
  });

  const [careChecked, setCareChecked] = useState<string[]>(() => {
    const saved = localStorage.getItem('cozy_care_checked');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [hugCount, setHugCount] = useState<number>(() => {
    const saved = localStorage.getItem('cozy_hug_count');
    return saved ? parseInt(saved, 10) : 12;
  });

  const [petCatCount, setPetCatCount] = useState<number>(() => {
    const saved = localStorage.getItem('cozy_pet_count');
    return saved ? parseInt(saved, 10) : 8;
  });

  const [activeSection, setActiveSection] = useState<string>('jar');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cozy_her_name', herName);
  }, [herName]);

  useEffect(() => {
    localStorage.setItem('cozy_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('cozy_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('cozy_care_checked', JSON.stringify(careChecked));
  }, [careChecked]);

  useEffect(() => {
    localStorage.setItem('cozy_hug_count', hugCount.toString());
  }, [hugCount]);

  useEffect(() => {
    localStorage.setItem('cozy_pet_count', petCatCount.toString());
  }, [petCatCount]);

  // Auth Listener & Firestore Initial Fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);

      if (currentUser) {
        const userDocRef = doc(db, 'user_profiles', currentUser.uid);
        try {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.herName) setHerName(data.herName);
            if (data.theme) setTheme(data.theme);
            if (typeof data.hugCount === 'number') setHugCount(data.hugCount);
            if (typeof data.petCatCount === 'number') setPetCatCount(data.petCatCount);
            if (Array.isArray(data.careChecked)) setCareChecked(data.careChecked);
          } else {
            // First time: write current local state to Firestore
            await setDoc(userDocRef, {
              id: currentUser.uid,
              herName,
              theme,
              hugCount,
              petCatCount,
              careChecked,
              ownerId: currentUser.uid,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          try {
            handleFirestoreError(err, OperationType.GET, `user_profiles/${currentUser.uid}`);
          } catch (e) {
            console.warn('Firestore sync note:', e);
          }
        }

        // Listen to custom notes subcollection
        const notesRef = collection(db, 'user_profiles', currentUser.uid, 'notes');
        const unsubNotes = onSnapshot(
          notesRef,
          (querySnap) => {
            if (!querySnap.empty) {
              const remoteNotes: NoteItem[] = [];
              querySnap.forEach((d) => {
                const nd = d.data();
                remoteNotes.push({
                  id: d.id,
                  category: nd.category,
                  text: nd.text,
                  authorNote: nd.authorNote,
                });
              });
              // Merge remote with initial
              setNotes((prev) => {
                const combined = [...remoteNotes];
                INITIAL_NOTES.forEach((initNote) => {
                  if (!combined.some((n) => n.id === initNote.id)) {
                    combined.push(initNote);
                  }
                });
                return combined;
              });
            }
          },
          (err) => {
            try {
              handleFirestoreError(err, OperationType.GET, `user_profiles/${currentUser.uid}/notes`);
            } catch (e) {
              console.warn('Firestore notes sync note:', e);
            }
          }
        );

        return () => unsubNotes();
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync profile changes to Firestore if user is authenticated
  const saveToFirestore = async (override?: {
    herName?: string;
    theme?: MoodTheme;
    careChecked?: string[];
    hugCount?: number;
    petCatCount?: number;
  }) => {
    if (!user) return;
    setIsSaving(true);
    const userDocRef = doc(db, 'user_profiles', user.uid);
    try {
      await setDoc(
        userDocRef,
        {
          id: user.uid,
          herName: override?.herName ?? herName,
          theme: override?.theme ?? theme,
          careChecked: override?.careChecked ?? careChecked,
          hugCount: override?.hugCount ?? hugCount,
          petCatCount: override?.petCatCount ?? petCatCount,
          ownerId: user.uid,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, `user_profiles/${user.uid}`);
      } catch (e) {
        console.warn('Firestore profile write note:', e);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignIn = async () => {
    try {
      sound.playChime(1.1);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      sound.playPop(300);
      await signOut(auth);
    } catch (error) {
      console.error('Sign-Out error:', error);
    }
  };

  const handleAddNote = async (text: string, category: NoteItem['category']) => {
    const newNoteId = `custom-${Date.now()}`;
    const newNote: NoteItem = {
      id: newNoteId,
      category,
      text,
      authorNote: 'От чистого сердца',
    };
    setNotes((prev) => [newNote, ...prev]);

    if (user) {
      const noteDocRef = doc(db, 'user_profiles', user.uid, 'notes', newNoteId);
      try {
        await setDoc(noteDocRef, {
          id: newNoteId,
          text,
          category,
          authorNote: 'От чистого сердца',
          userId: user.uid,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.CREATE, `user_profiles/${user.uid}/notes/${newNoteId}`);
        } catch (e) {
          console.warn('Firestore note create note:', e);
        }
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (user && id.startsWith('custom-')) {
      const noteDocRef = doc(db, 'user_profiles', user.uid, 'notes', id);
      try {
        await deleteDoc(noteDocRef);
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.DELETE, `user_profiles/${user.uid}/notes/${id}`);
        } catch (e) {
          console.warn('Firestore note delete note:', e);
        }
      }
    }
  };

  const handleResetDefaults = () => {
    setNotes(INITIAL_NOTES);
  };

  const handleToggleCare = (id: string) => {
    const next = careChecked.includes(id)
      ? careChecked.filter((i) => i !== id)
      : [...careChecked, id];
    setCareChecked(next);
    saveToFirestore({ careChecked: next });
  };

  const handleHug = () => {
    const next = hugCount + 1;
    setHugCount(next);
    saveToFirestore({ hugCount: next });
  };

  const handlePetCat = () => {
    const next = petCatCount + 1;
    setPetCatCount(next);
    saveToFirestore({ petCatCount: next });
  };

  const handleSaveName = (name: string) => {
    setHerName(name);
    saveToFirestore({ herName: name });
  };

  const handleSelectTheme = (newTheme: MoodTheme) => {
    setTheme(newTheme);
    saveToFirestore({ theme: newTheme });
  };

  const getThemeBackground = () => {
    switch (theme) {
      case 'sunset':
        return 'from-amber-50/70 via-orange-50/40 to-stone-50';
      case 'lavender':
        return 'from-purple-50/70 via-pink-50/40 to-stone-50';
      case 'mint':
        return 'from-emerald-50/70 via-teal-50/40 to-stone-50';
      case 'blush':
      default:
        return 'from-rose-50/70 via-pink-50/30 to-stone-50';
    }
  };

  const scrollTo = (id: string) => {
    sound.playPop(420);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${getThemeBackground()} text-stone-800 flex flex-col selection:bg-rose-200 selection:text-rose-900`}
    >
      {/* Top Header */}
      <Header
        herName={herName}
        onOpenSettings={() => setIsSettingsOpen(true)}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isSaving={isSaving}
        activeSection={activeSection}
      />

      {/* Main Single-Page Unified Layout */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-24">
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto pt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-rose-200/60 text-xs font-semibold text-rose-700 shadow-2xs mb-4">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Островок тепла и заботы · Всё в одном месте</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-stone-900 tracking-tight leading-tight mb-4">
            {herName ? `Уголок хорошего настроения для ${herName}` : 'Уголок хорошего настроения'}
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-lg mx-auto mb-6">
            Здесь нет спешки, дедлайнов и шума. Просто листай вниз, вытягивай записки, обнимайся, лопай пузырьки и чувствуй заботу.
          </p>

          {/* Cloud Database Persistence Banner */}
          <div className="inline-flex items-center gap-2 p-1.5 px-3 bg-white/90 border border-stone-200 rounded-xl text-xs text-stone-600 shadow-2xs mb-8">
            <Cloud className="w-4 h-4 text-rose-500 shrink-0" />
            {user ? (
              <span className="font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Синхронизировано в базе данных Firestore
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span>Действия сохраняются локально.</span>
                <button
                  onClick={handleSignIn}
                  className="font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                >
                  Включить облако через Google
                </button>
              </div>
            )}
          </div>

          {/* Quick jump anchor row */}
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {[
              { id: 'jar', label: '🌸 Банка записок' },
              { id: 'hug', label: '🤗 Обнимашка' },
              { id: 'letters', label: '💌 Конверты' },
              { id: 'antistress', label: '🫧 Антистресс' },
              { id: 'care', label: '🌿 Забота' },
              { id: 'decider', label: '✨ Маленькие радости' },
            ].map((anchor) => (
              <button
                key={anchor.id}
                onClick={() => scrollTo(anchor.id)}
                className="px-3 py-1.5 rounded-xl bg-white/80 border border-stone-200/80 text-stone-600 hover:text-stone-900 hover:bg-white font-medium transition-all shadow-2xs cursor-pointer"
              >
                {anchor.label}
              </button>
            ))}
          </div>
        </section>

        {/* Section 1: Note Jar */}
        <section id="jar" className="scroll-mt-24 pt-4">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase">
              Раздел 01
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 mt-1">
              Баночка с теплыми записками
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Каждый раз случайное послание, комплимент или повод для улыбки
            </p>
          </div>
          <NoteJar
            notes={notes}
            herName={herName}
            onAddCustomNote={handleAddNote}
          />
        </section>

        {/* Section 2: Virtual Hug */}
        <section id="hug" className="scroll-mt-24 pt-4">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase">
              Раздел 02
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 mt-1">
              Виртуальное объятие
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Зажми кнопку на 2-3 секунды, чтобы зарядить обнимашку
            </p>
          </div>
          <VirtualHug
            herName={herName}
            hugCount={hugCount}
            onHug={handleHug}
          />
        </section>

        {/* Section 3: Open When Letters */}
        <section id="letters" className="scroll-mt-24 pt-4">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase">
              Раздел 03
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 mt-1">
              Конверты «Открой, когда...»
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Поддержка для разных состояний и моментов
            </p>
          </div>
          <SecretLetters herName={herName} />
        </section>

        {/* Section 4: Anti-stress (bubbles & sleepy cat) */}
        <section id="antistress" className="scroll-mt-24 pt-4">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase">
              Раздел 04
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 mt-1">
              Антистресс & Мурчащий котик
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Лопай пузырьки и гладь котика со звуками мурлыканья
            </p>
          </div>
          <StressRelief
            petCount={petCatCount}
            onPetCat={handlePetCat}
          />
        </section>

        {/* Section 5: Care Checklist */}
        <section id="care" className="scroll-mt-24 pt-4">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase">
              Раздел 05
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 mt-1">
              Чек-лист нежной заботы
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Галочки сохраняются в базе данных
            </p>
          </div>
          <CareChecklist
            initialItems={INITIAL_CARE_ITEMS}
            checkedIds={careChecked}
            onToggleCare={handleToggleCare}
            herName={herName}
          />
        </section>

        {/* Section 6: Cozy Decider */}
        <section id="decider" className="scroll-mt-24 pt-4">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase">
              Раздел 06
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 mt-1">
              Колесо маленьких радостей
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Случайный выбор для уютного вечера
            </p>
          </div>
          <CozyDecider />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-rose-100/70 bg-white/70 py-10 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-stone-600">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>Сделано с любовью и теплом</span>
          </div>

          <div className="flex items-center gap-3 text-stone-500">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              Персонализация ({herName})
            </button>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Cloud className="w-3 h-3 text-rose-400" />
              <span>База данных Firestore</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Personalization Modal */}
      <PersonalizeModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        herName={herName}
        onSaveName={handleSaveName}
        theme={theme}
        onSelectTheme={handleSelectTheme}
        notes={notes}
        onDeleteNote={handleDeleteNote}
        onAddNote={handleAddNote}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
