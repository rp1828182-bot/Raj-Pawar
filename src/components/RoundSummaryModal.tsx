import React from 'react';
import { Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import { GameMode, Rank, RoundResult } from '../game/types';
import { PlayingCard } from './PlayingCard';

interface RoundSummaryModalProps {
  result: RoundResult;
  wildRank: Rank;
  gameMode: GameMode;
  isGameOver: boolean;
  matchWinnerName?: string;
  onNextRound: () => void;
  onReturnToMenu: () => void;
  onPlayAgain: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  result,
  wildRank,
  gameMode,
  isGameOver,
  matchWinnerName,
  onNextRound,
  onReturnToMenu,
  onPlayAgain,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Round Summary"
    >
      <div className="w-full max-w-4xl bg-[#0b2319] border border-[#d4af37]/35 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-[#081a12]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#e5b84b]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white">
                {isGameOver
                  ? `${matchWinnerName ?? result.winnerName} Wins the Match`
                  : `${result.winnerName} Wins Deal ${result.roundNumber}`}
              </h2>
              <p className="text-xs text-[#b6c7be]">
                {result.winReason === 'ALL_DROPPED'
                  ? 'Opponents dropped out'
                  : 'Valid 13-Card Declaration'}
                <span className="mx-1.5" aria-hidden="true">
                  ·
                </span>
                <span>
                  {gameMode === 'POINTS'
                    ? 'Points Rummy'
                    : gameMode === 'POOL_101'
                      ? '101 Pool'
                      : gameMode === 'POOL_201'
                        ? '201 Pool'
                        : 'Best of 3'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Players Breakdown */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {result.playerBreakdown.map((entry) => {
            const isRoundWinner = entry.playerId === result.winnerId;
            return (
              <div
                key={entry.playerId}
                className={`rounded-xl border p-4 ${
                  isRoundWinner
                    ? 'bg-[#0f3525]/70 border-[#34d399]/40'
                    : 'bg-[#071810]/70 border-white/10'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={entry.avatarUrl}
                      alt={entry.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-lg object-cover border border-white/15"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {entry.name}
                        </span>
                        <span className="text-xs text-[#b6c7be]">
                          {isRoundWinner
                            ? '· Winner'
                            : entry.dropped
                              ? '· Dropped'
                              : entry.eliminated
                                ? '· Eliminated'
                                : '· Show'}
                        </span>
                      </div>
                      <p className="text-xs text-[#9eb3a8]">
                        {entry.dropped
                          ? 'Forfeited this deal'
                          : entry.evaluation.statusMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="text-[11px] text-[#9eb3a8]">Deal Points</div>
                      <div
                        className={`text-base font-mono-num font-bold ${
                          entry.roundPoints === 0 ? 'text-[#34d399]' : 'text-[#fca5a5]'
                        }`}
                      >
                        +{entry.roundPoints}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#9eb3a8]">Total Score</div>
                      <div className="text-base font-mono-num font-bold text-white">
                        {entry.totalScore}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cards grouped */}
                <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
                  {entry.evaluation.groups.map((grp, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <span
                        className={`text-[10px] font-semibold ${
                          grp.type === 'PURE_SEQUENCE'
                            ? 'text-[#34d399]'
                            : grp.type === 'IMPURE_SEQUENCE' || grp.type === 'SET'
                              ? 'text-[#e5b84b]'
                              : 'text-[#fca5a5]'
                        }`}
                      >
                        {grp.label}
                      </span>
                      <div className="flex items-center -space-x-2">
                        {grp.cards.map((card) => (
                          <PlayingCard
                            key={card.id}
                            card={card}
                            wildRank={wildRank}
                            size="xs"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#081a12] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReturnToMenu}
            className="min-h-[44px] px-4 py-2 rounded-lg border border-white/15 text-sm font-medium text-[#dbe5df] hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
          >
            Table Setup
          </button>

          {isGameOver ? (
            <button
              type="button"
              onClick={onPlayAgain}
              className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#d4af37] text-[#071f15] text-sm font-semibold hover:bg-[#e5b84b] transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
          ) : (
            <button
              type="button"
              onClick={onNextRound}
              className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#d4af37] text-[#071f15] text-sm font-semibold hover:bg-[#e5b84b] transition-colors cursor-pointer whitespace-nowrap"
            >
              Deal Next Round
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
