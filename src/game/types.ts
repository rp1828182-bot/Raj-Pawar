export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

// Rank 1 = Ace, 11 = Jack, 12 = Queen, 13 = King, 0 = Printed Joker
export type Rank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
  id: string;
  suit: Suit | 'joker';
  rank: Rank;
  isPrintedJoker: boolean;
  deckIndex: 1 | 2;
}

export type MeldType = 'PURE_SEQUENCE' | 'IMPURE_SEQUENCE' | 'SET' | 'INVALID';

export interface GroupEvaluation {
  cards: Card[];
  type: MeldType;
  label: string;
  points: number;
}

export interface HandEvaluation {
  groups: GroupEvaluation[];
  pureSequenceCount: number;
  sequenceCount: number;
  setCount: number;
  invalidGroupCount: number;
  deadwoodPoints: number;
  isValidDeclaration: boolean;
  statusMessage: string;
}

export type GameMode = 'POINTS' | 'POOL_101' | 'POOL_201' | 'BEST_OF_3';
export type Difficulty = 'CASUAL' | 'CLUB_PRO';
export type TableSize = 2 | 3;

export type ScreenState = 'TITLE_MENU' | 'PLAYING' | 'ROUND_SUMMARY' | 'GAME_OVER';
export type TurnPhase = 'DRAW' | 'DISCARD';

export interface Player {
  id: string;
  name: string;
  isHuman: boolean;
  avatarUrl: string;
  groups: Card[][];
  totalScore: number;
  dropped: boolean;
  eliminated: boolean;
  turnsTaken: number;
  lastAction?: string;
}

export interface RoundResult {
  roundNumber: number;
  winnerId: string;
  winnerName: string;
  winReason: 'VALID_DECLARE' | 'ALL_DROPPED';
  playerBreakdown: {
    playerId: string;
    name: string;
    isHuman: boolean;
    avatarUrl: string;
    roundPoints: number;
    totalScore: number;
    dropped: boolean;
    eliminated: boolean;
    evaluation: HandEvaluation;
  }[];
}
