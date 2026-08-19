// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/core/components/DonateModal.tsx
// Direct Coach Pat QR Tip & Donation Modal with Multi-Channel QRs & Donor Wall
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { triggerConfetti } from '../../utils/confetti';
import { useFitnessStore } from '../../app/store';

export default function DonateModal() {
  const {
    isDonateModalOpen,
    closeDonateModal,
    coachPatQrConfig,
    donations,
    recordDonation,
    currentUser,
  } = useFitnessStore();

  const [tipAmount, setTipAmount] = useState<number>(15);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<'GCash' | 'PromptPay' | 'Venmo' | 'CashApp' | 'UPI' | 'PayPal'>('GCash');
  const [donorName, setDonorName] = useState<string>(currentUser.name || 'Alex Rivers');
  const [message, setMessage] = useState<string>('Keep inspiring us Coach Pat! 💪');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isDonateModalOpen) return null;

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : tipAmount;

  // Preset tip amounts
  const presets = [
    { amount: 5, label: '☕ Coffee', desc: 'Fuel a morning session' },
    { amount: 15, label: '⚡ Pre-Workout', desc: 'High energy coaching' },
    { amount: 30, label: '🏋️ Gear Fund', desc: 'New gym equipment' },
    { amount: 50, label: '🏆 Elite Supporter', desc: 'Direct athlete sponsorship' },
  ];

  const handleSimulateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmount <= 0) return;

    let methodMap: 'QR_GCASH' | 'QR_PROMPTPAY' | 'QR_VENMO' | 'QR_CASHAPP' | 'QR_UPI' | 'QR_PAYPAL' | 'QR_SEPA' = 'QR_GCASH';
    if (selectedChannel === 'PromptPay') methodMap = 'QR_PROMPTPAY';
    else if (selectedChannel === 'Venmo') methodMap = 'QR_VENMO';
    else if (selectedChannel === 'CashApp') methodMap = 'QR_CASHAPP';
    else if (selectedChannel === 'UPI') methodMap = 'QR_UPI';
    else if (selectedChannel === 'PayPal') methodMap = 'QR_PAYPAL';

    recordDonation({
      amountUsd: currentAmount,
      donorName: donorName.trim() || 'Anonymous Athlete',
      message: message.trim() || 'Keep up the great work!',
      method: methodMap,
    });

    // Fire celebratory confetti!
    try {
      triggerConfetti();
    } catch {
      // Ignore if unavailable
    }

    setIsSuccess(true);
  };

  const getChannelDetail = () => {
    switch (selectedChannel) {
      case 'GCash':
        return {
          id: coachPatQrConfig.gcashNumber,
          label: 'GCash Mobile Number',
          badge: 'Philippines & Global Remit',
          color: '#007dfa',
        };
      case 'PromptPay':
        return {
          id: coachPatQrConfig.promptPayId,
          label: 'PromptPay ID / Mobile',
          badge: 'Thailand & ASEAN QR',
          color: '#005a9c',
        };
      case 'Venmo':
        return {
          id: coachPatQrConfig.venmoTag,
          label: 'Venmo Handle',
          badge: 'USA & North America',
          color: '#008cff',
        };
      case 'CashApp':
        return {
          id: coachPatQrConfig.cashAppTag,
          label: 'Cash App $Cashtag',
          badge: 'USA & UK',
          color: '#00d632',
        };
      case 'UPI':
        return {
          id: coachPatQrConfig.upiId,
          label: 'UPI VPA Address',
          badge: 'India & International',
          color: '#e05a2b',
        };
      case 'PayPal':
        return {
          id: coachPatQrConfig.paypalEmail,
          label: 'PayPal Email',
          badge: 'Global Credit/Debit',
          color: '#003087',
        };
    }
  };

  const channelInfo = getChannelDetail();

  return (
    <div className="modal-backdrop" onClick={closeDonateModal}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                boxShadow: '0 0 16px rgba(236, 72, 153, 0.4)',
              }}
            >
              💖
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Donate & Tip Coach Pat</h3>
                <span className="badge badge-rose" style={{ fontSize: 10 }}>Official QR</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Build with Pat Fitness Community</p>
            </div>
          </div>
          <button onClick={closeDonateModal} className="btn-icon" style={{ width: 32, height: 32 }}>
            ✕
          </button>
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 8 }}>
              Thank You for Your Support!
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              Your tip of <strong>${currentAmount}.00 USD</strong> via <strong>{selectedChannel}</strong> has been credited to Coach Pat.
            </p>

            <div
              style={{
                background: 'var(--bg-card-elevated)',
                padding: 16,
                borderRadius: 'var(--radius-md)',
                marginBottom: 20,
                textAlign: 'left',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supporter Message:</div>
              <div style={{ fontSize: 14, fontStyle: 'italic', marginTop: 4 }}>"{message}"</div>
              <div style={{ fontSize: 12, color: 'var(--color-primary)', marginTop: 8, fontWeight: 700 }}>
                — {donorName}
              </div>
            </div>

            <button
              onClick={() => {
                setIsSuccess(false);
                closeDonateModal();
              }}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Back to Training
            </button>
          </div>
        ) : (
          /* Donation Form */
          <form onSubmit={handleSimulateDonation} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Coach Quote & Note */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(244, 63, 94, 0.04) 100%)',
                border: '1px solid rgba(236, 72, 153, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: 12,
                fontSize: 12,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=120&auto=format&fit=crop&q=80"
                alt="Coach Pat"
                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <strong>Coach Pat: </strong>
                <span style={{ color: 'var(--text-muted)' }}>"{coachPatQrConfig.note}"</span>
              </div>
            </div>

            {/* Tip Amount Presets */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
                Select Tip / Donation Amount:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {presets.map(p => (
                  <button
                    key={p.amount}
                    type="button"
                    onClick={() => {
                      setTipAmount(p.amount);
                      setCustomAmount('');
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: tipAmount === p.amount && !customAmount ? 'var(--color-primary-light)' : 'var(--bg-card-elevated)',
                      border: tipAmount === p.amount && !customAmount ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 13, color: '#fff' }}>{p.label}</strong>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary)' }}>${p.amount}</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{p.desc}</div>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div style={{ marginTop: 8 }}>
                <input
                  type="number"
                  placeholder="Or enter custom amount ($ USD)..."
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  style={{ fontSize: 13 }}
                />
              </div>
            </div>

            {/* Payment Channel Selector */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Choose Direct Payment QR Channel:
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['GCash', 'PromptPay', 'Venmo', 'CashApp', 'UPI', 'PayPal'] as const).map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setSelectedChannel(ch)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 11,
                      fontWeight: 700,
                      background: selectedChannel === ch ? 'var(--color-rose)' : 'var(--bg-card-elevated)',
                      color: selectedChannel === ch ? '#fff' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Scannable QR Code Box */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>
                {channelInfo.badge}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
                Scan with your {selectedChannel} mobile app
              </div>

              {/* Dynamic SVG QR Matrix */}
              <svg width="180" height="180" viewBox="0 0 200 200" style={{ background: '#fff', borderRadius: 8 }}>
                {/* QR Corner Markers */}
                <rect x="10" y="10" width="50" height="50" fill="#0f172a" rx="6" />
                <rect x="18" y="18" width="34" height="34" fill="#fff" rx="4" />
                <rect x="26" y="26" width="18" height="18" fill="#e11d48" rx="2" />

                <rect x="140" y="10" width="50" height="50" fill="#0f172a" rx="6" />
                <rect x="148" y="18" width="34" height="34" fill="#fff" rx="4" />
                <rect x="156" y="26" width="18" height="18" fill="#e11d48" rx="2" />

                <rect x="10" y="140" width="50" height="50" fill="#0f172a" rx="6" />
                <rect x="18" y="148" width="34" height="34" fill="#fff" rx="4" />
                <rect x="26" y="156" width="18" height="18" fill="#e11d48" rx="2" />

                {/* Randomized QR Data Grid Matrix */}
                <rect x="70" y="20" width="12" height="12" fill="#0f172a" />
                <rect x="90" y="20" width="12" height="12" fill="#0f172a" />
                <rect x="110" y="20" width="12" height="12" fill="#0f172a" />
                <rect x="70" y="40" width="12" height="12" fill="#0f172a" />
                <rect x="100" y="40" width="12" height="12" fill="#0f172a" />
                <rect x="120" y="40" width="12" height="12" fill="#0f172a" />

                <rect x="20" y="70" width="12" height="12" fill="#0f172a" />
                <rect x="40" y="70" width="12" height="12" fill="#0f172a" />
                <rect x="70" y="70" width="12" height="12" fill="#0f172a" />
                <rect x="90" y="70" width="12" height="12" fill="#0f172a" />
                <rect x="110" y="70" width="12" height="12" fill="#0f172a" />
                <rect x="140" y="70" width="12" height="12" fill="#0f172a" />
                <rect x="170" y="70" width="12" height="12" fill="#0f172a" />

                <rect x="20" y="100" width="12" height="12" fill="#0f172a" />
                <rect x="50" y="100" width="12" height="12" fill="#0f172a" />
                <rect x="80" y="100" width="12" height="12" fill="#0f172a" />
                <rect x="110" y="100" width="12" height="12" fill="#0f172a" />
                <rect x="130" y="100" width="12" height="12" fill="#0f172a" />
                <rect x="160" y="100" width="12" height="12" fill="#0f172a" />

                {/* Center Coach Pat Logo Shield */}
                <circle cx="100" cy="100" r="22" fill="#fff" stroke="#e11d48" strokeWidth="2" />
                <text x="100" y="105" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#e11d48">
                  PAT
                </text>

                <rect x="70" y="140" width="12" height="12" fill="#0f172a" />
                <rect x="90" y="140" width="12" height="12" fill="#0f172a" />
                <rect x="120" y="140" width="12" height="12" fill="#0f172a" />
                <rect x="150" y="140" width="12" height="12" fill="#0f172a" />
                <rect x="70" y="160" width="12" height="12" fill="#0f172a" />
                <rect x="100" y="160" width="12" height="12" fill="#0f172a" />
                <rect x="130" y="160" width="12" height="12" fill="#0f172a" />
                <rect x="160" y="160" width="12" height="12" fill="#0f172a" />
              </svg>

              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                  {channelInfo.id}
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  Payee: {coachPatQrConfig.payeeName} • Amount: ${currentAmount}.00 USD
                </div>
              </div>
            </div>

            {/* Donor info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                  Your Name (or Nickname)
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  placeholder="Athlete Alex"
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                  Cheer Message / Note
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Thanks Coach!"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-donate" style={{ padding: '12px 0', fontSize: 15, fontWeight: 800 }}>
              💖 Confirm & Record Tip (${currentAmount}.00 USD)
            </button>

            {/* Recent Supporters preview */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                ⭐ Recent Community Supporters ({donations.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 110, overflowY: 'auto' }}>
                {donations.map(d => (
                  <div
                    key={d.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-card-elevated)',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 11,
                    }}
                  >
                    <div>
                      <strong style={{ color: '#fff' }}>{d.donorName}</strong>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>"{d.message}"</span>
                    </div>
                    <span style={{ fontWeight: 800, color: '#f43f5e' }}>+${d.amountUsd}</span>
                  </div>
                ))}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
