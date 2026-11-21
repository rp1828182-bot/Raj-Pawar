import React from 'react';
import { BookOpen, Play, Smartphone } from 'lucide-react';
import { Difficulty, GameMode, TableSize } from '../game/types';
import { PlayingCard } from './PlayingCard';

const FELT_BG_IMAGE = '/src/assets/images/royal_table_felt_1795225342247.jpg';
const AVATAR_MEERA = '/src/assets/images/avatar_bot_meera_1795225344504.jpg';
const AVATAR_VIKRAM = '/src/assets/images/avatar_bot_vikram_1795225344382.jpg';

interface TitleMenuProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  tableSize: TableSize;
  setTableSize: (size: TableSize) => void;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  onStartGame: () => void;
  onOpenRules: (tab: 'RULES' | 'CAPACITOR') => void;
}

const SAMPLE_CARDS = [
  { id: 'sample-1', suit: 'spades' as const, rank: 4 as const, isPrintedJoker: false, deckIndex: 1 as const },
  { id: 'sample-2', suit: 'spades' as const, rank: 5 as const, isPrintedJoker: false, deckIndex: 1 as const },
  { id: 'sample-3', suit: 'spades' as const, rank: 6 as const, isPrintedJoker: false, deckIndex: 1 as const },
  { id: 'sample-4', suit: 'hearts' as const, rank: 13 as const, isPrintedJoker: false, deckIndex: 1 as const },
  { id: 'sample-5', suit: 'joker' as const, rank: 0 as const, isPrintedJoker: true, deckIndex: 1 as const },
];

export const TitleMenu: React.FC<TitleMenuProps> = ({
  gameMode,
  setGameMode,
  tableSize,
  setTableSize,
  difficulty,
  setDifficulty,
  onStartGame,
  onOpenRules,
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden royal-felt-surface flex flex-col">
      {/* Subtle table felt backdrop */}
      <img
        src={FELT_BG_IMAGE}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none select-none"
      />

      {/* Top Bar (3-zone contract) */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-5 sm:px-8 py-5 flex items-center justify-between gap-8 border-b border-white/10">
        <span className="text-xl font-display font-bold tracking-wide text-[#f5f3ec] whitespace-nowrap shrink-0">
          Royal Rummy
        </span>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#c7d3cc]">
          <button
            type="button"
            onClick={() => onOpenRules('RULES')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Rules & Melds
          </button>
          <button
            type="button"
            onClick={() => onOpenRules('CAPACITOR')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Android Build
          </button>
        </nav>

        <button
          type="button"
          onClick={onStartGame}
          className="min-h-[44px] px-5 py-2 rounded-lg bg-[#d4af37] text-[#071f15] text-sm font-semibold hover:bg-[#e5b84b] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Start Game
        </button>
      </header>

      {/* Main Two-Column Desktop Hero / Touch-First Mobile Layout */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-12 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left: Game Title & Table Configuration */}
        <div className="lg:col-span-7 space-y-7">
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-wider uppercase text-[#e5b84b]">
              13-Card Classic Tabletop · Double Deck + Wild Jokers
            </p>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white leading-[1.12] [text-wrap:balance]">
              Master Pure Sequences at the Royal Table
            </h1>
            <p className="text-base text-[#c7d3cc] max-w-xl leading-relaxed">
              Deal 13 cards, cut the Wild Joker, and race seasoned card strategists to form a Pure
              Sequence and meld your hand before your opponents declare.
            </p>
          </div>

          {/* Match Configuration Controls */}
          <div className="bg-[#081d14]/85 border border-white/12 rounded-2xl p-5 sm:p-6 space-y-5">
            {/* Game Format */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#c7d3cc]">
                Match Format
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#05120c] rounded-xl border border-white/10">
                {(
                  [
                    { id: 'POINTS', label: 'Points Rummy' },
                    { id: 'POOL_101', label: '101 Pool' },
                    { id: 'POOL_201', label: '201 Pool' },
                    { id: 'BEST_OF_3', label: 'Best of 3' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setGameMode(mode.id)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      gameMode === mode.id
                        ? 'bg-[#d4af37] text-[#071f15]'
                        : 'text-[#b6c7be] hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Size & AI Skill */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#c7d3cc]">
                  Table Seats
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#05120c] rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setTableSize(2)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      tableSize === 2
                        ? 'bg-white text-[#071f15]'
                        : 'text-[#b6c7be] hover:text-white'
                    }`}
                  >
                    2 Players
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableSize(3)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      tableSize === 3
                        ? 'bg-white text-[#071f15]'
                        : 'text-[#b6c7be] hover:text-white'
                    }`}
                  >
                    3 Players
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#c7d3cc]">
                  Opponent Skill
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#05120c] rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setDifficulty('CASUAL')}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      difficulty === 'CASUAL'
                        ? 'bg-white text-[#071f15]'
                        : 'text-[#b6c7be] hover:text-white'
                    }`}
                  >
                    Casual
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficulty('CLUB_PRO')}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      difficulty === 'CLUB_PRO'
                        ? 'bg-white text-[#071f15]'
                        : 'text-[#b6c7be] hover:text-white'
                    }`}
                  >
                    Club Pro
                  </button>
                </div>
              </div>
            </div>

            {/* Primary CTA Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onStartGame}
                className="min-h-[48px] flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#d4af37] text-[#071f15] text-sm font-bold hover:bg-[#e5b84b] active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                Deal Cards
              </button>
              <button
                type="button"
                onClick={() => onOpenRules('RULES')}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/15 text-sm font-medium text-[#dbe5df] hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                How to Play
              </button>
              <button
                type="button"
                onClick={() => onOpenRules('CAPACITOR')}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/15 text-sm font-medium text-[#dbe5df] hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap md:hidden"
              >
                <Smartphone className="w-4 h-4" />
                Android Setup
              </button>
            </div>
          </div>
        </div>

        {/* Right: Atmospheric Hand & Opponent Preview */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-[#081d14]/80 border border-[#d4af37]/25 rounded-2xl p-6 space-y-6">
            <div>
              <div className="text-xs font-semibold text-[#34d399] mb-3">
                Example Pure Sequence · 0 Deadwood
              </div>
              <div className="flex items-center justify-center sm:justify-start -space-x-2">
                {SAMPLE_CARDS.slice(0, 3).map((card) => (
                  <PlayingCard key={card.id} card={card} size="md" />
                ))}
                <div className="pl-5 flex -space-x-2">
                  <PlayingCard faceDown size="md" />
                  <PlayingCard card={SAMPLE_CARDS[4]} wildRank={7} size="md" />
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-5 space-y-3">
              <div className="text-xs font-semibold text-[#c7d3cc]">
                Table Opponents
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#05120c]/70 border border-white/10">
                  <img
                    src={AVATAR_MEERA}
                    alt="Meera"
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-lg object-cover border border-[#d4af37]/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">Meera</div>
                    <div className="text-xs text-[#9eb3a8] truncate">Sharp Closer</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#05120c]/70 border border-white/10">
                  <img
                    src={AVATAR_VIKRAM}
                    alt="Vikram"
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-lg object-cover border border-[#d4af37]/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">Vikram</div>
                    <div className="text-xs text-[#9eb3a8] truncate">Card Veteran</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
