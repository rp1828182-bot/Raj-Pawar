import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  BookOpen,
  CheckCircle2,
  Crown,
  Flag,
  FolderPlus,
  Layers,
  LogOut,
  Plus,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PlayingCard } from './components/PlayingCard';
import { RoundSummaryModal } from './components/RoundSummaryModal';
import { RulesModal } from './components/RulesModal';
import { TitleMenu } from './components/TitleMenu';
import { decideBotDiscard, decideBotDraw } from './game/botAI';
import {
  autoGroupHand,
  createDoubleDeck,
  evaluateHand,
  getRankLabel,
  getSuitSymbol,
  resolveWildRank,
  shuffleCards,
  sortGroupCards,
  sortHandBySuit,
} from './game/rummyEngine';
import { soundEngine } from './game/sound';
import {
  Card,
  Difficulty,
  GameMode,
  Player,
  Rank,
  RoundResult,
  ScreenState,
  TableSize,
  TurnPhase,
} from './game/types';

const FELT_BG_IMAGE = '/src/assets/images/royal_table_felt_1795225342247.jpg';
const AVATAR_PLAYER = '/src/assets/images/avatar_player_1795225344862.jpg';
const AVATAR_MEERA = '/src/assets/images/avatar_bot_meera_1795225344504.jpg';
const AVATAR_VIKRAM = '/src/assets/images/avatar_bot_vikram_1795225344382.jpg';

function createInitialPlayers(tableSize: TableSize): Player[] {
  const players: Player[] = [
    {
      id: 'human',
      name: 'You',
      isHuman: true,
      avatarUrl: AVATAR_PLAYER,
      groups: [],
      totalScore: 0,
      dropped: false,
      eliminated: false,
      turnsTaken: 0,
    },
    {
      id: 'bot-meera',
      name: 'Meera',
      isHuman: false,
      avatarUrl: AVATAR_MEERA,
      groups: [],
      totalScore: 0,
      dropped: false,
      eliminated: false,
      turnsTaken: 0,
    },
  ];

  if (tableSize === 3) {
    players.push({
      id: 'bot-vikram',
      name: 'Vikram',
      isHuman: false,
      avatarUrl: AVATAR_VIKRAM,
      groups: [],
      totalScore: 0,
      dropped: false,
      eliminated: false,
      turnsTaken: 0,
    });
  }

  return players;
}

function getModeLabel(mode: GameMode): string {
  switch (mode) {
    case 'POINTS':
      return 'Points Rummy';
    case 'POOL_101':
      return '101 Pool';
    case 'POOL_201':
      return '201 Pool';
    case 'BEST_OF_3':
      return 'Best of 3';
  }
}

export default function App() {
  // Match Configuration
  const [gameMode, setGameMode] = useState<GameMode>('POOL_101');
  const [tableSize, setTableSize] = useState<TableSize>(3);
  const [difficulty, setDifficulty] = useState<Difficulty>('CLUB_PRO');

  // Top-level Game State Machine
  const [screenState, setScreenState] = useState<ScreenState>('TITLE_MENU');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [players, setPlayers] = useState<Player[]>(() => createInitialPlayers(3));
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('DRAW');

  // Deck & Table Piles
  const [closedDeck, setClosedDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [wildIndicatorCard, setWildIndicatorCard] = useState<Card | null>(null);
  const [wildRank, setWildRank] = useState<Rank>(1);

  // Human Interaction State
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [justDrewFromDiscardId, setJustDrewFromDiscardId] = useState<string | null>(null);
  const [newlyDrawnCardId, setNewlyDrawnCardId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Overlays & Audio
  const [rulesOpen, setRulesOpen] = useState(false);
  const [rulesTab, setRulesTab] = useState<'RULES' | 'CAPACITOR'>('RULES');
  const [muted, setMuted] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [matchWinnerName, setMatchWinnerName] = useState<string | undefined>(undefined);

  // Track bot draw-from-discard card ID within a single bot turn
  const botPickedDiscardIdRef = useRef<string | undefined>(undefined);

  const poolLimit = gameMode === 'POOL_101' ? 101 : gameMode === 'POOL_201' ? 201 : null;

  const showToast = useCallback((msg: string) => {
    setFeedbackMessage(msg);
  }, []);

  useEffect(() => {
    if (!feedbackMessage) return;
    const t = setTimeout(() => setFeedbackMessage(null), 3200);
    return () => clearTimeout(t);
  }, [feedbackMessage]);

  const dealNewRound = useCallback(
    (basePlayers: Player[], nextRoundNum: number) => {
      const deck = createDoubleDeck();
      let cursor = 0;

      const dealtPlayers: Player[] = basePlayers.map((p) => {
        if (p.eliminated) {
          return {
            ...p,
            groups: [],
            dropped: true,
            turnsTaken: 0,
            lastAction: 'Eliminated',
          };
        }
        const hand = deck.slice(cursor, cursor + 13);
        cursor += 13;
        return {
          ...p,
          dropped: false,
          turnsTaken: 0,
          lastAction: undefined,
          groups: [hand],
        };
      });

      const wildCut = deck[cursor++];
      const resolvedWild = resolveWildRank(wildCut);
      const firstDiscard = deck[cursor++];
      const remainingDeck = deck.slice(cursor);

      const formattedPlayers = dealtPlayers.map((p) => {
        if (p.eliminated) return p;
        return {
          ...p,
          groups: p.isHuman
            ? sortHandBySuit(p.groups.flat(), resolvedWild)
            : autoGroupHand(p.groups.flat(), resolvedWild),
        };
      });

      // Pick first non-eliminated starter (rotate by roundNumber - 1)
      const activeIndices = formattedPlayers
        .map((p, idx) => (!p.eliminated ? idx : -1))
        .filter((idx) => idx !== -1);
      const starterIndex =
        activeIndices[(nextRoundNum - 1) % activeIndices.length] ?? 0;

      setPlayers(formattedPlayers);
      setWildIndicatorCard(wildCut);
      setWildRank(resolvedWild);
      setDiscardPile([firstDiscard]);
      setClosedDeck(remainingDeck);
      setRoundNumber(nextRoundNum);
      setActivePlayerIndex(starterIndex);
      setTurnPhase('DRAW');
      setSelectedCardIds([]);
      setJustDrewFromDiscardId(null);
      setNewlyDrawnCardId(null);
      setRoundResult(null);
      setFeedbackMessage(null);
      botPickedDiscardIdRef.current = undefined;
      setScreenState('PLAYING');
      soundEngine.playCardSnap();
    },
    []
  );

  const handleStartGame = () => {
    const freshPlayers = createInitialPlayers(tableSize);
    setMatchWinnerName(undefined);
    dealNewRound(freshPlayers, 1);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setMuted(next);
  };

  const humanPlayer = players.find((p) => p.isHuman) ?? players[0];
  const opponents = players.filter((p) => !p.isHuman);
  const activePlayer = players[activePlayerIndex];
  const isHumanTurn =
    screenState === 'PLAYING' &&
    activePlayer?.isHuman &&
    !activePlayer.dropped &&
    !activePlayer.eliminated;

  const humanEvaluation = useMemo(() => {
    return evaluateHand(humanPlayer.groups, wildRank);
  }, [humanPlayer.groups, wildRank]);

  const getNextActiveIndex = useCallback(
    (currentIdx: number, list: Player[]): number => {
      for (let offset = 1; offset <= list.length; offset++) {
        const candidate = (currentIdx + offset) % list.length;
        if (!list[candidate].dropped && !list[candidate].eliminated) {
          return candidate;
        }
      }
      return currentIdx;
    },
    []
  );

  const finalizeRound = useCallback(
    (
      updatedPlayers: Player[],
      winnerId: string,
      winReason: 'VALID_DECLARE' | 'ALL_DROPPED'
    ) => {
      const breakdown = updatedPlayers.map((p) => {
        const arranged = p.isHuman
          ? p.groups
          : autoGroupHand(p.groups.flat(), wildRank);
        const evaluation = evaluateHand(arranged, wildRank);

        let roundPoints = 0;
        if (p.eliminated) {
          roundPoints = 0;
        } else if (p.id === winnerId) {
          roundPoints = 0;
        } else if (p.dropped) {
          roundPoints = p.turnsTaken === 0 ? 20 : 40;
        } else {
          roundPoints = evaluation.deadwoodPoints;
        }

        const newTotal = p.totalScore + roundPoints;
        const newlyEliminated =
          p.eliminated || (poolLimit !== null && newTotal >= poolLimit);

        return {
          playerId: p.id,
          name: p.name,
          isHuman: p.isHuman,
          avatarUrl: p.avatarUrl,
          roundPoints,
          totalScore: newTotal,
          dropped: p.dropped,
          eliminated: newlyEliminated,
          evaluation,
        };
      });

      const syncedPlayers = updatedPlayers.map((p) => {
        const entry = breakdown.find((b) => b.playerId === p.id)!;
        return {
          ...p,
          totalScore: entry.totalScore,
          eliminated: entry.eliminated,
          groups: entry.evaluation.groups.map((g) => g.cards),
        };
      });

      // Check match end conditions
      const survivors = syncedPlayers.filter((p) => !p.eliminated);
      let isMatchOver = false;
      let winnerNameForMatch: string | undefined;

      if (poolLimit !== null && survivors.length <= 1) {
        isMatchOver = true;
        winnerNameForMatch =
          survivors[0]?.name ??
          [...syncedPlayers].sort((a, b) => a.totalScore - b.totalScore)[0]?.name;
      } else if (gameMode === 'BEST_OF_3' && roundNumber >= 3) {
        isMatchOver = true;
        winnerNameForMatch = [...syncedPlayers].sort(
          (a, b) => a.totalScore - b.totalScore
        )[0]?.name;
      }

      const winnerObj = syncedPlayers.find((p) => p.id === winnerId);

      setPlayers(syncedPlayers);
      setMatchWinnerName(winnerNameForMatch);
      setRoundResult({
        roundNumber,
        winnerId,
        winnerName: winnerObj?.name ?? 'Winner',
        winReason,
        playerBreakdown: breakdown,
      });

      if (winnerId === 'human') {
        soundEngine.playVictory();
      } else {
        soundEngine.playCardSnap();
      }

      setScreenState(isMatchOver ? 'GAME_OVER' : 'ROUND_SUMMARY');
    },
    [gameMode, poolLimit, roundNumber, wildRank]
  );

  // Human Draw from Closed Deck
  const handleDrawClosed = () => {
    if (!isHumanTurn || turnPhase !== 'DRAW') return;

    let currentDeck = [...closedDeck];
    let currentDiscard = [...discardPile];

    if (currentDeck.length === 0) {
      if (currentDiscard.length <= 1) {
        showToast('No cards left to draw.');
        return;
      }
      const top = currentDiscard[currentDiscard.length - 1];
      currentDeck = shuffleCards(currentDiscard.slice(0, -1));
      currentDiscard = [top];
    }

    const drawn = currentDeck[0];
    const nextDeck = currentDeck.slice(1);

    setPlayers((prev) =>
      prev.map((p) => {
        if (!p.isHuman) return p;
        const nextGroups = p.groups.length > 0 ? p.groups.map((g) => [...g]) : [[]];
        nextGroups[nextGroups.length - 1].push(drawn);
        return { ...p, groups: nextGroups, lastAction: 'Drew from Deck' };
      })
    );

    setClosedDeck(nextDeck);
    setDiscardPile(currentDiscard);
    setTurnPhase('DISCARD');
    setNewlyDrawnCardId(drawn.id);
    setJustDrewFromDiscardId(null);
    setSelectedCardIds([]);
    soundEngine.playCardSnap();
  };

  // Human Draw from Open Discard Pile
  const handleDrawDiscard = () => {
    if (!isHumanTurn || turnPhase !== 'DRAW') return;
    if (discardPile.length === 0) return;

    const drawn = discardPile[discardPile.length - 1];
    const nextDiscard = discardPile.slice(0, -1);

    setPlayers((prev) =>
      prev.map((p) => {
        if (!p.isHuman) return p;
        const nextGroups = p.groups.length > 0 ? p.groups.map((g) => [...g]) : [[]];
        nextGroups[nextGroups.length - 1].push(drawn);
        return {
          ...p,
          groups: nextGroups,
          lastAction: `Picked ${getRankLabel(drawn.rank)}${getSuitSymbol(drawn.suit)}`,
        };
      })
    );

    setDiscardPile(nextDiscard);
    setTurnPhase('DISCARD');
    setNewlyDrawnCardId(drawn.id);
    setJustDrewFromDiscardId(drawn.id);
    setSelectedCardIds([]);
    soundEngine.playCardSnap();
  };

  // Human Drop
  const handleDrop = () => {
    if (!isHumanTurn || turnPhase !== 'DRAW') return;

    const updated = players.map((p) =>
      p.isHuman
        ? {
            ...p,
            dropped: true,
            lastAction: p.turnsTaken === 0 ? 'First Drop (-20)' : 'Middle Drop (-40)',
          }
        : p
    );

    const remainingActive = updated.filter((p) => !p.dropped && !p.eliminated);
    if (remainingActive.length === 1) {
      finalizeRound(updated, remainingActive[0].id, 'ALL_DROPPED');
      return;
    }

    // In 3-player mode when human drops, settle round cleanly by giving lowest-deadwood active bot the win
    const rankedBots = [...remainingActive].sort((a, b) => {
      const evalA = evaluateHand(autoGroupHand(a.groups.flat(), wildRank), wildRank);
      const evalB = evaluateHand(autoGroupHand(b.groups.flat(), wildRank), wildRank);
      return evalA.deadwoodPoints - evalB.deadwoodPoints;
    });
    finalizeRound(updated, rankedBots[0].id, 'ALL_DROPPED');
  };

  // Human Select Card
  const toggleCardSelection = (cardId: string) => {
    if (screenState !== 'PLAYING') return;
    soundEngine.playSelect();
    setSelectedCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  // Human Sort by Suit
  const handleSortBySuit = () => {
    const allCards = humanPlayer.groups.flat();
    const sorted = sortHandBySuit(allCards, wildRank);
    setPlayers((prev) =>
      prev.map((p) => (p.isHuman ? { ...p, groups: sorted } : p))
    );
    setSelectedCardIds([]);
    soundEngine.playCardSnap();
  };

  // Human Auto-Group
  const handleAutoGroup = () => {
    const allCards = humanPlayer.groups.flat();
    const grouped = autoGroupHand(allCards, wildRank);
    const ev = evaluateHand(grouped, wildRank);
    setPlayers((prev) =>
      prev.map((p) => (p.isHuman ? { ...p, groups: grouped } : p))
    );
    setSelectedCardIds([]);
    if (ev.pureSequenceCount > 0) {
      soundEngine.playPureChime();
    } else {
      soundEngine.playCardSnap();
    }
  };

  // Group Selected Cards into New Group
  const handleGroupSelected = () => {
    if (selectedCardIds.length === 0) return;
    const selectedSet = new Set(selectedCardIds);
    const allCards = humanPlayer.groups.flat();
    const picked = allCards.filter((c) => selectedSet.has(c.id));

    const remainingGroups = humanPlayer.groups
      .map((grp) => grp.filter((c) => !selectedSet.has(c.id)))
      .filter((grp) => grp.length > 0);

    const newGroup = sortGroupCards(picked, wildRank);
    const nextGroups = [...remainingGroups, newGroup];

    setPlayers((prev) =>
      prev.map((p) => (p.isHuman ? { ...p, groups: nextGroups } : p))
    );
    setSelectedCardIds([]);
    soundEngine.playCardSnap();
  };

  // Move Selected Cards into Existing Target Group
  const handleMoveSelectedToGroup = (targetGroupIndex: number) => {
    if (selectedCardIds.length === 0) return;
    const selectedSet = new Set(selectedCardIds);
    const targetOriginal = humanPlayer.groups[targetGroupIndex] ?? [];
    const targetSampleId = targetOriginal[0]?.id;

    const picked = humanPlayer.groups.flat().filter((c) => selectedSet.has(c.id));
    const strippedGroups = humanPlayer.groups
      .map((grp) => grp.filter((c) => !selectedSet.has(c.id)))
      .filter((grp) => grp.length > 0);

    // Find where target group now sits
    let insertIdx = strippedGroups.findIndex((grp) =>
      grp.some((c) => c.id === targetSampleId)
    );
    if (insertIdx === -1) {
      strippedGroups.push(sortGroupCards(picked, wildRank));
    } else {
      strippedGroups[insertIdx] = sortGroupCards(
        [...strippedGroups[insertIdx], ...picked],
        wildRank
      );
    }

    setPlayers((prev) =>
      prev.map((p) => (p.isHuman ? { ...p, groups: strippedGroups } : p))
    );
    setSelectedCardIds([]);
    soundEngine.playCardSnap();
  };

  // Human Discard Selected Card
  const handleDiscardSelected = () => {
    if (!isHumanTurn || turnPhase !== 'DISCARD') return;
    if (selectedCardIds.length !== 1) {
      showToast('Select exactly 1 card to discard.');
      soundEngine.playError();
      return;
    }

    const discardId = selectedCardIds[0];
    if (justDrewFromDiscardId && discardId === justDrewFromDiscardId) {
      showToast('You cannot discard the exact card you just drew from the Open Pile.');
      soundEngine.playError();
      return;
    }

    const discardCard = humanPlayer.groups.flat().find((c) => c.id === discardId);
    if (!discardCard) return;

    const nextGroups = humanPlayer.groups
      .map((grp) => grp.filter((c) => c.id !== discardId))
      .filter((grp) => grp.length > 0);

    const updatedPlayers = players.map((p) =>
      p.isHuman
        ? {
            ...p,
            groups: nextGroups,
            turnsTaken: p.turnsTaken + 1,
            lastAction: `Discarded ${getRankLabel(discardCard.rank)}${getSuitSymbol(discardCard.suit)}`,
          }
        : p
    );

    const nextIdx = getNextActiveIndex(activePlayerIndex, updatedPlayers);
    setPlayers(updatedPlayers);
    setDiscardPile((prev) => [...prev, discardCard]);
    setSelectedCardIds([]);
    setNewlyDrawnCardId(null);
    setJustDrewFromDiscardId(null);
    setActivePlayerIndex(nextIdx);
    setTurnPhase('DRAW');
    soundEngine.playCardSnap();
  };

  // Human Finish & Declare
  const handleDeclare = () => {
    if (!isHumanTurn || turnPhase !== 'DISCARD') return;
    if (selectedCardIds.length !== 1) {
      showToast('Select 1 card for the Finish slot to declare your remaining 13 cards.');
      soundEngine.playError();
      return;
    }

    const finishId = selectedCardIds[0];
    const finishCard = humanPlayer.groups.flat().find((c) => c.id === finishId);
    if (!finishCard) return;

    const remainingGroups = humanPlayer.groups
      .map((grp) => grp.filter((c) => c.id !== finishId))
      .filter((grp) => grp.length > 0);

    let winningGroups = remainingGroups;
    let evalCheck = evaluateHand(remainingGroups, wildRank);

    // Check if auto-grouping the 13 remaining cards satisfies a valid declaration
    if (!evalCheck.isValidDeclaration) {
      const optimal = autoGroupHand(remainingGroups.flat(), wildRank);
      const evalOptimal = evaluateHand(optimal, wildRank);
      if (evalOptimal.isValidDeclaration) {
        winningGroups = optimal;
        evalCheck = evalOptimal;
      }
    }

    if (!evalCheck.isValidDeclaration) {
      soundEngine.playError();
      if (evalCheck.pureSequenceCount === 0) {
        showToast('Cannot declare: You need at least 1 Pure Sequence (no Jokers).');
      } else if (evalCheck.sequenceCount < 2) {
        showToast('Cannot declare: You need at least 2 Sequences (including 1 Pure Sequence).');
      } else {
        showToast(
          `Cannot declare: ${evalCheck.deadwoodPoints} unmelded points remain in the 13 cards.`
        );
      }
      return;
    }

    const updatedPlayers = players.map((p) =>
      p.isHuman
        ? {
            ...p,
            groups: winningGroups,
            turnsTaken: p.turnsTaken + 1,
            lastAction: 'Declared Royal Rummy!',
          }
        : p
    );

    setDiscardPile((prev) => [...prev, finishCard]);
    setSelectedCardIds([]);
    setNewlyDrawnCardId(null);
    setJustDrewFromDiscardId(null);
    finalizeRound(updatedPlayers, 'human', 'VALID_DECLARE');
  };

  // Automated Bot Turn Machine
  useEffect(() => {
    if (screenState !== 'PLAYING') return;
    const current = players[activePlayerIndex];
    if (!current || current.isHuman || current.dropped || current.eliminated) return;

    if (turnPhase === 'DRAW') {
      const timer = setTimeout(() => {
        const botCards = current.groups.flat();
        const topDiscard = discardPile[discardPile.length - 1];
        const choice = decideBotDraw(botCards, topDiscard, wildRank, difficulty);

        let drawnCard: Card | undefined;
        let nextClosed = closedDeck;
        let nextDiscard = discardPile;

        if (choice === 'DISCARD_PILE' && topDiscard) {
          drawnCard = topDiscard;
          nextDiscard = discardPile.slice(0, -1);
          botPickedDiscardIdRef.current = drawnCard.id;
        } else {
          if (closedDeck.length === 0 && discardPile.length > 1) {
            const top = discardPile[discardPile.length - 1];
            nextClosed = shuffleCards(discardPile.slice(0, -1));
            nextDiscard = [top];
          }
          drawnCard = nextClosed[0];
          nextClosed = nextClosed.slice(1);
          botPickedDiscardIdRef.current = undefined;
        }

        if (!drawnCard) return;

        const nextBotCards = [...botCards, drawnCard];
        const nextAction =
          choice === 'DISCARD_PILE'
            ? `Picked ${getRankLabel(drawnCard.rank)}${getSuitSymbol(drawnCard.suit)}`
            : 'Drew from Deck';

        setClosedDeck(nextClosed);
        setDiscardPile(nextDiscard);
        setPlayers((prev) =>
          prev.map((p, idx) =>
            idx === activePlayerIndex
              ? { ...p, groups: [nextBotCards], lastAction: nextAction }
              : p
          )
        );
        setTurnPhase('DISCARD');
        soundEngine.playCardSnap();
      }, 650);

      return () => clearTimeout(timer);
    }

    if (turnPhase === 'DISCARD') {
      const timer = setTimeout(() => {
        const botCards14 = current.groups.flat();
        const decision = decideBotDiscard(
          botCards14,
          wildRank,
          difficulty,
          botPickedDiscardIdRef.current
        );
        botPickedDiscardIdRef.current = undefined;

        if (decision.shouldDeclare) {
          const updatedPlayers = players.map((p, idx) =>
            idx === activePlayerIndex
              ? {
                  ...p,
                  groups: decision.arrangedGroups,
                  turnsTaken: p.turnsTaken + 1,
                  lastAction: 'Declared!',
                }
              : p
          );
          setDiscardPile((prev) => [...prev, decision.discardCard]);
          finalizeRound(updatedPlayers, current.id, 'VALID_DECLARE');
          return;
        }

        const updatedPlayers = players.map((p, idx) =>
          idx === activePlayerIndex
            ? {
                ...p,
                groups: decision.arrangedGroups,
                turnsTaken: p.turnsTaken + 1,
                lastAction: `Discarded ${getRankLabel(decision.discardCard.rank)}${getSuitSymbol(decision.discardCard.suit)}`,
              }
            : p
        );

        const nextIdx = getNextActiveIndex(activePlayerIndex, updatedPlayers);
        setPlayers(updatedPlayers);
        setDiscardPile((prev) => [...prev, decision.discardCard]);
        setActivePlayerIndex(nextIdx);
        setTurnPhase('DRAW');
        soundEngine.playCardSnap();
      }, 750);

      return () => clearTimeout(timer);
    }
  }, [
    activePlayerIndex,
    closedDeck,
    difficulty,
    discardPile,
    finalizeRound,
    getNextActiveIndex,
    players,
    screenState,
    turnPhase,
    wildRank,
  ]);

  if (screenState === 'TITLE_MENU') {
    return (
      <>
        <TitleMenu
          gameMode={gameMode}
          setGameMode={setGameMode}
          tableSize={tableSize}
          setTableSize={setTableSize}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          onStartGame={handleStartGame}
          onOpenRules={(tab) => {
            setRulesTab(tab);
            setRulesOpen(true);
          }}
        />
        <RulesModal
          isOpen={rulesOpen}
          initialTab={rulesTab}
          onClose={() => setRulesOpen(false)}
        />
      </>
    );
  }

  const topDiscardCard = discardPile[discardPile.length - 1];
  const canDrop = isHumanTurn && turnPhase === 'DRAW';
  const dropCost = humanPlayer.turnsTaken === 0 ? 20 : 40;

  // Check if selecting 1 card makes remaining 13 valid for Declare preview
  let canDeclareNow = false;
  if (isHumanTurn && turnPhase === 'DISCARD' && selectedCardIds.length === 1) {
    const finishId = selectedCardIds[0];
    const remGroups = humanPlayer.groups
      .map((g) => g.filter((c) => c.id !== finishId))
      .filter((g) => g.length > 0);
    const manualValid = evaluateHand(remGroups, wildRank).isValidDeclaration;
    if (manualValid) {
      canDeclareNow = true;
    } else {
      const autoValid = evaluateHand(
        autoGroupHand(remGroups.flat(), wildRank),
        wildRank
      ).isValidDeclaration;
      canDeclareNow = autoValid;
    }
  }

  return (
    <div className="min-h-screen flex flex-col royal-felt-surface relative overflow-x-hidden select-none">
      {/* Atmospheric Felt Backdrop */}
      <img
        src={FELT_BG_IMAGE}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
        className="fixed inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
      />

      {/* Compact Top HUD Bar */}
      <header className="relative z-20 w-full border-b border-white/10 bg-[#061810]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-display font-bold text-base sm:text-lg text-[#f5f3ec] whitespace-nowrap shrink-0">
              Royal Rummy
            </span>
            <span className="hidden sm:inline text-xs text-[#b6c7be] truncate">
              Deal {roundNumber}
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              {getModeLabel(gameMode)}
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              Wild: <strong className="text-[#e5b84b]">{getRankLabel(wildRank)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#c7d3cc] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setRulesTab('RULES');
                setRulesOpen(true);
              }}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#dbe5df] hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rules</span>
            </button>
            <button
              type="button"
              onClick={() => setScreenState('TITLE_MENU')}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-medium text-[#dbe5df] hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Table Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-5 flex flex-col justify-between gap-4">
        {/* Opponent Seats Zone */}
        <section
          aria-label="Opponents"
          className={`grid gap-3 ${
            opponents.length === 1 ? 'grid-cols-1 max-w-md mx-auto w-full' : 'grid-cols-2 max-w-3xl mx-auto w-full'
          }`}
        >
          {opponents.map((bot) => {
            const isBotTurn =
              screenState === 'PLAYING' && players[activePlayerIndex]?.id === bot.id;
            const cardCount = bot.groups.flat().length;
            return (
              <div
                key={bot.id}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border transition-colors ${
                  isBotTurn
                    ? 'bg-[#0e3223]/90 border-[#e5b84b]'
                    : 'bg-[#071b13]/80 border-white/10'
                } ${bot.dropped || bot.eliminated ? 'opacity-55' : ''}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={bot.avatarUrl}
                    alt={bot.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover border border-white/20 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {bot.name}
                      </span>
                      <span className="text-xs font-mono-num text-[#e5b84b] whitespace-nowrap">
                        {bot.totalScore} pts
                      </span>
                    </div>
                    <div className="text-xs text-[#b6c7be] truncate">
                      {bot.eliminated
                        ? 'Eliminated'
                        : bot.dropped
                          ? 'Dropped'
                          : isBotTurn
                            ? turnPhase === 'DRAW'
                              ? 'Drawing...'
                              : 'Thinking...'
                            : bot.lastAction ?? 'Waiting'}
                    </div>
                  </div>
                </div>

                {/* Compact opponent facedown card fan + count */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden sm:flex -space-x-5">
                    {Array.from({ length: Math.min(4, Math.max(1, cardCount)) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-9 rounded border border-[#d4af37]/40 bg-[#0b2f20] shadow"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono-num font-semibold text-[#dbe5df]">
                    {cardCount}
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Center Felt Zone: Wild Joker + Closed Deck + Open Discard Pile + Finish Slot */}
        <section
          aria-label="Center Deck and Discard Area"
          className="flex flex-col items-center justify-center gap-3 my-auto py-1"
        >
          {/* Turn Prompt / Toast Banner */}
          <div className="min-h-[28px] flex items-center justify-center text-center px-3">
            {feedbackMessage ? (
              <span className="text-xs sm:text-sm font-medium text-[#fef3c7] bg-[#78350f]/80 border border-[#f59e0b]/40 px-3.5 py-1 rounded-lg">
                {feedbackMessage}
              </span>
            ) : isHumanTurn ? (
              <span className="text-xs sm:text-sm font-semibold text-[#e5b84b]">
                {turnPhase === 'DRAW'
                  ? 'Your Turn — Draw a card from the Closed Deck or Open Pile'
                  : 'Your Turn — Arrange your melds, then select 1 card to Discard or Declare'}
              </span>
            ) : (
              <span className="text-xs sm:text-sm font-medium text-[#c7d3cc]">
                {activePlayer?.name}&apos;s turn
              </span>
            )}
          </div>

          {/* Piles Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-4 py-4 rounded-2xl bg-[#061b12]/65 border border-[#d4af37]/20">
            {/* Wild Joker Cut Indicator */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-[11px] font-medium text-[#e5b84b] flex items-center gap-1">
                <Crown className="w-3 h-3" />
                <span>Wild: {getRankLabel(wildRank)}</span>
              </div>
              {wildIndicatorCard && (
                <div className="relative">
                  <PlayingCard card={wildIndicatorCard} wildRank={wildRank} size="md" />
                </div>
              )}
            </div>

            <div className="h-16 w-px bg-white/10 hidden sm:block" />

            {/* Closed Draw Deck */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-[11px] font-medium text-[#c7d3cc] font-mono-num">
                Deck ({closedDeck.length})
              </div>
              <div
                className={`relative rounded-xl p-1 transition-all ${
                  isHumanTurn && turnPhase === 'DRAW'
                    ? 'ring-2 ring-[#e5b84b] bg-[#d4af37]/10'
                    : ''
                }`}
              >
                <PlayingCard
                  faceDown
                  size="lg"
                  onClick={isHumanTurn && turnPhase === 'DRAW' ? handleDrawClosed : undefined}
                  disabled={!isHumanTurn || turnPhase !== 'DRAW'}
                />
              </div>
              <span className="text-[11px] text-[#9eb3a8]">
                {isHumanTurn && turnPhase === 'DRAW' ? 'Tap to Draw' : 'Closed Deck'}
              </span>
            </div>

            {/* Open Discard Pile */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-[11px] font-medium text-[#c7d3cc] font-mono-num">
                Open Pile ({discardPile.length})
              </div>
              <div
                className={`relative rounded-xl p-1 transition-all ${
                  isHumanTurn && turnPhase === 'DRAW' && topDiscardCard
                    ? 'ring-2 ring-[#34d399] bg-[#10b981]/10'
                    : isHumanTurn && turnPhase === 'DISCARD' && selectedCardIds.length === 1
                      ? 'ring-2 ring-[#e5b84b] bg-[#d4af37]/10'
                      : ''
                }`}
              >
                {topDiscardCard ? (
                  <PlayingCard
                    card={topDiscardCard}
                    wildRank={wildRank}
                    size="lg"
                    onClick={
                      isHumanTurn && turnPhase === 'DRAW'
                        ? handleDrawDiscard
                        : isHumanTurn && turnPhase === 'DISCARD' && selectedCardIds.length === 1
                          ? handleDiscardSelected
                          : undefined
                    }
                  />
                ) : (
                  <button
                    type="button"
                    onClick={
                      isHumanTurn && turnPhase === 'DISCARD' && selectedCardIds.length === 1
                        ? handleDiscardSelected
                        : undefined
                    }
                    className="w-[66px] h-[96px] sm:w-[76px] sm:h-[110px] rounded-xl border border-dashed border-white/25 flex items-center justify-center text-[11px] text-[#9eb3a8]"
                  >
                    Empty
                  </button>
                )}
              </div>
              <span className="text-[11px] text-[#9eb3a8]">
                {isHumanTurn && turnPhase === 'DRAW'
                  ? 'Tap to Pick'
                  : isHumanTurn && turnPhase === 'DISCARD' && selectedCardIds.length === 1
                    ? 'Tap to Discard'
                    : 'Discard Pile'}
              </span>
            </div>

            {/* Finish / Declare Slot */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-[11px] font-medium text-[#c7d3cc]">Finish Slot</div>
              <button
                type="button"
                onClick={handleDeclare}
                disabled={!isHumanTurn || turnPhase !== 'DISCARD' || selectedCardIds.length !== 1}
                className={`w-[66px] h-[96px] sm:w-[76px] sm:h-[110px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 p-2 text-center transition-all ${
                  canDeclareNow
                    ? 'border-[#e5b84b] bg-[#d4af37]/20 text-[#fef3c7] cursor-pointer hover:bg-[#d4af37]/30'
                    : isHumanTurn && turnPhase === 'DISCARD' && selectedCardIds.length === 1
                      ? 'border-white/35 bg-white/5 text-[#dbe5df] cursor-pointer hover:bg-white/10'
                      : 'border-white/15 bg-black/20 text-[#7d9589] cursor-default'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-[10px] font-semibold leading-tight">Declare</span>
              </button>
              <span className="text-[11px] text-[#9eb3a8]">
                {canDeclareNow ? 'Ready!' : '13+1 Show'}
              </span>
            </div>
          </div>
        </section>

        {/* Player Hand & Meld Workspace */}
        <section
          aria-label="Your Hand"
          className="bg-[#061810]/90 border border-white/12 rounded-2xl p-3 sm:p-4 space-y-3"
        >
          {/* Hand Telemetry & Status Strip (No pill clutter — clean typographic separators) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={humanPlayer.avatarUrl}
                alt="You"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-lg object-cover border border-white/20 shrink-0"
              />
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                <span className="font-semibold text-white">You</span>
                <span className="font-mono-num text-[#e5b84b]">
                  Score: {humanPlayer.totalScore}
                  {poolLimit ? `/${poolLimit}` : ''}
                </span>
                <span aria-hidden="true" className="text-white/30">
                  ·
                </span>
                <span
                  className={
                    humanEvaluation.isValidDeclaration
                      ? 'font-semibold text-[#34d399]'
                      : humanEvaluation.pureSequenceCount > 0
                        ? 'text-[#dbe5df]'
                        : 'text-[#fca5a5]'
                  }
                >
                  {humanEvaluation.statusMessage}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono-num text-[#b6c7be]">
              <span>Pure: {humanEvaluation.pureSequenceCount}</span>
              <span aria-hidden="true" className="text-white/30">
                ·
              </span>
              <span>Seq: {humanEvaluation.sequenceCount}</span>
              <span aria-hidden="true" className="text-white/30">
                ·
              </span>
              <span>Deadwood: {humanEvaluation.deadwoodPoints}</span>
            </div>
          </div>

          {/* Grouped Cards Tray */}
          <div className="flex items-end gap-4 sm:gap-5 overflow-x-auto hand-scroll pt-3 pb-2 px-1">
            {humanEvaluation.groups.map((grp, groupIdx) => {
              const hasSelectionOutsideGroup = selectedCardIds.some(
                (id) => !grp.cards.some((c) => c.id === id)
              );

              return (
                <div key={groupIdx} className="flex flex-col gap-1.5 shrink-0">
                  <div className="flex items-center justify-between gap-2 px-0.5">
                    <span
                      className={`text-[11px] font-semibold whitespace-nowrap ${
                        grp.type === 'PURE_SEQUENCE'
                          ? 'text-[#34d399]'
                          : grp.type === 'IMPURE_SEQUENCE'
                            ? 'text-[#e5b84b]'
                            : grp.type === 'SET'
                              ? 'text-[#93c5fd]'
                              : 'text-[#fca5a5]'
                      }`}
                    >
                      {grp.label}
                    </span>

                    {hasSelectionOutsideGroup && (
                      <button
                        type="button"
                        onClick={() => handleMoveSelectedToGroup(groupIdx)}
                        className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#fef3c7] bg-[#d4af37]/25 hover:bg-[#d4af37]/40 border border-[#d4af37]/50 px-1.5 py-0.5 rounded cursor-pointer whitespace-nowrap"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        Move
                      </button>
                    )}
                  </div>

                  <div className="flex items-center -space-x-4 sm:-space-x-5">
                    {grp.cards.map((card) => (
                      <PlayingCard
                        key={card.id}
                        card={card}
                        wildRank={wildRank}
                        selected={selectedCardIds.includes(card.id)}
                        isNew={card.id === newlyDrawnCardId}
                        size="md"
                        onClick={() => toggleCardSelection(card.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Thumb-Friendly Bottom Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSortBySuit}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-xs font-semibold text-[#dbe5df] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Layers className="w-3.5 h-3.5" />
                Sort
              </button>

              <button
                type="button"
                onClick={handleAutoGroup}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-xs font-semibold text-[#dbe5df] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#e5b84b]" />
                Auto-Group
              </button>

              {selectedCardIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleGroupSelected}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10b981]/20 hover:bg-[#10b981]/30 border border-[#34d399]/40 text-xs font-semibold text-[#d1fae5] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  New Group ({selectedCardIds.length})
                </button>
              )}

              {selectedCardIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCardIds([])}
                  className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium text-[#b6c7be] hover:text-white hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canDrop && (
                <button
                  type="button"
                  onClick={handleDrop}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#f87171]/40 bg-[#991b1b]/25 hover:bg-[#991b1b]/45 text-xs font-semibold text-[#fecaca] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Drop (-{dropCost})
                </button>
              )}

              {isHumanTurn && turnPhase === 'DISCARD' && (
                <>
                  <button
                    type="button"
                    onClick={handleDiscardSelected}
                    disabled={selectedCardIds.length !== 1}
                    className={`min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                      selectedCardIds.length === 1
                        ? 'bg-white text-[#071f15] hover:bg-[#f5f3ec] cursor-pointer'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    Discard
                  </button>

                  <button
                    type="button"
                    onClick={handleDeclare}
                    disabled={selectedCardIds.length !== 1}
                    className={`min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                      canDeclareNow
                        ? 'bg-[#d4af37] text-[#071f15] hover:bg-[#e5b84b] cursor-pointer'
                        : selectedCardIds.length === 1
                          ? 'bg-[#d4af37]/30 border border-[#d4af37]/50 text-[#fef3c7] hover:bg-[#d4af37]/45 cursor-pointer'
                          : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Declare
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      <RulesModal
        isOpen={rulesOpen}
        initialTab={rulesTab}
        onClose={() => setRulesOpen(false)}
      />

      {(screenState === 'ROUND_SUMMARY' || screenState === 'GAME_OVER') && roundResult && (
        <RoundSummaryModal
          result={roundResult}
          wildRank={wildRank}
          gameMode={gameMode}
          isGameOver={screenState === 'GAME_OVER'}
          matchWinnerName={matchWinnerName}
          onNextRound={() => dealNewRound(players, roundNumber + 1)}
          onReturnToMenu={() => setScreenState('TITLE_MENU')}
          onPlayAgain={handleStartGame}
        />
      )}
    </div>
  );
}
