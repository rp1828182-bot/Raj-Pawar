import React from 'react';
import {
  ArrowDownLeft,
  BookOpen,
  Crown,
  Gift,
  Palette,
  Play,
  PlusCircle,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import {
  CardThemeId,
  CashStake,
  Difficulty,
  FeltThemeId,
  GameMode,
  TableCategory,
  TableSize,
  WalletState,
} from '../game/types';
import { PlayingCard } from './PlayingCard';

const FELT_BG_IMAGE = '/src/assets/images/royal_table_felt_1795225342247.jpg';
const AVATAR_MEERA = '/src/assets/images/avatar_bot_meera_1795225344504.jpg';
const AVATAR_VIKRAM = '/src/assets/images/avatar_bot_vikram_1795225344382.jpg';
const AVATAR_PRIYA = '/src/assets/images/avatar_friend_priya_1795229894154.jpg';
const AVATAR_RAHUL = '/src/assets/images/avatar_friend_rahul_1795229894404.jpg';

export const CASH_STAKES: CashStake[] = [
  {
    id: 'stake-2',
    name: '₹2 Micro Table',
    nameHi: '₹2 टेबल',
    entryFee: 2,
    pointValue: 0.025,
    prizePool: 5.5,
  },
  {
    id: 'stake-5',
    name: '₹5 Starter Table',
    nameHi: '₹5 टेबल',
    entryFee: 5,
    pointValue: 0.05,
    prizePool: 14.0,
  },
  {
    id: 'stake-10',
    name: '₹10 Bonus Table',
    nameHi: '₹10 बोनस टेबल',
    entryFee: 10,
    pointValue: 0.1,
    prizePool: 28.0,
    badge: '₹10 बोनस से खेलें',
  },
  {
    id: 'stake-25',
    name: '₹25 Club Table',
    nameHi: '₹25 क्लब टेबल',
    entryFee: 25,
    pointValue: 0.25,
    prizePool: 70.0,
  },
  {
    id: 'stake-50',
    name: '₹50 Pro Table',
    nameHi: '₹50 प्रो टेबल',
    entryFee: 50,
    pointValue: 0.5,
    prizePool: 140.0,
  },
];

interface TitleMenuProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  tableSize: TableSize;
  setTableSize: (size: TableSize) => void;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  category: TableCategory;
  setCategory: (cat: TableCategory) => void;
  activeCashStake: CashStake;
  setActiveCashStake: (stake: CashStake) => void;
  wallet: WalletState;
  cardTheme: CardThemeId;
  feltTheme: FeltThemeId;
  onStartGame: () => void;
  onOpenRules: (tab: 'RULES' | 'CAPACITOR') => void;
  onOpenWallet: (tab?: 'WITHDRAW' | 'OVERVIEW') => void;
  onOpenCardCustomizer: () => void;
  onOpenFriendsRoom: () => void;
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
  category,
  setCategory,
  activeCashStake,
  setActiveCashStake,
  wallet,
  cardTheme,
  feltTheme,
  onStartGame,
  onOpenRules,
  onOpenWallet,
  onOpenCardCustomizer,
  onOpenFriendsRoom,
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden royal-felt-surface flex flex-col">
      {/* Table felt backdrop */}
      <img
        src={FELT_BG_IMAGE}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none select-none"
      />

      {/* Top Bar (3-zone contract compliant with luxury Indian gaming flair) */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 border-b border-white/10 bg-[#061810]/70 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg sm:text-xl font-display font-bold tracking-wide text-[#f5f3ec] whitespace-nowrap shrink-0">
            Royal Rummy
          </span>
          <span className="hidden sm:inline text-xs text-[#34d399] font-medium bg-[#10b981]/15 px-2 py-0.5 rounded border border-[#34d399]/30">
            ₹10 Bonus Ready
          </span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#c7d3cc]">
          <button
            type="button"
            onClick={() => onOpenRules('RULES')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            How to Play
          </button>
          <button
            type="button"
            onClick={onOpenCardCustomizer}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Palette className="w-3.5 h-3.5 text-[#e5b84b]" />
            <span>कार्ड बदलें (Cards)</span>
          </button>
          <button
            type="button"
            onClick={onOpenFriendsRoom}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-[#34d399]" />
            <span>दोस्तों के साथ (Friends)</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenRules('CAPACITOR')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Android APK
          </button>
        </nav>

        {/* Right Zone: Wallet Badge + Quick Withdraw CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Wallet Balance Display */}
          <button
            type="button"
            onClick={() => onOpenWallet('OVERVIEW')}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#061810] border border-[#d4af37]/40 text-left hover:bg-[#0d2e20] transition-colors cursor-pointer flex items-center gap-2"
          >
            <Wallet className="w-4 h-4 text-[#e5b84b] shrink-0" />
            <div>
              <div className="text-[10px] text-[#9eb3a8] leading-none">Wallet</div>
              <div className="text-xs sm:text-sm font-bold font-mono-num text-white">
                ₹{wallet.totalBalance.toFixed(2)}
              </div>
            </div>
          </button>

          {/* Prominent Withdraw Button (Fulfills: widrol ka option hona) */}
          <button
            type="button"
            onClick={() => onOpenWallet('WITHDRAW')}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#dc2626]/20 hover:bg-[#dc2626]/35 border border-[#ef4444]/50 text-[#fecaca] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#f87171]" />
            <span>Withdraw / निकासी</span>
          </button>
        </div>
      </header>

      {/* Celebratory ₹10 Bonus Bar */}
      <div className="relative z-10 w-full bg-gradient-to-r from-[#78350f]/80 via-[#92400e]/90 to-[#78350f]/80 border-b border-[#f59e0b]/30 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-[#fef3c7]">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#fbbf24] animate-bounce shrink-0" />
            <span className="font-semibold">
              ₹10 स्वागत बोनस सक्रिय (₹10 Welcome Bonus Active):
            </span>
            <span className="text-[#fde68a]">
              आपके वॉलेट में ₹10 जुड़ चुके हैं! इसका उपयोग ₹2, ₹5 या ₹10 के कैश टेबल खेलने के लिए करें।
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCategory('CASH');
                const tenStake = CASH_STAKES.find((s) => s.entryFee === 10);
                if (tenStake) setActiveCashStake(tenStake);
              }}
              className="text-[11px] font-bold text-[#071f15] bg-[#fbbf24] hover:bg-[#f59e0b] px-2.5 py-1 rounded cursor-pointer transition-colors"
            >
              Play ₹10 Table (खेलें)
            </button>
            <button
              type="button"
              onClick={() => onOpenWallet('WITHDRAW')}
              className="text-[11px] font-medium text-[#fef3c7] underline hover:text-white cursor-pointer"
            >
              निकासी विवरण (Withdrawal Info)
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Match & Table Category Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e5b84b]">
              <span>13-Card Indian Rummy</span>
              <span aria-hidden="true">·</span>
              <span>Point &amp; Pool Staking</span>
              <span aria-hidden="true">·</span>
              <span>Double Deck Jokers</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight [text-wrap:balance]">
              असली रमी का रोमांच · टेबल पर दांव लगाएं
            </h1>
            <p className="text-sm sm:text-base text-[#c7d3cc] leading-relaxed max-w-2xl">
              वेलकम बोनस ₹10 से कैश टेबल खेलें, दोस्तों के साथ प्राइवेट रूम बनाएं या स्मार्ट एआई बॉट्स के साथ
              अभ्यास करें।
            </p>
          </div>

          {/* Category Tabs: Cash vs Friends vs Practice */}
          <div className="bg-[#081d14]/90 border border-[#d4af37]/30 rounded-2xl p-4 sm:p-5 space-y-5 shadow-xl">
            {/* Main Mode Category Switcher */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#e5b84b]">
                गेम प्रकार (Select Game Mode)
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#05120c] rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setCategory('CASH')}
                  className={`min-h-[44px] py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    category === 'CASH'
                      ? 'bg-[#d4af37] text-[#071f15] shadow'
                      : 'text-[#b6c7be] hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>पैसे से खेलें (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCategory('FRIENDS');
                    onOpenFriendsRoom();
                  }}
                  className={`min-h-[44px] py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    category === 'FRIENDS'
                      ? 'bg-[#d4af37] text-[#071f15] shadow'
                      : 'text-[#b6c7be] hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>दोस्तों के साथ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('PRACTICE')}
                  className={`min-h-[44px] py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    category === 'PRACTICE'
                      ? 'bg-white text-[#071f15] shadow'
                      : 'text-[#b6c7be] hover:text-white'
                  }`}
                >
                  <span>फ्री प्रैक्टिस</span>
                </button>
              </div>
            </div>

            {/* If Category is CASH TABLES (Paise se khelna) */}
            {category === 'CASH' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#c7d3cc]">
                    कैश टेबल चुनें (Select Cash Table)
                  </label>
                  <span className="text-[11px] text-[#34d399] font-mono-num font-semibold">
                    Wallet: ₹{wallet.totalBalance.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CASH_STAKES.map((stake) => {
                    const isSelected = activeCashStake.id === stake.id;
                    const canAfford = wallet.totalBalance >= stake.entryFee;
                    return (
                      <button
                        key={stake.id}
                        type="button"
                        onClick={() => setActiveCashStake(stake)}
                        className={`relative min-h-[58px] p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#103828] border-[#e5b84b] ring-1 ring-[#e5b84b]'
                            : 'bg-[#061810] border-white/10 hover:bg-white/5'
                        } ${!canAfford ? 'opacity-60' : ''}`}
                      >
                        {stake.badge && (
                          <span className="absolute -top-2 right-2 bg-[#d4af37] text-[#071f15] text-[9px] font-bold px-1.5 py-0.2 rounded shadow">
                            {stake.badge}
                          </span>
                        )}
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>{stake.nameHi}</span>
                          <span className="text-[#e5b84b]">Entry ₹{stake.entryFee}</span>
                        </div>
                        <div className="text-[10px] text-[#9eb3a8] mt-1 flex items-center justify-between">
                          <span>Point: ₹{stake.pointValue}</span>
                          <span className="text-[#34d399] font-semibold">Prize ₹{stake.prizePool}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* If Category is FRIENDS (Friends ke sath khelna) */}
            {category === 'FRIENDS' && (
              <div className="p-4 rounded-xl bg-[#061810] border border-[#d4af37]/35 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#e5b84b]" />
                    <span>दोस्तों के साथ टेबल (Private Room Mode)</span>
                  </div>
                  <span className="text-[11px] text-[#34d399]">6-Digit Room Code</span>
                </div>
                <p className="text-xs text-[#b6c7be] leading-relaxed">
                  कमरा बनाएं, 6-अंकों का कोड शेयर करें और दोस्तों के साथ ऑनलाइन खेलें या एक ही डिवाइस पर पास
                  एंड प्ले करें!
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onOpenFriendsRoom}
                    className="min-h-[40px] px-4 py-2 rounded-lg bg-[#d4af37] text-[#071f15] text-xs font-bold hover:bg-[#e5b84b] transition-colors cursor-pointer"
                  >
                    प्राइवेट रूम ओपन करें (Open Room Lobby)
                  </button>
                </div>
              </div>
            )}

            {/* Match Format & Rules */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#c7d3cc]">
                गेम नियम (Rules Format)
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
                    className={`min-h-[44px] px-2 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
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

            {/* Table Seats & AI Difficulty */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#c7d3cc]">
                  खिलाड़ी (Seats)
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#05120c] rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setTableSize(2)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      tableSize === 2 ? 'bg-white text-[#071f15]' : 'text-[#b6c7be] hover:text-white'
                    }`}
                  >
                    2 Players
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableSize(3)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      tableSize === 3 ? 'bg-white text-[#071f15]' : 'text-[#b6c7be] hover:text-white'
                    }`}
                  >
                    3 Players
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#c7d3cc]">
                  विपक्षी का स्तर (AI Skill)
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#05120c] rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setDifficulty('CASUAL')}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onStartGame}
                className="min-h-[48px] flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#d4af37] text-[#071f15] text-sm font-bold hover:bg-[#e5b84b] active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap shadow-lg"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {category === 'CASH'
                    ? `Play ₹${activeCashStake.entryFee} Table (पत्ते बांटें)`
                    : 'Deal Cards (पत्ते बांटें)'}
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenCardCustomizer}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/15 text-sm font-medium text-[#dbe5df] hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Palette className="w-4 h-4 text-[#e5b84b]" />
                <span>कार्ड बदलें</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenWallet('WITHDRAW')}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#ef4444]/40 bg-[#dc2626]/10 text-sm font-medium text-[#fca5a5] hover:bg-[#dc2626]/20 transition-colors cursor-pointer whitespace-nowrap"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>निकासी (Withdraw)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Card Showcase & Opponents */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-[#081d14]/85 border border-[#d4af37]/25 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
            {/* Active Card Deck Showcase */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-[#34d399] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#e5b84b]" />
                  <span>प्योर सीक्वेंस · 0 डेडवुड</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenCardCustomizer}
                  className="text-[11px] text-[#e5b84b] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Palette className="w-3 h-3" />
                  <span>डेक बदलें</span>
                </button>
              </div>

              <div className="flex items-center justify-center sm:justify-start -space-x-3 sm:-space-x-2">
                {SAMPLE_CARDS.slice(0, 3).map((card) => (
                  <PlayingCard
                    key={card.id}
                    card={card}
                    themeId={cardTheme}
                    size="md"
                  />
                ))}
                <div className="pl-4 flex -space-x-2">
                  <PlayingCard faceDown themeId={cardTheme} size="md" />
                  <PlayingCard
                    card={SAMPLE_CARDS[4]}
                    wildRank={7}
                    themeId={cardTheme}
                    size="md"
                  />
                </div>
              </div>
            </div>

            {/* Opponents Preview (Dynamic based on Category) */}
            <div className="border-t border-white/10 pt-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#c7d3cc]">
                <span>
                  {category === 'FRIENDS' ? 'टेबल मित्र (Friend Players)' : 'टेबल प्रतिद्वंदी (Opponents)'}
                </span>
                <span className="text-[10px] text-[#9eb3a8]">Ready at Table</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#05120c]/70 border border-white/10">
                  <img
                    src={category === 'FRIENDS' ? AVATAR_RAHUL : AVATAR_MEERA}
                    alt={category === 'FRIENDS' ? 'Rahul' : 'Meera'}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-lg object-cover border border-[#d4af37]/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-white truncate">
                      {category === 'FRIENDS' ? 'Rahul' : 'Meera'}
                    </div>
                    <div className="text-[11px] text-[#9eb3a8] truncate">
                      {category === 'FRIENDS' ? 'Friend · Online' : 'Sharp Closer'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#05120c]/70 border border-white/10">
                  <img
                    src={category === 'FRIENDS' ? AVATAR_PRIYA : AVATAR_VIKRAM}
                    alt={category === 'FRIENDS' ? 'Priya' : 'Vikram'}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-lg object-cover border border-[#d4af37]/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-white truncate">
                      {category === 'FRIENDS' ? 'Priya' : 'Vikram'}
                    </div>
                    <div className="text-[11px] text-[#9eb3a8] truncate">
                      {category === 'FRIENDS' ? 'Friend · Online' : 'Card Veteran'}
                    </div>
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
