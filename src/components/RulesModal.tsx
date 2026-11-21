import React, { useEffect, useState } from 'react';
import { BookOpen, Check, Copy, Smartphone, X } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  initialTab?: 'RULES' | 'CAPACITOR';
  onClose: () => void;
}

const CAPACITOR_COMMANDS = `npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Royal Rummy" "com.royalrummy.app" --web-dir dist
npm run build
npx cap add android
npx cap open android`;

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  initialTab = 'RULES',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'RULES' | 'CAPACITOR'>(initialTab);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CAPACITOR_COMMANDS);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked in restricted iframe
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Royal Rummy Rules and Build Guide"
    >
      <div className="w-full max-w-2xl bg-[#0c261b] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-display font-bold text-[#f5f3ec]">
            Royal Rummy Reference
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#c7d3cc] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Tab Selector */}
        <div className="px-6 pt-4">
          <div className="inline-flex items-center gap-1 p-1 bg-[#071911] rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('RULES')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'RULES'
                  ? 'bg-[#d4af37] text-[#071f15]'
                  : 'text-[#b6c7be] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Rules & Scoring
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CAPACITOR')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'CAPACITOR'
                  ? 'bg-[#d4af37] text-[#071f15]'
                  : 'text-[#b6c7be] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Android Capacitor
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#dbe5df] leading-relaxed">
          {activeTab === 'RULES' ? (
            <>
              <section className="space-y-2">
                <h3 className="text-base font-semibold text-[#e5b84b]">
                  Objective (13-Card Royal Rummy)
                </h3>
                <p>
                  Arrange all 13 cards in your hand into valid Sequences and Sets. To make a valid
                  Declaration, you must have at least <strong>two Sequences</strong>, and at least
                  one of them must be a <strong>Pure Sequence</strong>.
                </p>
              </section>

              <div className="grid sm:grid-cols-3 gap-4 border-t border-white/10 pt-4">
                <div className="space-y-1">
                  <div className="font-semibold text-[#34d399]">Pure Sequence</div>
                  <p className="text-xs text-[#b6c7be]">
                    3 or more consecutive cards of the exact same suit without any Printed Joker
                    (e.g., 4♠ 5♠ 6♠ or Q♥ K♥ A♥).
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-[#e5b84b]">Impure Sequence</div>
                  <p className="text-xs text-[#b6c7be]">
                    3 or more consecutive cards of the same suit using Wild or Printed Jokers to
                    fill missing ranks (e.g., 7♦ Joker 9♦).
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-[#93c5fd]">Set</div>
                  <p className="text-xs text-[#b6c7be]">
                    3 or 4 cards of the same rank in strictly different suits. Jokers may
                    substitute for missing suits (e.g., K♠ K♥ Joker).
                  </p>
                </div>
              </div>

              <section className="space-y-2 border-t border-white/10 pt-4">
                <h3 className="text-base font-semibold text-[#e5b84b]">
                  Scoring & Wild Jokers
                </h3>
                <ul className="space-y-1.5 text-xs text-[#c7d3cc] list-disc pl-5">
                  <li>
                    <strong>Wild Joker:</strong> One card is cut at the start of every deal. All
                    cards of that rank across all suits (plus Printed Jokers) are worth{' '}
                    <span className="font-mono-num text-white">0</span> points.
                  </li>
                  <li>
                    <strong>Card Values:</strong> A, K, Q, J, 10 count{' '}
                    <span className="font-mono-num text-white">10</span> points each. Cards 2–9
                    count their face value. Maximum penalty per deal is capped at{' '}
                    <span className="font-mono-num text-white">80</span> points.
                  </li>
                  <li>
                    <strong>Without a Pure Sequence:</strong> All non-joker cards in your hand count
                    toward penalty points if an opponent declares first.
                  </li>
                  <li>
                    <strong>Drop Options:</strong> First-turn drop before drawing costs{' '}
                    <span className="font-mono-num text-white">20</span> pts; Middle drop costs{' '}
                    <span className="font-mono-num text-white">40</span> pts.
                  </li>
                </ul>
              </section>
            </>
          ) : (
            <section className="space-y-4">
              <p className="text-sm text-[#dbe5df]">
                This project includes <code className="text-[#e5b84b]">capacitor.config.ts</code>{' '}
                pre-configured for <span className="font-semibold text-white">Royal Rummy</span>{' '}
                (<code className="text-[#e5b84b]">com.royalrummy.app</code>) pointing to{' '}
                <code className="text-[#e5b84b]">dist</code>. Run each command on its own line in
                your local terminal:
              </p>

              <div className="relative bg-[#06140e] border border-white/15 rounded-xl p-4">
                <pre className="text-xs font-mono-num text-[#d1fae5] overflow-x-auto leading-6">
                  {CAPACITOR_COMMANDS}
                </pre>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#34d399]" />
                      Copied Commands
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Commands
                    </>
                  )}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 rounded-lg bg-[#d4af37] text-[#071f15] text-sm font-semibold hover:bg-[#e5b84b] transition-colors cursor-pointer whitespace-nowrap"
          >
            Back to Table
          </button>
        </div>
      </div>
    </div>
  );
};
