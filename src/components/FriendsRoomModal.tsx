import React, { useState } from 'react';
import {
  Check,
  Coins,
  Copy,
  Plus,
  Share2,
  Smartphone,
  Sparkles,
  Users,
  Wifi,
  X,
} from 'lucide-react';
import { soundEngine } from '../game/sound';
import { TableSize } from '../game/types';

export const AVATAR_PRIYA = '/src/assets/images/avatar_friend_priya_1795229894154.jpg';
export const AVATAR_RAHUL = '/src/assets/images/avatar_friend_rahul_1795229894404.jpg';
export const AVATAR_YOU = '/src/assets/images/avatar_player_1795225344862.jpg';

export interface FriendsGameConfig {
  roomCode: string;
  tableSize: TableSize;
  isPassNPlay: boolean;
  stake: number; // 0 for free, 5, 10
  players: {
    id: string;
    name: string;
    avatarUrl: string;
    isHuman: boolean;
  }[];
}

interface FriendsRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFriendsGame: (config: FriendsGameConfig) => void;
}

export const FriendsRoomModal: React.FC<FriendsRoomModalProps> = ({
  isOpen,
  onClose,
  onStartFriendsGame,
}) => {
  const [tab, setTab] = useState<'CREATE' | 'JOIN' | 'LOBBY'>('CREATE');
  const [roomCode, setRoomCode] = useState(() => `RM-${Math.floor(1000 + Math.random() * 9000)}`);
  const [inputCode, setInputCode] = useState('');
  const [tableSize, setTableSize] = useState<TableSize>(3);
  const [isPassNPlay, setIsPassNPlay] = useState(false);
  const [stake, setStake] = useState<number>(10); // ₹10 friendly table by default
  const [copied, setCopied] = useState(false);

  // Simulated friends joining the lobby
  const [friendsInLobby, setFriendsInLobby] = useState([
    { id: 'human', name: 'You (Host)', avatarUrl: AVATAR_YOU, ready: true, isHuman: true },
    { id: 'friend-rahul', name: 'Rahul', avatarUrl: AVATAR_RAHUL, ready: true, isHuman: false },
    { id: 'friend-priya', name: 'Priya', avatarUrl: AVATAR_PRIYA, ready: true, isHuman: false },
  ]);

  if (!isOpen) return null;

  const handleCreateRoom = () => {
    soundEngine.playSelect();
    const newCode = `RM-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomCode(newCode);

    const lobbyPlayers = [
      { id: 'human', name: isPassNPlay ? 'Player 1' : 'You (Host)', avatarUrl: AVATAR_YOU, ready: true, isHuman: true },
      { id: 'friend-rahul', name: isPassNPlay ? 'Player 2 (Rahul)' : 'Rahul', avatarUrl: AVATAR_RAHUL, ready: true, isHuman: isPassNPlay },
    ];
    if (tableSize === 3) {
      lobbyPlayers.push({
        id: 'friend-priya',
        name: isPassNPlay ? 'Player 3 (Priya)' : 'Priya',
        avatarUrl: AVATAR_PRIYA,
        ready: true,
        isHuman: isPassNPlay,
      });
    }
    setFriendsInLobby(lobbyPlayers);
    setTab('LOBBY');
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    soundEngine.playSelect();
    setRoomCode(inputCode.toUpperCase());

    setFriendsInLobby([
      { id: 'human', name: 'You', avatarUrl: AVATAR_YOU, ready: true, isHuman: true },
      { id: 'friend-rahul', name: 'Rahul (Host)', avatarUrl: AVATAR_RAHUL, ready: true, isHuman: false },
      { id: 'friend-priya', name: 'Priya', avatarUrl: AVATAR_PRIYA, ready: true, isHuman: false },
    ]);
    setTab('LOBBY');
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopied(true);
    soundEngine.playSelect();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartMatch = () => {
    soundEngine.playCoins();
    onStartFriendsGame({
      roomCode,
      tableSize,
      isPassNPlay,
      stake,
      players: friendsInLobby.map((p) => ({
        id: p.id,
        name: p.name,
        avatarUrl: p.avatarUrl,
        isHuman: p.isHuman,
      })),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Play with Friends"
    >
      <div className="w-full max-w-xl bg-[#092218] border border-[#d4af37]/35 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#061810]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#e5b84b]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-white flex items-center gap-2">
                <span>दोस्तों के साथ खेलें (Play with Friends)</span>
              </h2>
              <p className="text-xs text-[#b6c7be]">
                Private Table · Play Online with Room Code or Pass & Play
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

        {/* Tab Navigation if not in Lobby */}
        {tab !== 'LOBBY' && (
          <div className="flex border-b border-white/10 bg-[#071d14]">
            <button
              type="button"
              onClick={() => setTab('CREATE')}
              className={`flex-1 min-h-[44px] py-2.5 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                tab === 'CREATE'
                  ? 'bg-[#0e3526] text-[#e5b84b] border-b-2 border-[#e5b84b]'
                  : 'text-[#b6c7be] hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>प्राइवेट टेबल बनाएं (Create Room)</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('JOIN')}
              className={`flex-1 min-h-[44px] py-2.5 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                tab === 'JOIN'
                  ? 'bg-[#0e3526] text-[#e5b84b] border-b-2 border-[#e5b84b]'
                  : 'text-[#b6c7be] hover:text-white'
              }`}
            >
              <Wifi className="w-4 h-4" />
              <span>कोड से जुड़ें (Join Room)</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {tab === 'CREATE' && (
            <div className="space-y-4">
              {/* Gameplay Style: Online vs Pass & Play */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#c7d3cc] block">
                  खेलने का तरीका (Play Mode)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPassNPlay(false)}
                    className={`min-h-[48px] p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      !isPassNPlay
                        ? 'bg-[#103a2a] border-[#e5b84b] text-white'
                        : 'bg-[#061810] border-white/10 text-[#b6c7be] hover:bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-[#34d399]" />
                      <span>Online Private Room</span>
                    </div>
                    <div className="text-[10px] text-[#9eb3a8] mt-0.5">
                      Share room code with friends
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPassNPlay(true)}
                    className={`min-h-[48px] p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      isPassNPlay
                        ? 'bg-[#103a2a] border-[#e5b84b] text-white'
                        : 'bg-[#061810] border-white/10 text-[#b6c7be] hover:bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#e5b84b]" />
                      <span>Pass &amp; Play (एक ही स्क्रीन)</span>
                    </div>
                    <div className="text-[10px] text-[#9eb3a8] mt-0.5">
                      Play together taking turns
                    </div>
                  </button>
                </div>
              </div>

              {/* Table Seats */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#c7d3cc] block">
                  खिलाड़ी संख्या (Table Seats)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTableSize(2)}
                    className={`min-h-[44px] py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      tableSize === 2
                        ? 'bg-[#d4af37] text-[#071f15] font-bold'
                        : 'bg-[#061810] text-[#b6c7be] border-white/10 hover:text-white'
                    }`}
                  >
                    2 Players (1 vs 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableSize(3)}
                    className={`min-h-[44px] py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      tableSize === 3
                        ? 'bg-[#d4af37] text-[#071f15] font-bold'
                        : 'bg-[#061810] text-[#b6c7be] border-white/10 hover:text-white'
                    }`}
                  >
                    3 Players (You + 2 Friends)
                  </button>
                </div>
              </div>

              {/* Table Stakes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#c7d3cc] block">
                  टेबल स्टेक / दांव (Table Stake)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 0, label: 'Free (मौज-मस्ती)', sub: 'Zero Cost' },
                    { val: 5, label: '₹5 Friendly', sub: 'Prize: ₹14' },
                    { val: 10, label: '₹10 Bonus Match', sub: 'Prize: ₹28' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setStake(s.val)}
                      className={`min-h-[50px] p-2 rounded-xl border text-center transition-colors cursor-pointer ${
                        stake === s.val
                          ? 'bg-[#103a2a] border-[#e5b84b] text-white'
                          : 'bg-[#061810] border-white/10 text-[#b6c7be] hover:bg-white/5'
                      }`}
                    >
                      <div className="text-xs font-bold">{s.label}</div>
                      <div className="text-[10px] text-[#e5b84b]">{s.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Create */}
              <button
                type="button"
                onClick={handleCreateRoom}
                className="w-full min-h-[48px] rounded-xl bg-[#d4af37] text-[#071f15] font-bold text-sm hover:bg-[#e5b84b] transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <Users className="w-4 h-4" />
                <span>कमरा बनाएं व दोस्तों को बुलाएं (Create Room)</span>
              </button>
            </div>
          )}

          {tab === 'JOIN' && (
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#c7d3cc] block">
                  Enter 6-Digit Room Code (दोस्त का कोड डालें)
                </label>
                <input
                  type="text"
                  required
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="e.g. RM-8492"
                  className="w-full bg-[#061810] border border-white/15 rounded-xl px-4 py-3 text-base text-center font-mono tracking-widest text-[#e5b84b] placeholder-white/20 uppercase focus:outline-none focus:border-[#e5b84b]"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#061810] border border-white/10 text-xs text-[#b6c7be] space-y-1">
                <div className="font-semibold text-white">How to Join:</div>
                <p className="text-[11px] leading-relaxed text-[#9eb3a8]">
                  Ask your friend who created the table for the 6-character room code. Enter it above to
                  immediately take your seat at their table!
                </p>
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] rounded-xl bg-[#d4af37] text-[#071f15] font-bold text-sm hover:bg-[#e5b84b] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Wifi className="w-4 h-4" />
                <span>कमरे में शामिल हों (Join Table)</span>
              </button>
            </form>
          )}

          {tab === 'LOBBY' && (
            <div className="space-y-5">
              {/* Room Code Display */}
              <div className="p-4 rounded-xl bg-[#061810] border border-[#d4af37]/35 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] text-[#9eb3a8]">Room Code (कमरा कोड)</div>
                  <div className="text-2xl font-mono font-bold text-[#e5b84b] tracking-wider">
                    {roomCode}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-xs font-semibold text-[#4ade80] flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Connected Friends Seats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#c7d3cc]">
                  <span>खिलाड़ी (Players In Lobby: {friendsInLobby.length}/{tableSize})</span>
                  <span className="text-[#34d399]">All Ready</span>
                </div>

                <div className="space-y-2">
                  {friendsInLobby.map((friend) => (
                    <div
                      key={friend.id}
                      className="p-3 rounded-xl bg-[#071b13] border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={friend.avatarUrl}
                          alt={friend.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover border border-[#d4af37]/30"
                        />
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                            <span>{friend.name}</span>
                            {friend.id === 'human' && (
                              <span className="text-[10px] text-[#e5b84b] bg-[#d4af37]/15 px-1.5 py-0.5 rounded">
                                Host
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#34d399] flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Ready to Play</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-mono-num text-[#e5b84b]">
                        {stake > 0 ? `Entry: ₹${stake}` : 'Free'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setTab('CREATE')}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-white/15 text-xs text-[#b6c7be] hover:text-white transition-colors cursor-pointer"
                >
                  Back (वापस)
                </button>
                <button
                  type="button"
                  onClick={handleStartMatch}
                  className="flex-1 min-h-[48px] rounded-xl bg-[#d4af37] text-[#071f15] font-bold text-xs sm:text-sm hover:bg-[#e5b84b] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>मैच शुरू करें (Start Friends Match)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
