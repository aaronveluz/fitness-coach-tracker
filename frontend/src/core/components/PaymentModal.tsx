// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/core/components/PaymentModal.tsx
// Interactive QR Code Payment Modal with Multi-Method Support & Instant Receipt
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useFitnessStore } from '../../app/store';
import type { PaymentPlan } from '../../types/fitness';

export function PaymentModal() {
  const {
    isPaymentModalOpen,
    closePaymentModal,
    selectedPaymentPlan,
    paymentPlans,
    completeQrPayment,
    currentUser,
  } = useFitnessStore();

  const [activePlan, setActivePlan] = useState<PaymentPlan>(
    selectedPaymentPlan || paymentPlans[2] // Elite Coach Pat by default
  );

  const [paymentMethod, setPaymentMethod] = useState<'QR_GCASH' | 'QR_PROMPTPAY' | 'QR_VENMO' | 'QR_UPI' | 'QR_SEPA'>('QR_GCASH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<{
    invoiceNo: string;
    date: string;
    amount: number;
    planTitle: string;
    method: string;
  } | null>(null);

  if (!isPaymentModalOpen) return null;

  // Generate SVG QR Code pattern based on payload
  const renderQrCodeSvg = () => {
    return (
      <div
        style={{
          background: '#ffffff',
          padding: 16,
          borderRadius: 'var(--radius-lg)',
          display: 'inline-block',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer QR Corner Finders */}
          {/* Top-Left */}
          <rect x="10" y="10" width="50" height="50" rx="6" fill="#000000" />
          <rect x="20" y="20" width="30" height="30" rx="3" fill="#ffffff" />
          <rect x="26" y="26" width="18" height="18" rx="2" fill="#10b981" />

          {/* Top-Right */}
          <rect x="140" y="10" width="50" height="50" rx="6" fill="#000000" />
          <rect x="150" y="20" width="30" height="30" rx="3" fill="#ffffff" />
          <rect x="156" y="26" width="18" height="18" rx="2" fill="#10b981" />

          {/* Bottom-Left */}
          <rect x="10" y="140" width="50" height="50" rx="6" fill="#000000" />
          <rect x="20" y="150" width="30" height="30" rx="3" fill="#ffffff" />
          <rect x="26" y="156" width="18" height="18" rx="2" fill="#10b981" />

          {/* Data Pattern Matrix Blocks */}
          <rect x="70" y="15" width="12" height="12" rx="2" fill="#0f172a" />
          <rect x="90" y="15" width="12" height="12" rx="2" fill="#0f172a" />
          <rect x="110" y="15" width="12" height="12" rx="2" fill="#0f172a" />

          <rect x="70" y="35" width="12" height="12" rx="2" fill="#0f172a" />
          <rect x="100" y="35" width="22" height="12" rx="2" fill="#0f172a" />

          <rect x="15" y="70" width="12" height="12" rx="2" fill="#0f172a" />
          <rect x="35" y="70" width="12" height="12" rx="2" fill="#0f172a" />
          <rect x="55" y="70" width="22" height="12" rx="2" fill="#0f172a" />
          <rect x="90" y="70" width="12" height="12" rx="2" fill="#0f172a" />
          <rect x="120" y="70" width="22" height="12" rx="2" fill="#0f172a" />
          <rect x="155" y="70" width="12" height="12" rx="2" fill="#0f172a" />
          <rect x="175" y="70" width="12" height="12" rx="2" fill="#0f172a" />

          {/* Center Brand Badge */}
          <rect x="75" y="75" width="50" height="50" rx="10" fill="#090d16" />
          <text x="100" y="105" fill="#10b981" fontSize="18" fontWeight="bold" textAnchor="middle">⚡</text>

          {/* Bottom matrix patterns */}
          <rect x="70" y="140" width="12" height="12" rx="2" fill="#0f172a" />
          <rect x="100" y="140" width="12" height="12" rx="2" fill="#0f172a" />
          <rect x="120" y="140" width="22" height="12" rx="2" fill="#0f172a" />
          <rect x="160" y="140" width="25" height="12" rx="2" fill="#0f172a" />

          <rect x="70" y="165" width="22" height="12" rx="2" fill="#0f172a" />
          <rect x="110" y="165" width="30" height="12" rx="2" fill="#0f172a" />
          <rect x="155" y="165" width="15" height="20" rx="2" fill="#0f172a" />
          <rect x="180" y="175" width="10" height="10" rx="2" fill="#0f172a" />
        </svg>
      </div>
    );
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const refCode = `${paymentMethod.replace('QR_', '')}-REF-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const tx = completeQrPayment({
        planId: activePlan.id,
        planTitle: activePlan.title,
        amountUsd: activePlan.priceUsd,
        method: paymentMethod,
        qrReferenceCode: refCode,
        status: 'Completed',
        payerName: currentUser.name,
      });

      setIsProcessing(false);
      setCompletedInvoice({
        invoiceNo: tx.invoiceNumber,
        date: tx.date,
        amount: tx.amountUsd,
        planTitle: tx.planTitle,
        method: paymentMethod.replace('QR_', ''),
      });
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={closePaymentModal}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                color: '#fff',
              }}
            >
              💳
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Instant QR Code Payment</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Scan and pay subscriptions or coaching fees</p>
            </div>
          </div>
          <button onClick={closePaymentModal} className="btn-icon" style={{ width: 32, height: 32 }}>
            ✕
          </button>
        </div>

        {!completedInvoice ? (
          <div>
            {/* Step 1: Select Plan */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
                Select Membership / Coaching Tier
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {paymentPlans.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => setActivePlan(plan)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: activePlan.id === plan.id ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card-elevated)',
                      border: activePlan.id === plan.id ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                      textAlign: 'left',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {plan.popular && (
                      <span
                        className="badge badge-emerald"
                        style={{ position: 'absolute', top: 4, right: 4, fontSize: 8, padding: '1px 4px' }}
                      >
                        POPULAR
                      </span>
                    )}
                    <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-main)' }}>{plan.title}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--color-primary)', marginTop: 4 }}>
                      ${plan.priceUsd}
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}> /mo</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Payment Provider Selection */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
                Select QR Payment Method
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: 'QR_GCASH', label: 'GCash QR', icon: '📱' },
                  { id: 'QR_PROMPTPAY', label: 'PromptPay', icon: '⚡' },
                  { id: 'QR_VENMO', label: 'Venmo / CashApp', icon: '💸' },
                  { id: 'QR_UPI', label: 'UPI / PayNow', icon: '🇮🇳' },
                  { id: 'QR_SEPA', label: 'SEPA / Stripe QR', icon: '🇪🇺' },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12,
                      fontWeight: 600,
                      background: paymentMethod === method.id ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-card-elevated)',
                      border: paymentMethod === method.id ? '1px solid var(--color-cyan)' : '1px solid var(--border-subtle)',
                      color: paymentMethod === method.id ? '#38bdf8' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>{method.icon}</span>
                    <span>{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Scannable QR Code Canvas */}
            <div
              style={{
                background: 'var(--bg-card-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 20px',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              <div style={{ marginBottom: 14 }}>
                {renderQrCodeSvg()}
              </div>

              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-main)' }}>
                Total Amount: <span style={{ color: 'var(--color-primary)' }}>${activePlan.priceUsd}.00 USD</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Scan using any banking app or e-wallet ({paymentMethod.replace('QR_', '')}). QR expires in 15:00 min.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px 0' }}
              >
                {isProcessing ? 'Verifying QR Payment...' : 'Simulate Instant QR Payment Approval'}
              </button>
              <button onClick={closePaymentModal} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Receipt / Invoice View */
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px 20px',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 42, marginBottom: 8 }}>🎉</div>
              <h4 style={{ fontSize: 20, fontWeight: 800, color: '#34d399' }}>Payment Verified Successfully!</h4>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Your account is now activated with <strong>{completedInvoice.planTitle}</strong>.
              </p>
            </div>

            {/* Invoice Breakdown */}
            <div
              style={{
                background: 'var(--bg-card-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                marginBottom: 20,
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-muted">Invoice Number</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{completedInvoice.invoiceNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-muted">Payer</span>
                <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-muted">Payment Channel</span>
                <span style={{ fontWeight: 600 }}>QR {completedInvoice.method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-muted">Date</span>
                <span style={{ fontWeight: 600 }}>{completedInvoice.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0 0', fontSize: 16, fontWeight: 800 }}>
                <span>Total Paid</span>
                <span style={{ color: 'var(--color-primary)' }}>${completedInvoice.amount}.00 USD</span>
              </div>
            </div>

            <button
              onClick={() => {
                setCompletedInvoice(null);
                closePaymentModal();
              }}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Done & Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
