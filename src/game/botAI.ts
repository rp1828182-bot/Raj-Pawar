import { autoGroupHand, evaluateHand, getCardPoints, isWildCard } from './rummyEngine';
import { Card, Difficulty, Rank } from './types';

export function decideBotDraw(
  botCards: Card[],
  topDiscard: Card | undefined,
  wildRank: Rank,
  difficulty: Difficulty
): 'DISCARD_PILE' | 'CLOSED_DECK' {
  if (!topDiscard) return 'CLOSED_DECK';

  // Bots in Club Pro eagerly grab wild cards from discard if allowed, or cards that reduce deadwood
  const currentEval = evaluateHand(autoGroupHand(botCards, wildRank), wildRank);

  if (isWildCard(topDiscard, wildRank)) {
    return difficulty === 'CLUB_PRO' || Math.random() > 0.25 ? 'DISCARD_PILE' : 'CLOSED_DECK';
  }

  // Simulate drawing topDiscard and dropping worst card
  const withDiscard = [...botCards, topDiscard];
  let bestNewDeadwood = currentEval.deadwoodPoints;
  let improvesDeclaration = false;

  for (let i = 0; i < withDiscard.length; i++) {
    if (withDiscard[i].id === topDiscard.id) continue;
    const remaining = withDiscard.filter((_, idx) => idx !== i);
    const evalNext = evaluateHand(autoGroupHand(remaining, wildRank), wildRank);
    if (evalNext.isValidDeclaration) {
      improvesDeclaration = true;
      break;
    }
    if (evalNext.deadwoodPoints < bestNewDeadwood) {
      bestNewDeadwood = evalNext.deadwoodPoints;
    }
  }

  if (improvesDeclaration) return 'DISCARD_PILE';

  const threshold = difficulty === 'CLUB_PRO' ? 4 : 7;
  if (currentEval.deadwoodPoints - bestNewDeadwood >= threshold) {
    return 'DISCARD_PILE';
  }

  return 'CLOSED_DECK';
}

export interface BotDiscardDecision {
  shouldDeclare: boolean;
  discardCard: Card;
  arrangedGroups: Card[][];
}

export function decideBotDiscard(
  botCards14: Card[],
  wildRank: Rank,
  difficulty: Difficulty,
  justDrewFromDiscardId?: string
): BotDiscardDecision {
  // Check if removing any single card yields a valid 13-card declaration
  for (let i = 0; i < botCards14.length; i++) {
    const candidateDiscard = botCards14[i];
    const remaining13 = botCards14.filter((_, idx) => idx !== i);
    const grouped = autoGroupHand(remaining13, wildRank);
    const eval13 = evaluateHand(grouped, wildRank);
    if (eval13.isValidDeclaration) {
      return {
        shouldDeclare: true,
        discardCard: candidateDiscard,
        arrangedGroups: grouped,
      };
    }
  }

  // Otherwise pick discard that yields lowest deadwood (and prefers shedding high unmelded cards)
  let bestIdx = -1;
  let bestScore = Number.POSITIVE_INFINITY;
  let bestGroups: Card[][] = [];

  for (let i = 0; i < botCards14.length; i++) {
    const candidate = botCards14[i];
    // Cannot immediately discard the exact card just picked from the open discard pile
    if (justDrewFromDiscardId && candidate.id === justDrewFromDiscardId && botCards14.length > 1) {
      continue;
    }

    const remaining13 = botCards14.filter((_, idx) => idx !== i);
    const grouped = autoGroupHand(remaining13, wildRank);
    const eval13 = evaluateHand(grouped, wildRank);

    // Penalty for discarding a wild card so bot strongly keeps jokers
    const wildPenalty = isWildCard(candidate, wildRank) ? 200 : 0;
    // Slight preference to shed higher point cards when deadwood ties
    const cardPointsBonus = difficulty === 'CLUB_PRO' ? -getCardPoints(candidate, wildRank) * 0.05 : 0;
    // Penalty for breaking a pure sequence
    const pureBonus = eval13.pureSequenceCount > 0 ? -25 : 0;

    const score = eval13.deadwoodPoints + wildPenalty + pureBonus + cardPointsBonus;
    if (score < bestScore) {
      bestScore = score;
      bestIdx = i;
      bestGroups = grouped;
    }
  }

  if (bestIdx === -1) bestIdx = 0;

  return {
    shouldDeclare: false,
    discardCard: botCards14[bestIdx],
    arrangedGroups: bestGroups,
  };
}
