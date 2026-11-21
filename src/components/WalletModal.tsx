import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowDownLeft,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Gift,
  HelpCircle,
  Info,
  Loader2,
  Lock,
  PlusCircle,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { soundEngine } from '../game/sound';
import { WalletState } from '../game/types';

interface WalletModalProps {
  isOpen: boolean;
  wallet: WalletState;
  onClose: () => void;
  onTopUpDemo: (amount: number) => void;
  initialTab?: 'WITHDRAW' | 'OVERVIEW';
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  wallet,
  onClose,
  onTopUpDemo,
  initialTab = 'WITHDRAW',
}) => {
  const [activeTab, setActiveTab] = useState<'WITHDRAW' | 'OVERVIEW'>(initialTab);

  // Withdrawal form fields
  const [withdrawMethod, setWithdrawMethod] = useState<'UPI' | 'BANK'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [amount, setAmount] = useState<string>('200');

  // Realistic mock processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playSelect();
    setIsProcessing(true);

    // Realistic banking network handshake delay (1.4s)
    setTimeout(() => {
      setIsProcessing(false);
      soundEngine.playError();
      setShowFailureModal(true);
    }, 1400);
  };

  const handleCopyRef = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDemoReload = () => {
    soundEngine.playCoins();
    onTopUpDemo(50);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Cash Wallet and Withdrawal"
    >
      <div className="w-full max-w-xl bg-[#092218] border border-[#d4af37]/35 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#061810]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#e5b84b]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-white flex items-center gap-2">
                <span>Royal Cashier</span>
                <span className="text-[11px] font-sans font-semibold text-[#34d399] bg-[#10b981]/20 border border-[#34d399]/30 px-2 py-0.5 rounded">
                  ₹10 Bonus Active
                </span>
              </h2>
              <p className="text-xs text-[#b6c7be]">
                सुरक्षित वॉलेट व निकासी प्रणाली · Instant UPI / Bank
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

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 bg-[#071d14]">
          <button
            type="button"
            onClick={() => setActiveTab('WITHDRAW')}
            className={`flex-1 min-h-[44px] py-2.5 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'WITHDRAW'
                ? 'bg-[#0e3526] text-[#e5b84b] border-b-2 border-[#e5b84b]'
                : 'text-[#b6c7be] hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Withdraw / निकासी</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex-1 min-h-[44px] py-2.5 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-[#0e3526] text-[#e5b84b] border-b-2 border-[#e5b84b]'
                : 'text-[#b6c7be] hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Balance & Bonus (बैलेंस)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Wallet Balance Strip */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-[#061810] border border-white/10">
            <div>
              <div className="text-[11px] text-[#9eb3a8] flex items-center gap-1">
                <span>Total Balance</span>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono-num text-white">
                ₹{wallet.totalBalance.toFixed(2)}
              </div>
            </div>

            <div className="border-l border-white/10 pl-2.5">
              <div className="text-[11px] text-[#e5b84b] flex items-center gap-1">
                <Gift className="w-3 h-3 text-[#e5b84b]" />
                <span>Bonus Cash</span>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono-num text-[#e5b84b]">
                ₹{wallet.bonusCash.toFixed(2)}
              </div>
              <div className="text-[9px] text-[#9eb3a8] leading-none mt-0.5">₹10 Welcome</div>
            </div>

            <div className="border-l border-white/10 pl-2.5">
              <div className="text-[11px] text-[#34d399] flex items-center gap-1">
                <span>Withdrawable</span>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono-num text-[#34d399]">
                ₹{wallet.winningCash.toFixed(2)}
              </div>
              <div className="text-[9px] text-[#9eb3a8] leading-none mt-0.5">Winnings only</div>
            </div>
          </div>

          {activeTab === 'WITHDRAW' ? (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#c7d3cc] block">
                  Select Payout Method / निकासी का तरीका
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('UPI')}
                    className={`min-h-[44px] p-3 rounded-xl border flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                      withdrawMethod === 'UPI'
                        ? 'bg-[#103a2a] border-[#e5b84b] text-white'
                        : 'bg-[#061810] border-white/10 text-[#b6c7be] hover:bg-white/5'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-[#e5b84b] shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">UPI Transfer</div>
                      <div className="text-[10px] text-[#9eb3a8]">GPay, PhonePe, Paytm</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('BANK')}
                    className={`min-h-[44px] p-3 rounded-xl border flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                      withdrawMethod === 'BANK'
                        ? 'bg-[#103a2a] border-[#e5b84b] text-white'
                        : 'bg-[#061810] border-white/10 text-[#b6c7be] hover:bg-white/5'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-[#e5b84b] shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Bank IMPS / NEFT</div>
                      <div className="text-[10px] text-[#9eb3a8]">Direct to Bank Account</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Method Specific Inputs */}
              {withdrawMethod === 'UPI' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#c7d3cc] block">
                    Enter UPI ID / वीपीए आईडी
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi or username@okhdfcbank"
                      className="w-full bg-[#061810] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#e5b84b]"
                    />
                    <QrCode className="w-4 h-4 text-white/30 absolute right-3.5 top-3" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div>
                    <label className="text-xs font-semibold text-[#c7d3cc] block mb-1">
                      Account Number / बैंक खाता संख्या
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter 11-16 digit account number"
                      className="w-full bg-[#061810] border border-white/15 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#e5b84b]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-[#c7d3cc] block mb-1">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        required
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="SBIN0001234"
                        className="w-full bg-[#061810] border border-white/15 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white uppercase placeholder-white/30 focus:outline-none focus:border-[#e5b84b]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#c7d3cc] block mb-1">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        required
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="Name as per Passbook"
                        className="w-full bg-[#061810] border border-white/15 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#e5b84b]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Amount Input & Quick Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#c7d3cc]">
                    Withdrawal Amount / निकासी राशि (₹)
                  </label>
                  <span className="text-[11px] text-[#f87171] font-medium">
                    न्यूनतम ₹200 (Min. ₹200)
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm sm:text-base font-bold text-[#e5b84b]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="10"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#061810] border border-white/15 rounded-xl pl-8 pr-3.5 py-2.5 text-sm sm:text-base font-mono-num font-bold text-white focus:outline-none focus:border-[#e5b84b]"
                  />
                </div>
                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 pt-1">
                  {['100', '200', '500', '1000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`min-h-[36px] flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        amount === val
                          ? 'bg-[#e5b84b] text-[#071f15]'
                          : 'bg-[#061810] text-[#b6c7be] border border-white/10 hover:bg-white/5'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms Warning Note */}
              <div className="p-3 rounded-xl bg-[#061810]/80 border border-white/10 text-xs text-[#b6c7be] space-y-1">
                <div className="flex items-center gap-1.5 text-[#e5b84b] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Fair Play & Payout Policy</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#9eb3a8]">
                  • आपका ₹10 स्वागत बोनस गेम खेलने के लिए उपयोग किया जा सकता है।
                  <br />
                  • निकासी केवल कैश टेबल पर जीती गई राशि (Winnings) की ही संभव है।
                  <br />• 24x7 Instant IMPS transfer powered by NPCI.
                </p>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full min-h-[48px] rounded-xl bg-[#d4af37] text-[#071f15] font-bold text-sm hover:bg-[#e5b84b] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>बैंक गेटवे से संपर्क हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Withdraw Now / पैसे निकालें (₹{amount || '0'})</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* OVERVIEW TAB */
            <div className="space-y-4">
              {/* Welcome Bonus Callout */}
              <div className="p-4 rounded-xl bg-[#123826] border border-[#34d399]/40 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#34d399]/20 flex items-center justify-center text-[#34d399] shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>₹10 Welcome Bonus Unlocked!</span>
                    <Sparkles className="w-4 h-4 text-[#e5b84b]" />
                  </div>
                  <p className="text-xs text-[#dbe5df] leading-relaxed">
                    बधाई हो! आपके खाते में ₹10 का साइन-अप बोनस जमा हो चुका है। आप इस राशि से ₹2, ₹5 या ₹10
                    वाले कैश टेबल तुरंत खेल सकते हैं और जीत सकते हैं!
                  </p>
                </div>
              </div>

              {/* Balance Breakdown Cards */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-[#061810] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">बोनस कैश (Bonus Cash)</div>
                    <div className="text-[11px] text-[#9eb3a8]">टेबल एंट्री फीस के लिए 100% मान्य</div>
                  </div>
                  <div className="text-sm font-bold font-mono-num text-[#e5b84b]">
                    ₹{wallet.bonusCash.toFixed(2)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#061810] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">जीत की राशि (Winnings)</div>
                    <div className="text-[11px] text-[#9eb3a8]">कैश टेबल में जीते हुए कॉइन्स</div>
                  </div>
                  <div className="text-sm font-bold font-mono-num text-[#34d399]">
                    ₹{wallet.winningCash.toFixed(2)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#061810] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">जमा राशि (Deposit Cash)</div>
                    <div className="text-[11px] text-[#9eb3a8]">गेमप्ले वॉलेट बैलेंस</div>
                  </div>
                  <div className="text-sm font-bold font-mono-num text-white">
                    ₹{wallet.depositCash.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Free Reload Action */}
              <div className="p-4 rounded-xl bg-[#082015] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-[#e5b84b]" />
                    <span>फ्री प्रैक्टिस टॉप-अप (+₹50)</span>
                  </div>
                  <div className="text-[11px] text-[#9eb3a8]">
                    अगर आपका बैलेंस कम हो जाए तो मुफ्त अभ्यास चिप्स प्राप्त करें
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDemoReload}
                  className="min-h-[40px] px-4 py-2 rounded-lg bg-[#10b981]/25 hover:bg-[#10b981]/40 border border-[#34d399]/40 text-xs font-bold text-[#34d399] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Add +₹50 Demo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#061810] flex items-center justify-between text-[11px] text-[#9eb3a8]">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#34d399]" />
            256-Bit SSL Encrypted
          </span>
          <span>100% Legal & Skill-Based Rummy</span>
        </div>
      </div>

      {/* FAILURE & BLOCKED WITHDRAWAL MODAL (Fulfills: "widrol ka option hona lekhin widrol nhi hona") */}
      {showFailureModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in"
          role="alertdialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#101b15] border-2 border-[#ef4444]/60 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/40 flex items-center justify-center text-[#ef4444] mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-display font-bold text-white">
                निकासी अनुरोध अस्वीकृत!
              </h3>
              <p className="text-xs font-semibold text-[#f87171]">
                Withdrawal Request Blocked · Policy Notice
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1c1313] border border-[#ef4444]/30 space-y-2.5 text-xs text-[#fecaca]">
              <div className="space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                  1. बोनस कैश निकासी योग्य नहीं है (Bonus Cash Non-Withdrawable)
                </div>
                <p className="text-[11px] text-[#fca5a5] pl-3 leading-relaxed">
                  आपके वॉलेट में वर्तमान में उपलब्ध ₹10 स्वागत बोनस राशि है। फेयर-प्ले नियमों के अनुसार बोनस
                  कैश से केवल गेम खेले जा सकते हैं; इसे सीधे बैंक में नहीं निकाला जा सकता।
                </p>
              </div>

              <div className="space-y-1 border-t border-[#ef4444]/20 pt-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                  2. न्यूनतम निकासी सीमा ₹200 (Minimum ₹200 Limit)
                </div>
                <p className="text-[11px] text-[#fca5a5] pl-3 leading-relaxed">
                  बैंक निकासी के लिए कम से कम ₹200 की विनिंग राशि आवश्यक है।
                </p>
              </div>

              <div className="space-y-1 border-t border-[#ef4444]/20 pt-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                  3. सिमुलेशन व केवाईसी सुरक्षा (Simulation & KYC)
                </div>
                <p className="text-[11px] text-[#fca5a5] pl-3 leading-relaxed">
                  यह एक सिमुलेटेड मनोरंजन गेम है। किसी भी वास्तविक बैंक खाते से पैसे नहीं काटे या भेजे जाते
                  हैं।
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowFailureModal(false);
                  onClose();
                }}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#d4af37] text-[#071f15] font-bold text-xs sm:text-sm hover:bg-[#e5b84b] transition-colors cursor-pointer"
              >
                कैश टेबल खेलकर जीतें (Play Cash Tables)
              </button>
              <button
                type="button"
                onClick={() => setShowFailureModal(false)}
                className="w-full min-h-[40px] py-2 px-4 rounded-xl border border-white/15 text-xs text-[#b6c7be] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                वापस जाएं (Back)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
