import React, { useState } from 'react';
import { Crown } from 'lucide-react';
import { getRankLabel, getSuitSymbol, isRedSuit, isWildCard } from '../game/rummyEngine';
import { Card, Rank } from '../game/types';

export const CARD_BACK_IMAGE = '/src/assets/images/royal_card_back_1795225341494.jpg';

interface PlayingCardProps {
  card?: Card;
  wildRank?: Rank;
  faceDown?: boolean;
  selected?: boolean;
  isNew?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<PlayingCardProps['size']>, string> = {
  xs: 'w-9 h-[52px] rounded-md',
  sm: 'w-12 h-[70px] rounded-lg',
  md: 'w-[58px] h-[84px] sm:w-[68px] sm:h-[98px] rounded-lg',
  lg: 'w-[66px] h-[96px] sm:w-[76px] sm:h-[110px] rounded-xl',
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  wildRank = 0,
  faceDown = false,
  selected = false,
  isNew = false,
  size = 'md',
  onClick,
  disabled = false,
  className = '',
}) => {
  const [backImgFailed, setBackImgFailed] = useState(false);

  const sizeClass = SIZE_CLASSES[size];

  if (faceDown || !card) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || !onClick}
        aria-label="Face-down playing card"
        className={`relative overflow-hidden border border-[#d4af37]/40 bg-[#0b2f20] select-none transition-transform duration-150 ease-out playing-card-shadow ${sizeClass} ${
          onClick && !disabled ? 'cursor-pointer hover:-translate-y-1 active:scale-[0.98]' : 'cursor-default'
        } ${className}`}
      >
        {!backImgFailed ? (
          <img
            src={CARD_BACK_IMAGE}
            alt="Royal card back"
            referrerPolicy="no-referrer"
            onError={() => setBackImgFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-1 bg-gradient-to-br from-[#0e3f2a] via-[#4a1019] to-[#0b2f20]">
            <div className="w-full h-full border border-[#d4af37]/60 rounded flex items-center justify-center">
              <span className="text-[#d4af37] text-sm font-display">R</span>
            </div>
          </div>
        )}
      </button>
    );
  }

  const wild = wildRank > 0 && isWildCard(card, wildRank);
  const red = isRedSuit(card.suit);
  const rankText = getRankLabel(card.rank);
  const suitChar = getSuitSymbol(card.suit);

  const textColor = card.isPrintedJoker
    ? 'text-[#7c2d12]'
    : red
      ? 'text-[#c81e1e]'
      : 'text-[#18181b]';

  const cornerTextSize =
    size === 'xs'
      ? 'text-[10px] leading-none'
      : size === 'sm'
        ? 'text-xs leading-none'
        : 'text-sm sm:text-[15px] leading-none';

  const centerSuitSize =
    size === 'xs'
      ? 'text-base'
      : size === 'sm'
        ? 'text-xl'
        : size === 'md'
          ? 'text-2xl sm:text-[28px]'
          : 'text-[28px] sm:text-3xl';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      aria-pressed={selected}
      aria-label={`${rankText} of ${card.suit}${wild ? ' (Wild Joker)' : ''}`}
      className={`group relative flex flex-col justify-between bg-[#fcfbf7] border select-none text-left transition-transform duration-150 ease-out focus-visible:outline-2 focus-visible:outline-[#e5b84b] focus-visible:outline-offset-2 ${sizeClass} ${
        selected
          ? '-translate-y-3 border-[#e5b84b] playing-card-selected-shadow z-20'
          : 'border-[#d6d0c4] playing-card-shadow hover:-translate-y-1'
      } ${onClick && !disabled ? 'cursor-pointer' : 'cursor-default'} ${
        size === 'xs' ? 'p-1' : 'p-1.5 sm:p-2'
      } ${className}`}
    >
      {/* Top-left corner index */}
      <div className={`flex flex-col items-center w-fit font-bold tracking-tight ${textColor}`}>
        <span className={cornerTextSize}>{rankText}</span>
        <span className={size === 'xs' ? 'text-[9px]' : 'text-xs'}>{suitChar}</span>
      </div>

      {/* Center pip or Joker crest */}
      <div className={`flex flex-col items-center justify-center my-auto ${textColor}`}>
        {card.isPrintedJoker ? (
          <div className="flex flex-col items-center">
            <Crown className={size === 'xs' ? 'w-3.5 h-3.5 text-[#b45309]' : 'w-5 h-5 sm:w-6 sm:h-6 text-[#b45309]'} />
            {size !== 'xs' && (
              <span className="text-[8px] sm:text-[9px] font-bold tracking-wider uppercase text-[#b45309] mt-0.5">
                Joker
              </span>
            )}
          </div>
        ) : (
          <span className={`${centerSuitSize} leading-none`}>{suitChar}</span>
        )}
      </div>

      {/* Bottom-right corner index */}
      {size !== 'xs' && (
        <div
          className={`flex flex-col items-center w-fit self-end rotate-180 font-bold tracking-tight ${textColor}`}
        >
          <span className={cornerTextSize}>{rankText}</span>
          <span className="text-xs">{suitChar}</span>
        </div>
      )}

      {/* Wild Joker gold corner marker */}
      {wild && !card.isPrintedJoker && size !== 'xs' && (
        <div
          title="Wild Joker"
          className="absolute top-1 right-1 flex items-center gap-0.5 bg-[#fef3c7] border border-[#d4af37]/70 text-[#92400e] px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight"
        >
          <Crown className="w-2.5 h-2.5" />
          {size !== 'sm' && <span>Wild</span>}
        </div>
      )}

      {/* Newly drawn marker */}
      {isNew && size !== 'xs' && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#d4af37] text-[#071f15] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
          New
        </span>
      )}
    </button>
  );
};
