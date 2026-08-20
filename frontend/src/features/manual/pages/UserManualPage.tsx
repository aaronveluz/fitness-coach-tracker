// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/features/manual/pages/UserManualPage.tsx
// Interactive In-App User Manual & Complete Knowledge Center
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useFitnessStore } from '../../../app/store';
import { useNavigate } from 'react-router-dom';

interface ManualChapter {
  id: string;
  title: string;
  icon: string;
  category: string;
  badge?: string;
  summary: string;
  content: {
    heading: string;
    description: string;
    steps?: string[];
    tips?: string[];
    actionRoute?: string;
    actionLabel?: string;
  }[];
}

const chapters: ManualChapter[] = [
  {
    id: 'auth-roles',
    title: 'Account Roles & Sign In',
    icon: '🔑',
    category: 'Getting Started',
    badge: 'Essential',
    summary: 'How to sign in using email or username, and security role permissions.',
    content: [
      {
        heading: 'Signing Into Your Account',
        description:
          'Every member must sign in to access their training records and coaching directives. You can sign in using either your registered email address or your @username handle.',
        steps: [
          'Navigate to the Sign In page (/login).',
          'Enter your registered Username (e.g. coachpat, alexrivers) or Email.',
          'Type your password and click "Sign In to Dashboard".',
        ],
        tips: [
          'Default athlete password is fitness123, staff password is staff123, and Head Coach password is coach123.',
          'To sign out, click the "Sign Out" button at the bottom of the sidebar or inside your profile dropdown.',
        ],
        actionRoute: '/login',
        actionLabel: 'Go to Sign In Page',
      },
      {
        heading: 'Role Hierarchy & Privileges',
        description:
          'The application provides 3 specialized role interfaces tailored to each user type in the coaching ecosystem.',
        steps: [
          '👑 Head Coach (Admin - Coach Pat): Full roster management, workout & nutrition reviews, task assignments, and meetup scheduler.',
          '🛡️ Staff Trainer (Sarah Lin / David Miller): Assists with InBody scan recordings, mobility evaluations, and daily adherence monitoring.',
          '🏃 Athlete / Client (Alex Rivers, Marcus Vance, Elena Rostova): Self-logs meals, sets, body weight, photos, and checks off coaching tasks.',
        ],
      },
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard & Coaching Tasks',
    icon: '📊',
    category: 'Core Features',
    summary: 'Daily fitness headquarters, active coaching tasks, and macro burn rings.',
    content: [
      {
        heading: 'Daily Overview & Macro Rings',
        description:
          'Your main Dashboard displays real-time calorie burn targets, daily protein goals, weekly workout consistency, and active streaks.',
        steps: [
          'Review your daily calorie progress and grams of protein remaining.',
          'Use the 1-click hydration buttons (+250ml, +500ml, +1000ml) to log water intake.',
          'Check the Bi-Weekly Meet-Up banner for your next physical assessment appointment with Coach Pat.',
        ],
        actionRoute: '/dashboard',
        actionLabel: 'Open Dashboard',
      },
      {
        heading: 'Active Tasks Assigned by Coach Pat',
        description:
          'When Coach Pat prescribes specific workouts, nutrition targets, or recovery habits, they appear prominently at the top of your dashboard.',
        steps: [
          'Review the task directives, priority level, and due date.',
          'Complete the assigned workout or habit.',
          'Click "✓ Complete Task" on the card to notify Coach Pat.',
        ],
      },
    ],
  },
  {
    id: 'food-tracker',
    title: 'Food & Nutrition Tracker',
    icon: '🥗',
    category: 'Core Features',
    badge: 'Macro Engine',
    summary: 'Logging meals, macro pacing, and managing the flexible calorie database.',
    content: [
      {
        heading: 'Logging Daily Meals & Macros',
        description:
          'Track your caloric intake with automatic breakdown of Protein, Carbohydrates, Fats, and Fiber.',
        steps: [
          'Click the Food & Nutrition tab (/food) from the sidebar.',
          'Select the meal category (Breakfast, Lunch, Dinner, or Snacks).',
          'Search the master food list, adjust the serving amount in grams or units, and click "Add to Log".',
        ],
        actionRoute: '/food',
        actionLabel: 'Open Food Tracker',
      },
      {
        heading: '⚙️ Managing the Food & Calorie Database',
        description:
          'The food library is fully customizable. You can adjust calories, edit macros, delete items, or create custom meals.',
        steps: [
          'Click "⚙️ Manage Food & Calorie Database" at the top of the Food Tracker.',
          'Click "✏️ Edit" on any food item to modify its calorie count, protein, carbs, or fats.',
          'Click "＋ Add New Master Food" to register custom meals, local snacks, or workout supplements.',
          'Click "🗑️ Delete" to remove any food item you no longer use.',
        ],
        tips: [
          'Coach Pat reviews your daily nutrition logs and stamps them with feedback remarks and verification tags.',
        ],
      },
    ],
  },
  {
    id: 'weightlifting',
    title: 'Weightlifting & 1RM Tracker',
    icon: '🏋️‍♂️',
    category: 'Core Features',
    badge: 'Strength',
    summary: 'Track sets, reps, weight (kg), RPE, 1RM calculator, and rest timer.',
    content: [
      {
        heading: 'Logging Workout Sessions',
        description:
          'Record strength training sessions with complete volume load and set-by-set analytics.',
        steps: [
          'Click "Weightlifting Log" (/workouts) in the sidebar.',
          'Click "＋ Log New Workout Session".',
          'Choose your training split (Push, Pull, Legs, Upper, Lower, Full Body) and add your exercises.',
          'Input Weight (kg), Repetitions, and RPE (Rate of Perceived Exertion from 1 to 10) for each set.',
          'Check the "PR 🏆" box whenever you hit a personal record.',
        ],
        actionRoute: '/workouts',
        actionLabel: 'Open Weightlifting Tracker',
      },
      {
        heading: 'Interactive 1RM Calculator & Rest Countdown Timer',
        description:
          'Estimate your maximum single-rep strength using the Epley formula: 1RM = Weight × (1 + Reps / 30).',
        steps: [
          'Use the 1RM widget to calculate your working percentages (90%, 85%, 80%, 75%, 70%).',
          'Activate the built-in Rest Timer (60s, 90s, 120s, 180s) to keep inter-set recovery periods consistent.',
        ],
        tips: [
          'Coach Pat reviews completed sessions and stamps them with "✓ Verified & Approved by Coach Pat".',
        ],
      },
    ],
  },
  {
    id: 'physique',
    title: 'Physique & InBody Scans',
    icon: '📸',
    category: 'Progress Tracking',
    summary: 'Weekly progress photos, comparison sliders, and InBody composition scans.',
    content: [
      {
        heading: 'Weekly Photo Check-Ins & Comparison Slider',
        description:
          'Monitor muscle hypertrophy, leanness, and posture changes through standardized weekly photo sets.',
        steps: [
          'Navigate to Physique Progress (/physique).',
          'Upload Front, Side, and Back photos taken under consistent lighting and morning fasted conditions.',
          'Use the interactive Before & After slider to compare your baseline with your latest check-in.',
        ],
        actionRoute: '/physique',
        actionLabel: 'View Physique Tracker',
      },
      {
        heading: 'InBody 570 Clinical Composition Logs',
        description:
          'Record clinical metrics including Skeletal Muscle Mass (kg), Body Fat Percentage (%), Visceral Fat Level, and Total Body Water (%).',
        tips: [
          'InBody scans are typically logged every 2 weeks during your physical meet-up with Coach Pat and staff.',
        ],
      },
    ],
  },
  {
    id: 'body-weight',
    title: 'Body Weight & Trend Tracking',
    icon: '⚖️',
    category: 'Progress Tracking',
    summary: 'Daily weigh-ins, 7-day smoothed trendlines, and goal delta metrics.',
    content: [
      {
        heading: 'Logging Weight & Filtering Daily Noise',
        description:
          'Daily weigh-ins naturally fluctuate due to sodium and water retention. The app graphs a 7-day moving average to reveal true physiological trends.',
        steps: [
          'Weigh yourself first thing in the morning after using the restroom.',
          'Enter your weight in kilograms on the Body Weight page (/weight).',
          'Review the progress delta to see how many kilograms remain until reaching your target weight.',
        ],
        actionRoute: '/weight',
        actionLabel: 'Open Body Weight Tracker',
      },
    ],
  },
  {
    id: 'frequency',
    title: 'Workout Frequency & Consistency',
    icon: '🔥',
    category: 'Progress Tracking',
    summary: 'Weekly target tracking, active streaks, and calendar heatmaps.',
    content: [
      {
        heading: 'Building a Long-Term Consistency Streak',
        description:
          'The Frequency Tracker counts sessions completed per week against your personalized target (e.g. 5 workouts/week).',
        steps: [
          'View your weekly consistency progress bar on /frequency.',
          'Explore the interactive calendar heatmap color-coded by training split.',
          'Maintain your active multi-week streak to maximize adaptation.',
        ],
        actionRoute: '/frequency',
        actionLabel: 'Open Frequency Tracker',
      },
    ],
  },
  {
    id: 'form-library',
    title: 'Form Correction & Exercise Library',
    icon: '🎯',
    category: 'Training Knowledge',
    summary: 'Illustrated form guides, mistake checklists, and custom exercises.',
    content: [
      {
        heading: 'Form Correction Visual Guides',
        description:
          'Detailed movement breakdowns for core compound exercises (Squat, Deadlift, Bench Press, Overhead Press, Barbell Row).',
        steps: [
          'Navigate to Form Correction (/form-correction).',
          'Review setup cues, execution bar paths, and breathing mechanics.',
          'Check the "Common Mistakes to Avoid" section to prevent lower-back rounding and joint stress.',
        ],
        actionRoute: '/form-correction',
        actionLabel: 'Open Form Correction Guide',
      },
      {
        heading: 'Exercise Library & Custom Attachments',
        description:
          'Browse hundreds of exercises filterable by Minimal/Home Equipment or Full Gym.',
        steps: [
          'Filter exercises by muscle group (Chest, Back, Quads, Glutes, etc.) or equipment type.',
          'Click "＋ Add Custom Exercise" to register specialized gym machines or unique movement variations.',
        ],
        actionRoute: '/exercises',
        actionLabel: 'Browse Exercise Library',
      },
    ],
  },
  {
    id: 'coaching-tools',
    title: 'Head Coach & Staff Center',
    icon: '🏆',
    category: 'Coaching Operations',
    badge: 'Coach Pat',
    summary: 'Athlete roster inspection, task assignments, log remarks, and bi-weekly meetups.',
    content: [
      {
        heading: 'Athlete Progress Inspection & Task Assignment',
        description:
          'Coach Pat and Staff can switch between athletes to review workouts, nutrition logs, InBody scans, and macro prescriptions.',
        steps: [
          'Open the Coach Command Center (/coach-dashboard).',
          'Select the athlete (Alex Rivers, Marcus Vance, Elena Rostova, Jordan Smith).',
          'Click "＋ Assign New Task / Workout" to prescribe drills with priority and due date.',
          'Review logged workouts and food entries, write feedback remarks, and click "✓ Tag Verified".',
        ],
        actionRoute: '/coach-dashboard',
        actionLabel: 'Open Coach Command Center',
      },
      {
        heading: 'Bi-Weekly Physical Meet-Up Scheduler',
        description:
          'Schedule in-person physical check-ins every 2 weeks for mobility screenings, technique reviews, and InBody scans.',
      },
    ],
  },
  {
    id: 'user-management',
    title: 'User Management & Roster Admin',
    icon: '👥',
    category: 'Coaching Operations',
    badge: 'Admin Only',
    summary: 'Registering new athletes, assigning staff trainers, and setting targets.',
    content: [
      {
        heading: 'Administering the Member Roster',
        description:
          'Coach Pat can manage all registered accounts, create new athletes, edit macro goals, and update subscription tiers.',
        steps: [
          'Navigate to User Management (/users).',
          'Click "＋ Register New Athlete" or "＋ Add Staff Trainer".',
          'Enter Full Name, @username handle, Email, starting metrics, and calorie/macro prescriptions.',
        ],
        actionRoute: '/users',
        actionLabel: 'Open User Management',
      },
    ],
  },
  {
    id: 'payments-settings',
    title: 'QR Payments, Themes & Settings',
    icon: '💳',
    category: 'System & Account',
    summary: 'QR subscription checkout, Dark/Light theme switching, and app rebranding.',
    content: [
      {
        heading: 'QR Code Subscriptions & Tiers',
        description:
          'Subscribe or upgrade coaching tiers using PromptPay, GCash, Venmo, UPI, or Bank Transfer QR codes.',
        steps: [
          'Navigate to QR Payments & Plans (/payments).',
          'Select your tier (Basic Self-Guided, Pro Coaching, Elite 1-on-1 VIP).',
          'Scan the dynamic QR code and submit your reference code for instant verification.',
        ],
        actionRoute: '/payments',
        actionLabel: 'View Payment Plans',
      },
      {
        heading: 'App Themes & Rebranding',
        description:
          'Customize the UI theme (Dark 🌙, Light ☀️, or Auto 🖥️) and rename the app branding in App Settings (/settings).',
        actionRoute: '/settings',
        actionLabel: 'Open App Settings',
      },
    ],
  },
];

export default function UserManualPage() {
  const { appName } = useFitnessStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('auth-roles');

  const filteredChapters = chapters.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesTitle = c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    const matchesContent = c.content.some(
      item => item.heading.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
    return matchesTitle || matchesContent;
  });

  const activeChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Page Header ───────────────────────────────────────────────────────── */}
      <div
        className="card card-glass"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.08) 100%)',
          borderLeft: '4px solid var(--color-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 24 }}>📖</span>
            <span className="badge badge-emerald" style={{ fontSize: 11, letterSpacing: '0.05em' }}>
              OFFICIAL KNOWLEDGE CENTER
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 900, color: 'var(--text-main)' }}>
            {appName} User Manual & Coaching Guide
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, maxWidth: 680 }}>
            Complete walkthrough for athletes, staff trainers, and Coach Pat. Search any feature, tracking module, or coaching procedure below.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🖨️</span> Print / Save PDF
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-sm">
            Go to Dashboard →
          </button>
        </div>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 14 }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search user guide (e.g. food logging, 1RM calculator, InBody scan, passwords, tasks)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', fontSize: 14, background: 'var(--bg-card-elevated)' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer', background: 'transparent' }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Main Two-Column Layout ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left Column: Chapters Navigation List */}
        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, paddingLeft: 6 }}>
            Table of Contents ({filteredChapters.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {filteredChapters.map(chap => {
              const isSelected = chap.id === activeChapter.id;
              return (
                <button
                  key={chap.id}
                  onClick={() => setSelectedChapterId(chap.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--color-primary-light)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--color-primary)' : '3px solid transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{chap.icon}</span>
                      <strong style={{ fontSize: 13, color: isSelected ? 'var(--color-primary)' : 'var(--text-main)' }}>
                        {chap.title}
                      </strong>
                    </div>
                    {chap.badge && (
                      <span className="badge badge-emerald" style={{ fontSize: 9, padding: '1px 5px' }}>
                        {chap.badge}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-subtle)', paddingLeft: 24 }}>
                    {chap.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Chapter Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 28 }}>
            {/* Chapter Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border-medium)', paddingBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                  }}
                >
                  {activeChapter.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge badge-cyan" style={{ fontSize: 10 }}>{activeChapter.category}</span>
                    {activeChapter.badge && <span className="badge badge-rose" style={{ fontSize: 10 }}>{activeChapter.badge}</span>}
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 900, color: 'var(--text-main)', marginTop: 4 }}>
                    {activeChapter.title}
                  </h2>
                </div>
              </div>

              <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                Section ID: <code>#{activeChapter.id}</code>
              </span>
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24, background: 'rgba(255, 255, 255, 0.02)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
              💡 {activeChapter.summary}
            </p>

            {/* Sub-sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {activeChapter.content.map((sec, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-card-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
                      {idx + 1}. {sec.heading}
                    </h3>

                    {sec.actionRoute && (
                      <button
                        onClick={() => navigate(sec.actionRoute!)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: 11, padding: '4px 10px' }}
                      >
                        {sec.actionLabel || 'Launch Feature →'}
                      </button>
                    )}
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {sec.description}
                  </p>

                  {/* Step list if present */}
                  {sec.steps && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                      <strong style={{ fontSize: 12, color: 'var(--color-primary)' }}>Step-by-step instructions:</strong>
                      <ol style={{ paddingLeft: 20, fontSize: 12, color: 'var(--text-main)', lineHeight: 1.6 }}>
                        {sec.steps.map((step, sIdx) => (
                          <li key={sIdx} style={{ marginBottom: 4 }}>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Tips list if present */}
                  {sec.tips && (
                    <div
                      style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        borderLeft: '3px solid var(--color-primary)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <strong style={{ fontSize: 11, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                        💡 Coaching Pro-Tip:
                      </strong>
                      {sec.tips.map((tip, tIdx) => (
                        <div key={tIdx} style={{ fontSize: 12, color: '#6ee7b7' }}>
                          • {tip}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
