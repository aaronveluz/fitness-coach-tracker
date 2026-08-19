// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/payments/pages/PaymentPage.tsx
// QR Code Payments, Coaching Subscriptions & Invoice Management
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useFitnessStore } from '../../../app/store';
import type { PaymentTransaction } from '../../../types/fitness';

export default function PaymentPage() {
  const {
    paymentPlans,
    transactions,
    currentUser,
    openPaymentModal,
    openDonateModal,
  } = useFitnessStore();

  const [selectedInvoice, setSelectedInvoice] = useState<PaymentTransaction | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span>QR Payments & Coaching Subscriptions</span>
            <span style={{ fontSize: 24 }}>💳</span>
          </h1>
          <p className="page-subtitle">
            Dynamic QR payments for memberships, subscriptions, and direct tips to Coach Pat
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-donate btn-sm" onClick={openDonateModal}>
            <span>💖</span> Tip Coach Pat QR
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => openPaymentModal()}>
            <span>⚡</span> Open QR Payment Scanner
          </button>
        </div>
      </div>

      {/* ── Active Membership Status Banner ─────────────────────────────────── */}
      <div
        className="card card-glow-emerald"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-emerald">ACTIVE SUBSCRIPTION</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Auto-renewing</span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>
            {currentUser.activeTier === 'elite'
              ? '1-on-1 Elite Coaching Program with Coach Pat'
              : currentUser.activeTier === 'pro'
              ? 'Pro Athlete Tracker Membership'
              : 'Basic Fitness Tracker'}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Next billing cycle: <strong>{currentUser.subscriptionExpiry}</strong> • Assigned Coach: <strong style={{ color: 'var(--color-primary)' }}>{currentUser.assignedCoach}</strong>
          </p>
        </div>

        <button
          onClick={() => openPaymentModal(paymentPlans[2])}
          className="btn btn-primary"
        >
          Pay Next Cycle via QR
        </button>
      </div>

      {/* ── Pricing & Coaching Tier Cards ───────────────────────────────────── */}
      <div className="grid-3">
        {paymentPlans.map(plan => {
          const isCurrentPlan =
            (currentUser.activeTier === 'elite' && plan.id.includes('elite')) ||
            (currentUser.activeTier === 'pro' && plan.id.includes('pro')) ||
            (currentUser.activeTier === 'basic' && plan.id.includes('basic'));

          return (
            <div
              key={plan.id}
              className={`card ${plan.popular ? 'card-glow-cyan' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isCurrentPlan ? '2px solid var(--color-primary)' : undefined,
                position: 'relative',
              }}
            >
              {plan.badge && (
                <div style={{ position: 'absolute', top: 14, right: 14 }}>
                  <span className={`badge ${plan.popular ? 'badge-cyan' : 'badge-rose'}`} style={{ fontSize: 10 }}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  {plan.title}
                </h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, minHeight: 36 }}>
                  {plan.description}
                </p>

                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 18 }}>
                  ${plan.priceUsd}
                  <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}> / {plan.period}</span>
                </div>

                {/* Features list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>✓</span>
                      <span style={{ color: '#fff' }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => openPaymentModal(plan)}
                  className={`btn ${plan.popular ? 'btn-cyan' : 'btn-primary'}`}
                  style={{ width: '100%' }}
                >
                  {isCurrentPlan ? '✓ Current Plan (Pay Renewal)' : `Select & Generate QR ($${plan.priceUsd})`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Transaction & Invoice History Table ──────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <span>🧾</span> Payment Transactions & Invoice Receipts
          </h3>
          <span className="badge badge-emerald">{transactions.length} Verified Invoices</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Invoice #</th>
                <th style={{ padding: '10px 12px' }}>Date</th>
                <th style={{ padding: '10px 12px' }}>Plan / Coaching Package</th>
                <th style={{ padding: '10px 12px' }}>Amount</th>
                <th style={{ padding: '10px 12px' }}>Method</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#fff' }}>{tx.invoiceNumber}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{tx.date}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{tx.planTitle}</td>
                  <td style={{ padding: '12px', fontWeight: 800, color: 'var(--color-primary)', fontSize: 15 }}>
                    ${tx.amountUsd}.00
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-cyan" style={{ fontSize: 10 }}>
                      {tx.method.replace('QR_', '')}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-emerald" style={{ fontSize: 10 }}>
                      ✓ {tx.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedInvoice(tx)}
                      className="btn btn-secondary btn-sm"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: View Invoice Receipt ─────────────────────────────────────── */}
      {selectedInvoice && (
        <div className="modal-backdrop" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Official Payment Receipt</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedInvoice.invoiceNumber}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="btn-icon" style={{ width: 32, height: 32 }}>
                ✕
              </button>
            </div>

            <div
              style={{
                background: 'var(--bg-card-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Payment For</span>
                <strong style={{ color: '#fff' }}>{selectedInvoice.planTitle}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Payer</span>
                <strong style={{ color: '#fff' }}>{selectedInvoice.payerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Payment Channel</span>
                <span>QR {selectedInvoice.method.replace('QR_', '')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Reference Code</span>
                <code>{selectedInvoice.qrReferenceCode}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Date & Time</span>
                <span>{selectedInvoice.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 10, fontSize: 16, fontWeight: 800 }}>
                <span>Total Amount Paid</span>
                <span style={{ color: 'var(--color-primary)' }}>${selectedInvoice.amountUsd}.00 USD</span>
              </div>
            </div>

            <button
              onClick={() => {
                window.print();
              }}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: 8 }}
            >
              🖨️ Print / Download PDF Receipt
            </button>
            <button
              onClick={() => setSelectedInvoice(null)}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
