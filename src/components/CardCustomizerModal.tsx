import React, { useState } from 'react';
import {
  Check,
  Crown,
  Eye,
  Layers,
  Palette,
  RotateCw,
  Sparkles,
  X,
} from 'lucide-react';
import { soundEngine } from '../game/sound';
import { CardThemeConfig, CardThemeId, FeltThemeConfig, FeltThemeId } from '../game/types';
import { PlayingCard } from './PlayingCard';

export const CARD_THEMES: CardThemeConfig[] = [
  {
    id: 'EMERALD_GOLD',
    name: 'Emerald Gold',
    nameHi: 'शाही पन्ना गोल्ड',
    imageSrc: '/src/assets/images/royal_card_back_1795225341494.jpg',
    accentColor: '#10b981',
    borderStyle: 'border-[#10b981]',
    description: 'क्लासिक राजसी हरा और सोने का पारम्परिक डेक',
  },
  {
    id: 'RUBY_CRIMSON',
    name: 'Ruby Crimson',
    nameHi: 'रूबी क्रिमसन वेलवेट',
    imageSrc: '/src/assets/images/card_back_crimson_1795229892990.jpg',
    accentColor: '#ef4444',
    borderStyle: 'border-[#ef4444]',
    description: 'शाही मखमली लाल रंग और मंडला बॉर्डर',
  },
  {
    id: 'SAPPHIRE_BLUE',
    name: 'Sapphire Peacock',
    nameHi: 'नीलम मयूर ब्लू',
    imageSrc: '/src/assets/images/card_back_blue_1795229892922.jpg',
    accentColor: '#3b82f6',
    borderStyle: 'border-[#3b82f6]',
    description: 'रॉयल गहरा नीला और स्वर्ण मयूर नक्काशी',
  },
  {
    id: 'GOLDEN_MAHARAJA',
    name: 'Maharaja Gold',
    nameHi: 'महाराजा गोल्ड स्पेशल',
    accentColor: '#f59e0b',
    borderStyle: 'border-[#f59e0b]',
    description: 'शाही सोने का पैटर्न और मुकुट राजमुद्रा',
  },
  {
    id: 'OBSIDIAN_BLACK',
    name: 'Obsidian Carbon',
    nameHi: 'ऑब्सीडियन डार्क',
    accentColor: '#e5b84b',
    borderStyle: 'border-[#71717a]',
    description: 'आधुनिक कार्बन ब्लैक व गोल्ड लक्जरी स्टाइल',
  },
];

export const FELT_THEMES: FeltThemeConfig[] = [
  {
    id: 'CLASSIC_GREEN',
    name: 'Classic Casino Green',
    nameHi: 'हरा कसीनो फेल्ट',
    bgClass: 'bg-[#092c1e]',
    vignetteStyle: 'radial-gradient(ellipse at 50% 42%, rgba(22, 95, 62, 0.45) 0%, rgba(7, 31, 21, 0.88) 80%)',
  },
  {
    id: 'ROYAL_MAROON',
    name: 'Royal Maroon Baize',
    nameHi: 'शाही महरून टेबल',
    bgClass: 'bg-[#2b0c14]',
    vignetteStyle: 'radial-gradient(ellipse at 50% 42%, rgba(136, 19, 55, 0.45) 0%, rgba(43, 12, 20, 0.9) 80%)',
  },
  {
    id: 'MIDNIGHT_NAVY',
    name: 'Midnight Navy Blue',
    nameHi: 'मिडनाइट नेवी टेबल',
    bgClass: 'bg-[#08182b]',
    vignetteStyle: 'radial-gradient(ellipse at 50% 42%, rgba(15, 45, 80, 0.45) 0%, rgba(8, 24, 43, 0.9) 80%)',
  },
];

interface CardCustomizerModalProps {
  isOpen: boolean;
  currentCardTheme: CardThemeId;
  currentFeltTheme: FeltThemeId;
  onSelectCardTheme: (theme: CardThemeId) => void;
  onSelectFeltTheme: (theme: FeltThemeId) => void;
  onClose: () => void;
}

export const CardCustomizerModal: React.FC<CardCustomizerModalProps> = ({
  isOpen,
  currentCardTheme,
  currentFeltTheme,
  onSelectCardTheme,
  onSelectFeltTheme,
  onClose,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<CardThemeId>(currentCardTheme);
  const [selectedFelt, setSelectedFelt] = useState<FeltThemeId>(currentFeltTheme);
  const [previewFlipped, setPreviewFlipped] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    soundEngine.playCardSwap();
    onSelectCardTheme(selectedTheme);
    onSelectFeltTheme(selectedFelt);
    onClose();
  };

  const sampleCard = {
    id: 'preview-card',
    suit: 'hearts' as const,
    rank: 1 as const,
    isPrintedJoker: false,
    deckIndex: 1 as const,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Customize Cards and Table"
    >
      <div className="w-full max-w-2xl bg-[#092218] border border-[#d4af37]/35 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#061810]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#e5b84b]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-white">
                कार्ड व टेबल बदलें (Customize Cards & Table)
              </h2>
              <p className="text-xs text-[#b6c7be]">
                Choose your favorite royal card back style & table felt
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#b6c7be] hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Live 3D Interactive Card Preview */}
          <div className="p-4 rounded-xl bg-[#061810] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-semibold text-[#e5b84b] flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Card Preview</span>
              </div>
              <p className="text-xs text-[#dbe5df]">
                Tap the card to flip between face and back
              </p>
              <button
                type="button"
                onClick={() => setPreviewFlipped(!previewFlipped)}
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-[#34d399] hover:underline cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>Flip Card (पलटें)</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div
                onClick={() => setPreviewFlipped(!previewFlipped)}
                className="cursor-pointer transition-transform duration-200 hover:scale-105"
              >
                <PlayingCard
                  card={sampleCard}
                  faceDown={!previewFlipped}
                  themeId={selectedTheme}
                  size="lg"
                />
              </div>
              <div
                onClick={() => setPreviewFlipped(!previewFlipped)}
                className="cursor-pointer transition-transform duration-200 hover:scale-105"
              >
                <PlayingCard
                  card={sampleCard}
                  faceDown={previewFlipped}
                  themeId={selectedTheme}
                  size="lg"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Card Back Styles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#e5b84b]" />
                <span>कार्ड बैक डिज़ाइन (Select Card Deck Style)</span>
              </label>
              <span className="text-[11px] text-[#9eb3a8]">5 Skins Available</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CARD_THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setSelectedTheme(theme.id);
                      soundEngine.playSelect();
                    }}
                    className={`min-h-[56px] p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#103828] border-[#e5b84b] shadow-md ring-1 ring-[#e5b84b]'
                        : 'bg-[#061810] border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-12 shrink-0">
                        <PlayingCard faceDown themeId={theme.id} size="xs" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                          <span>{theme.nameHi}</span>
                        </div>
                        <div className="text-[11px] text-[#9eb3a8] truncate">
                          {theme.description}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#e5b84b] border-[#e5b84b] text-[#071f15]'
                          : 'border-white/20 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Table Felt Color */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#e5b84b]" />
              <span>टेबल का रंग (Select Table Surface Color)</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {FELT_THEMES.map((felt) => {
                const isSelected = selectedFelt === felt.id;
                return (
                  <button
                    key={felt.id}
                    type="button"
                    onClick={() => {
                      setSelectedFelt(felt.id);
                      soundEngine.playSelect();
                    }}
                    className={`min-h-[48px] p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#e5b84b] bg-white/10 ring-1 ring-[#e5b84b]'
                        : 'border-white/10 bg-[#061810] hover:bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-0.5">{felt.nameHi}</div>
                    <div className="text-[10px] text-[#9eb3a8]">{felt.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-white/10 bg-[#061810] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-white/15 text-xs text-[#b6c7be] hover:text-white transition-colors cursor-pointer"
          >
            Cancel / रद्द करें
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-[#d4af37] text-[#071f15] font-bold text-xs sm:text-sm hover:bg-[#e5b84b] transition-all cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Apply Changes (लागू करें)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
