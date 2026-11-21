import { Card, GroupEvaluation, HandEvaluation, MeldType, Rank, Suit } from './types';

export const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
export const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export function getRankLabel(rank: Rank): string {
  switch (rank) {
    case 0:
      return 'JKR';
    case 1:
      return 'A';
    case 11:
      return 'J';
    case 12:
      return 'Q';
    case 13:
      return 'K';
    default:
      return String(rank);
  }
}

export function getSuitSymbol(suit: Suit | 'joker'): string {
  switch (suit) {
    case 'spades':
      return '♠';
    case 'hearts':
      return '♥';
    case 'diamonds':
      return '♦';
    case 'clubs':
      return '♣';
    case 'joker':
      return '★';
  }
}

export function isRedSuit(suit: Suit | 'joker'): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

export function isWildCard(card: Card, wildRank: Rank): boolean {
  return card.isPrintedJoker || card.rank === wildRank;
}

export function getCardPoints(card: Card, wildRank: Rank): number {
  if (isWildCard(card, wildRank)) return 0;
  if (card.rank === 1 || card.rank >= 10) return 10;
  return card.rank;
}

export function createDoubleDeck(): Card[] {
  const deck: Card[] = [];
  for (const deckIndex of [1, 2] as const) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({
          id: `${deckIndex}-${suit}-${rank}`,
          suit,
          rank,
          isPrintedJoker: false,
          deckIndex,
        });
      }
    }
    deck.push({
      id: `${deckIndex}-joker-0`,
      suit: 'joker',
      rank: 0,
      isPrintedJoker: true,
      deckIndex,
    });
  }
  return shuffleCards(deck);
}

export function shuffleCards<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function resolveWildRank(cutCard: Card): Rank {
  // In standard 13-card Rummy, if a Printed Joker is cut as wild indicator, Aces become Wild Jokers
  return cutCard.isPrintedJoker ? 1 : cutCard.rank;
}

function isConsecutiveNaturalRanks(ranks: number[]): boolean {
  if (ranks.length < 3) return false;
  const sorted = [...ranks].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) return false;
  }
  return true;
}

export function isPureSequence(cards: Card[]): boolean {
  if (cards.length < 3 || cards.length > 13) return false;
  if (cards.some((c) => c.isPrintedJoker)) return false;

  const firstSuit = cards[0].suit;
  if (!cards.every((c) => c.suit === firstSuit)) return false;

  const rawRanks = cards.map((c) => c.rank as number);
  // Check duplicate ranks
  if (new Set(rawRanks).size !== rawRanks.length) return false;

  // Check Ace as 1 (A-2-3...)
  if (isConsecutiveNaturalRanks(rawRanks)) return true;

  // Check Ace as 14 (...Q-K-A)
  if (rawRanks.includes(1)) {
    const aceHigh = rawRanks.map((r) => (r === 1 ? 14 : r));
    if (isConsecutiveNaturalRanks(aceHigh)) return true;
  }

  return false;
}

export function isImpureSequence(cards: Card[], wildRank: Rank): boolean {
  if (cards.length < 3 || cards.length > 13) return false;

  const naturals = cards.filter((c) => !isWildCard(c, wildRank));
  if (naturals.length === 0) return false; // Pure joker clusters alone don't form a valid sequence

  const suit = naturals[0].suit;
  if (!naturals.every((c) => c.suit === suit)) return false;

  const rawRanks = naturals.map((c) => c.rank as number);
  if (new Set(rawRanks).size !== rawRanks.length) return false;

  const checkSpan = (ranks: number[]): boolean => {
    const min = Math.min(...ranks);
    const max = Math.max(...ranks);
    return max - min + 1 <= cards.length;
  };

  if (checkSpan(rawRanks)) return true;

  if (rawRanks.includes(1)) {
    const aceHigh = rawRanks.map((r) => (r === 1 ? 14 : r));
    if (checkSpan(aceHigh)) return true;
  }

  return false;
}

export function isValidSet(cards: Card[], wildRank: Rank): boolean {
  if (cards.length < 3 || cards.length > 4) return false;

  const naturals = cards.filter((c) => !isWildCard(c, wildRank));
  if (naturals.length === 0) return true; // 3 or 4 jokers can stand as a set

  const targetRank = naturals[0].rank;
  if (!naturals.every((c) => c.rank === targetRank)) return false;

  const suits = naturals.map((c) => c.suit);
  if (new Set(suits).size !== suits.length) return false;

  return true;
}

export function evaluateGroup(cards: Card[], wildRank: Rank): GroupEvaluation {
  const points = cards.reduce((sum, c) => sum + getCardPoints(c, wildRank), 0);

  let type: MeldType = 'INVALID';
  let label = 'Invalid';

  if (isPureSequence(cards)) {
    type = 'PURE_SEQUENCE';
    label = 'Pure Seq';
  } else if (isImpureSequence(cards, wildRank)) {
    type = 'IMPURE_SEQUENCE';
    label = 'Impure Seq';
  } else if (isValidSet(cards, wildRank)) {
    type = 'SET';
    label = 'Set';
  } else {
    type = 'INVALID';
    label = points > 0 ? `Unmelded · ${points}` : 'Unmelded';
  }

  return { cards, type, label, points };
}

export function evaluateHand(groups: Card[][], wildRank: Rank): HandEvaluation {
  const nonEmptyGroups = groups.filter((g) => g.length > 0);
  const evaluations = nonEmptyGroups.map((g) => evaluateGroup(g, wildRank));

  const pureSequenceCount = evaluations.filter((g) => g.type === 'PURE_SEQUENCE').length;
  const impureSequenceCount = evaluations.filter((g) => g.type === 'IMPURE_SEQUENCE').length;
  const sequenceCount = pureSequenceCount + impureSequenceCount;
  const setCount = evaluations.filter((g) => g.type === 'SET').length;
  const invalidGroupCount = evaluations.filter((g) => g.type === 'INVALID').length;

  const totalCards = nonEmptyGroups.reduce((sum, g) => sum + g.length, 0);

  // Authentic 13-card Royal Rummy deadwood scoring
  let rawDeadwood = 0;
  if (pureSequenceCount === 0) {
    // Without at least 1 pure sequence, all non-joker cards count
    rawDeadwood = evaluations.reduce((sum, g) => sum + g.points, 0);
  } else if (sequenceCount < 2) {
    // With 1 pure sequence but no 2nd sequence, everything outside pure sequences counts
    rawDeadwood = evaluations
      .filter((g) => g.type !== 'PURE_SEQUENCE')
      .reduce((sum, g) => sum + g.points, 0);
  } else {
    // With >= 2 sequences (at least 1 pure), all valid melds are safe; only invalid groups count
    rawDeadwood = evaluations
      .filter((g) => g.type === 'INVALID')
      .reduce((sum, g) => sum + g.points, 0);
  }

  const deadwoodPoints = Math.min(80, rawDeadwood);
  const isValidDeclaration =
    totalCards === 13 &&
    pureSequenceCount >= 1 &&
    sequenceCount >= 2 &&
    invalidGroupCount === 0;

  let statusMessage = 'Form a Pure Sequence first';
  if (isValidDeclaration) {
    statusMessage = 'Valid Hand · Ready to Declare';
  } else if (pureSequenceCount === 0) {
    statusMessage = `Need 1 Pure Sequence · ${deadwoodPoints} pts`;
  } else if (sequenceCount < 2) {
    statusMessage = `Need 2nd Sequence · ${deadwoodPoints} pts`;
  } else if (invalidGroupCount > 0) {
    statusMessage = `${deadwoodPoints} Deadwood pts remaining`;
  }

  return {
    groups: evaluations,
    pureSequenceCount,
    sequenceCount,
    setCount,
    invalidGroupCount,
    deadwoodPoints,
    isValidDeclaration,
    statusMessage,
  };
}

export function sortGroupCards(cards: Card[], wildRank: Rank): Card[] {
  const suitOrder: Record<Suit | 'joker', number> = {
    spades: 0,
    hearts: 1,
    clubs: 2,
    diamonds: 3,
    joker: 4,
  };

  return [...cards].sort((a, b) => {
    const aWild = a.isPrintedJoker ? 1 : 0;
    const bWild = b.isPrintedJoker ? 1 : 0;
    if (aWild !== bWild) return aWild - bWild;
    if (suitOrder[a.suit] !== suitOrder[b.suit]) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    const rA = a.rank === 1 && cards.some((c) => c.rank === 13 && c.suit === a.suit) ? 14 : a.rank;
    const rB = b.rank === 1 && cards.some((c) => c.rank === 13 && c.suit === b.suit) ? 14 : b.rank;
    if (rA !== rB) return rA - rB;
    return getCardPoints(a, wildRank) - getCardPoints(b, wildRank);
  });
}

export function sortHandBySuit(cards: Card[], wildRank: Rank): Card[][] {
  const buckets: Record<Suit | 'joker', Card[]> = {
    spades: [],
    hearts: [],
    clubs: [],
    diamonds: [],
    joker: [],
  };

  for (const card of cards) {
    if (isWildCard(card, wildRank)) {
      buckets.joker.push(card);
    } else {
      buckets[card.suit].push(card);
    }
  }

  const groups: Card[][] = [];
  for (const key of ['spades', 'hearts', 'clubs', 'diamonds', 'joker'] as const) {
    if (buckets[key].length > 0) {
      groups.push(sortGroupCards(buckets[key], wildRank));
    }
  }
  return groups;
}

interface CandidateMeld {
  mask: number;
  indices: number[];
  type: 'PURE_SEQUENCE' | 'IMPURE_SEQUENCE' | 'SET';
  savedPoints: number;
}

export function autoGroupHand(cards: Card[], wildRank: Rank): Card[][] {
  const n = cards.length;
  if (n === 0) return [];

  const jokerIndices: number[] = [];
  const naturalIndices: number[] = [];
  for (let i = 0; i < n; i++) {
    if (isWildCard(cards[i], wildRank)) {
      jokerIndices.push(i);
    } else {
      naturalIndices.push(i);
    }
  }

  const candidates: CandidateMeld[] = [];
  const seenMasks = new Set<number>();

  const addCandidate = (indices: number[], type: CandidateMeld['type']) => {
    let mask = 0;
    let savedPoints = 0;
    for (const idx of indices) {
      mask |= 1 << idx;
      savedPoints += getCardPoints(cards[idx], wildRank);
    }
    if (!seenMasks.has(mask)) {
      seenMasks.add(mask);
      candidates.push({ mask, indices, type, savedPoints });
    }
  };

  // 1. Find Pure Sequences (using all cards except Printed Jokers, grouped by suit)
  for (const suit of SUITS) {
    const suitIndices = cards
      .map((c, idx) => ({ c, idx }))
      .filter(({ c }) => !c.isPrintedJoker && c.suit === suit)
      .map(({ idx }) => idx);

    if (suitIndices.length < 3) continue;

    // Deduplicate same-rank cards per suit (keep first, second can appear in another run)
    const byRank = new Map<number, number[]>();
    for (const idx of suitIndices) {
      const r = cards[idx].rank;
      if (!byRank.has(r)) byRank.set(r, []);
      byRank.get(r)!.push(idx);
    }

    // Enumerate consecutive runs (Ace-low and Ace-high)
    const checkRunsForAceMode = (aceHigh: boolean) => {
      const rankList = Array.from(byRank.keys())
        .map((r) => (aceHigh && r === 1 ? 14 : r))
        .sort((a, b) => a - b);

      for (let start = 0; start < rankList.length; start++) {
        const runRanks: number[] = [rankList[start]];
        for (let next = start + 1; next < rankList.length; next++) {
          if (rankList[next] === runRanks[runRanks.length - 1] + 1) {
            runRanks.push(rankList[next]);
            if (runRanks.length >= 3 && runRanks.length <= 6) {
              const origRanks = runRanks.map((r) => (aceHigh && r === 14 ? 1 : r));
              const indices = origRanks.map((r) => byRank.get(r)![0]);
              addCandidate(indices, 'PURE_SEQUENCE');
            }
          } else {
            break;
          }
        }
      }
    };

    checkRunsForAceMode(false);
    if (byRank.has(1)) checkRunsForAceMode(true);
  }

  // 2. Find Sets (same rank, distinct suits, with 0..2 jokers)
  const natByRank = new Map<Rank, number[]>();
  for (const idx of naturalIndices) {
    const r = cards[idx].rank;
    if (!natByRank.has(r)) natByRank.set(r, []);
    natByRank.get(r)!.push(idx);
  }

  for (const [, idxs] of natByRank.entries()) {
    // Pick distinct suits
    const distinctBySuit: number[] = [];
    const seenSuit = new Set<string>();
    for (const idx of idxs) {
      if (!seenSuit.has(cards[idx].suit)) {
        seenSuit.add(cards[idx].suit);
        distinctBySuit.push(idx);
      }
    }

    if (distinctBySuit.length >= 3) {
      addCandidate(distinctBySuit.slice(0, 3), 'SET');
      if (distinctBySuit.length === 4) {
        addCandidate(distinctBySuit, 'SET');
      }
      // Also 3-card subsets of 4 distinct suits
      if (distinctBySuit.length === 4) {
        for (let skip = 0; skip < 4; skip++) {
          addCandidate(
            distinctBySuit.filter((_, i) => i !== skip),
            'SET'
          );
        }
      }
    }
    if (distinctBySuit.length >= 2 && jokerIndices.length >= 1) {
      for (let i = 0; i < distinctBySuit.length; i++) {
        for (let j = i + 1; j < distinctBySuit.length; j++) {
          addCandidate([distinctBySuit[i], distinctBySuit[j], jokerIndices[0]], 'SET');
          if (jokerIndices.length >= 2) {
            addCandidate([distinctBySuit[i], distinctBySuit[j], jokerIndices[0], jokerIndices[1]], 'SET');
          }
        }
      }
    }
    if (distinctBySuit.length >= 1 && jokerIndices.length >= 2) {
      addCandidate([distinctBySuit[0], jokerIndices[0], jokerIndices[1]], 'SET');
    }
  }

  // 3. Find Impure Sequences (same suit natural anchors + 1..2 jokers)
  if (jokerIndices.length >= 1) {
    for (const suit of SUITS) {
      const natSuit = naturalIndices.filter((idx) => cards[idx].suit === suit);
      if (natSuit.length === 0) continue;

      // 2 naturals + 1 or 2 jokers
      for (let i = 0; i < natSuit.length; i++) {
        for (let j = i + 1; j < natSuit.length; j++) {
          const idxA = natSuit[i];
          const idxB = natSuit[j];
          const rA = cards[idxA].rank;
          const rB = cards[idxB].rank;
          if (rA === rB) continue;

          const minGap = (aceHigh: boolean) => {
            const a = aceHigh && rA === 1 ? 14 : rA;
            const b = aceHigh && rB === 1 ? 14 : rB;
            return Math.abs(a - b) - 1;
          };

          const gap = Math.min(minGap(false), rA === 1 || rB === 1 ? minGap(true) : 99);
          if (gap <= 1) {
            addCandidate([idxA, idxB, jokerIndices[0]], 'IMPURE_SEQUENCE');
          }
          if (gap === 2 && jokerIndices.length >= 2) {
            addCandidate([idxA, idxB, jokerIndices[0], jokerIndices[1]], 'IMPURE_SEQUENCE');
          }
        }
        // 1 natural + 2 jokers
        if (jokerIndices.length >= 2) {
          addCandidate([natSuit[i], jokerIndices[0], jokerIndices[1]], 'IMPURE_SEQUENCE');
        }
      }

      // 3 naturals + 1 joker (e.g., 4-5-7 + joker)
      if (natSuit.length >= 3) {
        for (let i = 0; i < natSuit.length; i++) {
          for (let j = i + 1; j < natSuit.length; j++) {
            for (let k = j + 1; k < natSuit.length; k++) {
              const sub = [natSuit[i], natSuit[j], natSuit[k], jokerIndices[0]];
              if (isImpureSequence(sub.map((x) => cards[x]), wildRank)) {
                addCandidate(sub, 'IMPURE_SEQUENCE');
              }
            }
          }
        }
      }
    }
  }

  // Sort candidates: Pure sequences first, then Impure sequences, then high-point Sets
  candidates.sort((a, b) => {
    const typeScore = (t: CandidateMeld['type']) =>
      t === 'PURE_SEQUENCE' ? 3 : t === 'IMPURE_SEQUENCE' ? 2 : 1;
    if (typeScore(a.type) !== typeScore(b.type)) {
      return typeScore(b.type) - typeScore(a.type);
    }
    return b.savedPoints - a.savedPoints;
  });

  // Search for optimal disjoint combination of melds
  let bestScore = -1;
  let bestMelds: CandidateMeld[] = [];
  let steps = 0;
  const MAX_STEPS = 4500;

  const totalNaturalPoints = naturalIndices.reduce(
    (sum, idx) => sum + getCardPoints(cards[idx], wildRank),
    0
  );

  function computePartitionQuality(chosen: CandidateMeld[]): number {
    let pureCount = 0;
    let seqCount = 0;
    let purePoints = 0;
    let seqPoints = 0;
    let setPoints = 0;

    for (const m of chosen) {
      if (m.type === 'PURE_SEQUENCE') {
        pureCount++;
        seqCount++;
        purePoints += m.savedPoints;
      } else if (m.type === 'IMPURE_SEQUENCE') {
        seqCount++;
        seqPoints += m.savedPoints;
      } else {
        setPoints += m.savedPoints;
      }
    }

    // Heavily prioritize satisfying 1 Pure Seq + 2nd Seq, then minimizing deadwood
    if (pureCount === 0) {
      return setPoints * 0.25 + seqPoints * 0.25;
    }
    if (seqCount < 2) {
      return 1000 + purePoints + setPoints * 0.2;
    }
    const deadwood = Math.max(0, totalNaturalPoints - (purePoints + seqPoints + setPoints));
    return 5000 + (100 - deadwood) * 10 + pureCount * 5;
  }

  function dfs(startIdx: number, usedMask: number, chosen: CandidateMeld[]) {
    if (steps++ > MAX_STEPS) return;

    const quality = computePartitionQuality(chosen);
    if (quality > bestScore) {
      bestScore = quality;
      bestMelds = [...chosen];
    }

    for (let i = startIdx; i < candidates.length; i++) {
      const cand = candidates[i];
      if ((cand.mask & usedMask) !== 0) continue;
      chosen.push(cand);
      dfs(i + 1, usedMask | cand.mask, chosen);
      chosen.pop();
      if (steps > MAX_STEPS) return;
    }
  }

  dfs(0, 0, []);

  // Build final groups from bestMelds + remaining unmelded cards
  const usedSet = new Set<number>();
  const resultGroups: Card[][] = [];

  for (const meld of bestMelds) {
    const groupCards = meld.indices.map((idx) => {
      usedSet.add(idx);
      return cards[idx];
    });
    resultGroups.push(sortGroupCards(groupCards, wildRank));
  }

  const remaining: Card[] = [];
  for (let i = 0; i < n; i++) {
    if (!usedSet.has(i)) {
      remaining.push(cards[i]);
    }
  }

  if (remaining.length > 0) {
    resultGroups.push(sortGroupCards(remaining, wildRank));
  }

  return resultGroups;
}
