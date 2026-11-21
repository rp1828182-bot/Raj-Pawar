import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { soundEngine } from '../game/sound';

interface InGameFriendChatProps {
  onSendMessage: (msg: string) => void;
  activeBubble?: { senderName: string; text: string } | null;
}

const QUICK_PHRASES = [
  'चलो भाई जल्दी खेलो! (Play fast!)',
  'वाह क्या पत्ता मिला! (Great card!)',
  'प्योर सीक्वेंस बन गया! (Pure sequence ready!)',
  'बस एक पत्ता बाकी है! (Only 1 card left!)',
  'बैड लक भाई! (Bad luck!)',
  'गुड गेम यार! (Well played!)',
  'जोकर दे दो यार! (Give me a Joker!)',
];

export const InGameFriendChat: React.FC<InGameFriendChatProps> = ({
  onSendMessage,
  activeBubble,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = (phrase: string) => {
    soundEngine.playSelect();
    onSendMessage(phrase);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Active Speech Bubble */}
      {activeBubble && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-[#0f2d1e] border-2 border-[#e5b84b] text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#e5b84b] shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">
            <span className="text-[#e5b84b] font-bold">{activeBubble.senderName}: </span>
            <span>{activeBubble.text}</span>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Friends Chat & Reactions"
        className="min-h-[40px] px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-[#dbe5df] flex items-center gap-1.5 cursor-pointer transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5 text-[#34d399]" />
        <span className="hidden sm:inline">चैट (Chat)</span>
      </button>

      {/* Quick Chat Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#092218] border border-[#d4af37]/40 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#e5b84b]" />
                क्विक डायलॉग (Quick Friend Chat)
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded flex items-center justify-center text-[#b6c7be] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {QUICK_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(phrase)}
                  className="w-full text-left p-2.5 rounded-xl bg-[#061810] hover:bg-[#103828] border border-white/10 hover:border-[#e5b84b]/60 text-xs text-[#dbe5df] transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span>{phrase}</span>
                  <Send className="w-3 h-3 text-[#34d399]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
