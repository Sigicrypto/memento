"use client";

import { useState } from 'react';
import { X, ArrowUpRight, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { GUEST_TIERS, GuestTier, getTierById } from '@/lib/plans';
import { formatPrice, getUpgradeCost } from '@/lib/studio';

interface TierUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTierId: string;
  currency: 'INR' | 'USD';
  eventName: string;
  eventId: string;
  currentGuestCount: number;
}

export default function TierUpgradeModal({
  isOpen,
  onClose,
  currentTierId,
  currency,
  eventName,
  eventId,
  currentGuestCount,
}: TierUpgradeModalProps) {
  const currentTier = getTierById(currentTierId) || GUEST_TIERS[0];
  const eligibleUpgrades = GUEST_TIERS.filter((t) => t.guestLimit > currentTier.guestLimit);
  const [selectedUpgrade, setSelectedUpgrade] = useState<GuestTier | null>(
    eligibleUpgrades[0] || null
  );

  if (!isOpen) return null;

  const handleUpgradeWhatsApp = () => {
    if (!selectedUpgrade) return;
    const diff = getUpgradeCost(currentTier, selectedUpgrade, currency);
    const text = encodeURIComponent(
      `Hi! I need to upgrade my Memento event tier:\n\n` +
      `🎉 Event: ${eventName} (ID: ${eventId})\n` +
      `👥 Current Guests: ${currentGuestCount} / ${currentTier.guestLimit} (${currentTier.name})\n` +
      `🚀 Upgrade to: ${selectedUpgrade.name} (${selectedUpgrade.guestRange})\n` +
      `💰 Upgrade Difference: ${formatPrice(diff, currency)}\n\n` +
      `Please help me activate the upgrade.`
    );
    window.open(`https://api.whatsapp.com/send?phone=919866161775&text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-2 rounded-full hover:bg-bg-subtle transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary font-display">Upgrade Guest Tier</h3>
            <p className="text-xs text-text-secondary">Expand guest capacity without disrupting your live event</p>
          </div>
        </div>

        {currentGuestCount >= currentTier.guestLimit && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs mb-5">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>
              Your event has reached {currentGuestCount} guests (capacity {currentTier.guestLimit}). Upgrading unlocks higher attendance immediately.
            </span>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
            Select New Tier
          </label>
          {eligibleUpgrades.length === 0 ? (
            <p className="text-sm text-text-muted">You are already on the highest tier ({currentTier.name}).</p>
          ) : (
            <div className="space-y-3">
              {eligibleUpgrades.map((tier) => {
                const isSelected = selectedUpgrade?.id === tier.id;
                const costDiff = getUpgradeCost(currentTier, tier, currency);

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedUpgrade(tier)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-accent bg-accent/5 ring-2 ring-accent/10 shadow-sm'
                        : 'border-border hover:border-border-hover bg-bg-subtle'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-text-primary">{tier.name}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                          {tier.guestRange}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{tier.tagline}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-text-primary">
                        +{formatPrice(costDiff, currency)}
                      </div>
                      <span className="text-[10px] text-text-muted">difference</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-border text-text-secondary hover:text-text-primary text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          {eligibleUpgrades.length > 0 && selectedUpgrade && (
            <button
              onClick={handleUpgradeWhatsApp}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent hover:bg-[#B8882F] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <span>Confirm Upgrade ({formatPrice(getUpgradeCost(currentTier, selectedUpgrade, currency), currency)})</span>
              <ArrowUpRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
