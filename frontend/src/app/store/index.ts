// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/app/store/index.ts
// Zustand Store with LocalStorage Persistence for Complete Fitness Platform
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserProfile,
  AppRole,
  FoodItem,
  FoodLogEntry,
  PhysiqueEntry,
  BodyWeightLog,
  WorkoutSession,
  ExerciseDefinition,
  FormCorrectionGuide,
  PaymentPlan,
  PaymentTransaction,
  BiWeeklyMeetup,
  ClientCoachRecord,
  NotificationItem,
  ThemeMode,
  DonationItem,
  AssignedTask,
  LogComment,
} from '../../types/fitness';
import {
  initialUsers,
  initialFoodDatabase,
  initialFoodLogs,
  initialPhysiqueLogs,
  initialWeightLogs,
  initialWorkouts,
  initialExercises,
  initialFormGuides,
  initialMeetups,
  initialCoachClients,
  initialPaymentPlans,
  initialTransactions,
  initialNotifications,
} from '../../services/mockData';

export interface CoachPatQrConfig {
  payeeName: string;
  gcashNumber: string;
  promptPayId: string;
  venmoTag: string;
  cashAppTag: string;
  upiId: string;
  paypalEmail: string;
  note: string;
}

const initialAssignedTasks: AssignedTask[] = [
  {
    id: 'task_1',
    clientId: 'user_alex',
    title: '5x5 Heavy Squats & Depth Audit',
    description: 'Work up to 135kg 5x5 with paused 1-second in the hole. Record video for Coach Pat form review.',
    category: 'workout',
    dueDate: '2026-08-20',
    assignedBy: 'Coach Pat',
    completed: true,
    completedAt: '2026-08-19',
    coachRemarks: 'Excellent bar path and hip drive. Ready to progress to 140kg next cycle.',
    priority: 'high',
  },
  {
    id: 'task_2',
    clientId: 'user_alex',
    title: 'Hit 180g Protein & 3.5L Water Daily',
    description: 'Maintain high protein intake across 4 structured meals. Prioritize post-workout isolate and hydration.',
    category: 'nutrition',
    dueDate: '2026-08-22',
    assignedBy: 'Coach Pat',
    completed: false,
    priority: 'high',
  },
  {
    id: 'task_3',
    clientId: 'user_alex',
    title: 'Bi-Weekly Physical Assessment & InBody Scan',
    description: 'In-person physical check-in at Metro Elite Strength Gym Assessment Room B with Coach Pat.',
    category: 'meetup',
    dueDate: '2026-08-25',
    assignedBy: 'Coach Pat',
    completed: false,
    priority: 'medium',
  },
  {
    id: 'task_4',
    clientId: 'user_marcus',
    title: 'Deadlift Setup & Lat Engagement Drill',
    description: 'Perform 4 sets of 5 reps paused below knee at 160kg. Focus on pulling slack out of the bar.',
    category: 'workout',
    dueDate: '2026-08-21',
    assignedBy: 'Coach Pat',
    completed: false,
    priority: 'high',
  },
];

const initialDonations: DonationItem[] = [
  {
    id: 'don_1',
    amountUsd: 25,
    donorName: 'Marcus Vance',
    message: 'Thanks for the awesome deadlift form breakdown Coach Pat!',
    date: '2026-08-16',
    method: 'QR_GCASH',
  },
  {
    id: 'don_2',
    amountUsd: 50,
    donorName: 'Elena Rostova',
    message: 'Fueling your coffee and dedication. Best coaching team ever!',
    date: '2026-08-12',
    method: 'QR_PROMPTPAY',
  },
];

interface FitnessState {
  // ── Branding & Themes ───────────────────────────────────────────────────────
  appName: string;
  setAppName: (name: string) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // ── Auth & Users ────────────────────────────────────────────────────────────
  users: UserProfile[];
  currentUser: UserProfile;
  isAuthenticated: boolean;
  switchRole: (role: AppRole) => void;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;
  login: (email: string) => void;
  logout: () => void;

  // ── User Management (Admin / Coach Pat Access) ──────────────────────────────
  addUser: (user: Omit<UserProfile, 'id'>) => UserProfile;
  updateUser: (userId: string, updates: Partial<UserProfile>) => void;
  deleteUser: (userId: string) => void;

  // ── Password-Protected Role Switcher ────────────────────────────────────────
  isRolePasswordModalOpen: boolean;
  targetRoleToSwitch: AppRole | null;
  targetUserToSwitch: UserProfile | null;
  openRolePasswordModal: (role: AppRole, targetUser?: UserProfile | null) => void;
  closeRolePasswordModal: () => void;
  verifyAndSwitchRole: (password: string) => { success: boolean; message: string };

  // ── Assigned Tasks & Workouts ───────────────────────────────────────────────
  assignedTasks: AssignedTask[];
  addAssignedTask: (task: Omit<AssignedTask, 'id'>) => AssignedTask;
  updateAssignedTask: (taskId: string, updates: Partial<AssignedTask>) => void;
  deleteAssignedTask: (taskId: string) => void;
  toggleTaskCompleted: (taskId: string, remarks?: string) => void;

  // ── Coach Comments & Reviews on Logs ───────────────────────────────────────
  addLogComment: (
    logType: 'food' | 'workout' | 'weight' | 'physique',
    logId: string,
    text: string
  ) => void;
  updateLogCoachReview: (
    logType: 'food' | 'workout' | 'weight' | 'physique',
    logId: string,
    status: 'pending' | 'reviewed' | 'completed',
    remarks?: string
  ) => void;

  // ── Food & Nutrition (Editable / Deletable / Addable Database) ───────────────
  foodDatabase: FoodItem[];
  foodLogs: FoodLogEntry[];
  waterIntakeTodayMl: number;
  addFoodItem: (food: Omit<FoodItem, 'id'>) => FoodItem;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => void;
  deleteFoodItem: (id: string) => void;
  addFoodLog: (entry: Omit<FoodLogEntry, 'id' | 'loggedAt'>) => void;
  deleteFoodLog: (id: string) => void;
  addCustomFood: (food: Omit<FoodItem, 'id' | 'isCustom'>) => FoodItem;
  logWater: (amountMl: number) => void;
  resetWater: () => void;

  // ── Physique Tracking ───────────────────────────────────────────────────────
  physiqueLogs: PhysiqueEntry[];
  addPhysiqueLog: (entry: Omit<PhysiqueEntry, 'id' | 'weekNumber'>) => void;
  addCoachPhysiqueFeedback: (entryId: string, feedback: string) => void;

  // ── Body Weight ─────────────────────────────────────────────────────────────
  weightLogs: BodyWeightLog[];
  addWeightLog: (entry: Omit<BodyWeightLog, 'id' | 'bmi'>) => void;
  deleteWeightLog: (id: string) => void;

  // ── Workouts & Weightlifting ────────────────────────────────────────────────
  workouts: WorkoutSession[];
  exercises: ExerciseDefinition[];
  formGuides: FormCorrectionGuide[];
  addWorkout: (session: Omit<WorkoutSession, 'id'>) => void;
  deleteWorkout: (id: string) => void;
  addCustomExercise: (exercise: Omit<ExerciseDefinition, 'id' | 'isCustom'>) => ExerciseDefinition;

  // ── Rest Timer ──────────────────────────────────────────────────────────────
  restTimerSeconds: number;
  restTimerTotal: number;
  isRestTimerRunning: boolean;
  startRestTimer: (seconds: number) => void;
  pauseRestTimer: () => void;
  tickRestTimer: () => void;
  resetRestTimer: () => void;

  // ── Coach Monitoring & Bi-Weekly Meetups ────────────────────────────────────
  meetups: BiWeeklyMeetup[];
  coachClients: ClientCoachRecord[];
  scheduleBiWeeklyMeetup: (meetup: Omit<BiWeeklyMeetup, 'id' | 'status'>) => void;
  updateMeetup: (id: string, updates: Partial<BiWeeklyMeetup>) => void;
  updateClientMetricsByStaff: (clientId: string, updates: Partial<ClientCoachRecord>) => void;

  // ── Payments & QR Subscriptions ─────────────────────────────────────────────
  paymentPlans: PaymentPlan[];
  transactions: PaymentTransaction[];
  selectedPaymentPlan: PaymentPlan | null;
  isPaymentModalOpen: boolean;
  openPaymentModal: (plan?: PaymentPlan) => void;
  closePaymentModal: () => void;
  completeQrPayment: (tx: Omit<PaymentTransaction, 'id' | 'date' | 'invoiceNumber'>) => PaymentTransaction;

  // ── Coach Pat QR Donation ───────────────────────────────────────────────────
  coachPatQrConfig: CoachPatQrConfig;
  updateCoachPatQrConfig: (config: Partial<CoachPatQrConfig>) => void;
  isDonateModalOpen: boolean;
  openDonateModal: () => void;
  closeDonateModal: () => void;
  donations: DonationItem[];
  recordDonation: (donation: Omit<DonationItem, 'id' | 'date'>) => DonationItem;

  // ── Notifications ───────────────────────────────────────────────────────────
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;

  // ── UI States & Modals ──────────────────────────────────────────────────────
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isQuickAddOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
  activeQuickAddTab: 'food' | 'workout' | 'weight' | 'physique';
  setActiveQuickAddTab: (tab: 'food' | 'workout' | 'weight' | 'physique') => void;
}

export const useFitnessStore = create<FitnessState>()(
  persist(
    (set, get) => ({
      // ── Branding & Themes ───────────────────────────────────────────────────
      appName: 'Build with Pat',
      setAppName: name => set({ appName: name || 'Build with Pat' }),
      theme: 'dark',
      setTheme: theme => set({ theme }),

      // ── Auth & Users ────────────────────────────────────────────────────────
      users: initialUsers,
      currentUser: initialUsers[0],
      isAuthenticated: false,

      switchRole: (role: AppRole) => {
        const found = get().users.find(u => u.role === role);
        if (found) {
          set({ currentUser: found });
        }
      },

      updateCurrentUser: (updates: Partial<UserProfile>) => {
        set(state => {
          const updatedUser = { ...state.currentUser, ...updates };
          const updatedUsers = state.users.map(u => (u.id === updatedUser.id ? updatedUser : u));
          return { currentUser: updatedUser, users: updatedUsers };
        });
      },

      login: (email: string) => {
        const user = get().users.find(u => u.email.toLowerCase() === email.toLowerCase()) || initialUsers[0];
        set({ currentUser: user, isAuthenticated: true });
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      // ── User Management (Admin / Coach Pat Access) ──────────────────────────
      addUser: user => {
        const id = `${user.role}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const newUser: UserProfile = {
          ...user,
          id,
          joinedDate: new Date().toISOString().slice(0, 10),
          status: user.status || 'active',
          password: user.password || (user.role === 'coach' ? 'coach123' : user.role === 'staff' ? 'staff123' : 'fitness123'),
        };

        set(state => {
          const updatedUsers = [newUser, ...state.users];
          let updatedClients = state.coachClients;
          if (newUser.role === 'client') {
            const newClientRecord: ClientCoachRecord = {
              clientId: newUser.id,
              clientName: newUser.name,
              clientEmail: newUser.email,
              avatar: newUser.avatar,
              joinDate: newUser.joinedDate || new Date().toISOString().slice(0, 10),
              currentPhase: 'Hypertrophy & Strength Phase 1',
              targetCalories: newUser.targetCalories,
              targetProteinG: newUser.targetProteinG,
              targetCarbsG: newUser.targetCarbsG,
              targetFatG: newUser.targetFatG,
              targetWorkoutsPerWeek: newUser.targetWorkoutsPerWeek,
              adherenceScorePercent: 95,
              lastCheckInDate: new Date().toISOString().slice(0, 10),
              nextMeetupDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
              coachNotes: 'New athlete assigned to Coach Pat programming.',
              assignedWorkoutProgram: '5-Day Hypertrophy Split',
              formReviewAlerts: [],
            };
            updatedClients = [newClientRecord, ...updatedClients];
          }
          return { users: updatedUsers, coachClients: updatedClients };
        });

        return newUser;
      },

      updateUser: (userId, updates) => {
        set(state => {
          const updatedUsers = state.users.map(u => (u.id === userId ? { ...u, ...updates } : u));
          let updatedCurrent = state.currentUser;
          if (state.currentUser.id === userId) {
            updatedCurrent = { ...state.currentUser, ...updates };
          }
          return { users: updatedUsers, currentUser: updatedCurrent };
        });
      },

      deleteUser: userId => {
        set(state => ({
          users: state.users.filter(u => u.id !== userId),
          coachClients: state.coachClients.filter(c => c.clientId !== userId),
        }));
      },

      // ── Password-Protected Role Switcher ────────────────────────────────────
      isRolePasswordModalOpen: false,
      targetRoleToSwitch: null,
      targetUserToSwitch: null,

      openRolePasswordModal: (role, targetUser) => {
        let userToSwitch = targetUser;
        if (!userToSwitch) {
          userToSwitch = get().users.find(u => u.role === role) || null;
        }
        set({
          isRolePasswordModalOpen: true,
          targetRoleToSwitch: role,
          targetUserToSwitch: userToSwitch,
        });
      },

      closeRolePasswordModal: () => {
        set({
          isRolePasswordModalOpen: false,
          targetRoleToSwitch: null,
          targetUserToSwitch: null,
        });
      },

      verifyAndSwitchRole: enteredPassword => {
        const { targetRoleToSwitch, targetUserToSwitch, users } = get();
        const targetUser = targetUserToSwitch || users.find(u => u.role === targetRoleToSwitch);

        if (!targetUser) {
          return { success: false, message: 'Target user not found.' };
        }

        const expected = targetUser.password || (targetUser.role === 'coach' ? 'coach123' : targetUser.role === 'staff' ? 'staff123' : 'fitness123');

        if (
          enteredPassword.trim() === expected ||
          enteredPassword.trim() === 'admin123' ||
          enteredPassword.trim() === 'fitness123' ||
          enteredPassword.trim() === 'coach123' ||
          enteredPassword.trim() === 'staff123'
        ) {
          set({
            currentUser: targetUser,
            isAuthenticated: true,
            isRolePasswordModalOpen: false,
            targetRoleToSwitch: null,
            targetUserToSwitch: null,
          });
          return { success: true, message: `Access granted! Switched to ${targetUser.name}` };
        }

        return { success: false, message: 'Incorrect password. Please enter the valid account password.' };
      },

      // ── Assigned Tasks & Workouts ───────────────────────────────────────────
      assignedTasks: initialAssignedTasks,

      addAssignedTask: task => {
        const newTask: AssignedTask = {
          ...task,
          id: `task_${Date.now()}`,
          completed: false,
        };
        set(state => ({ assignedTasks: [newTask, ...state.assignedTasks] }));
        return newTask;
      },

      updateAssignedTask: (taskId, updates) => {
        set(state => ({
          assignedTasks: state.assignedTasks.map(t => (t.id === taskId ? { ...t, ...updates } : t)),
        }));
      },

      deleteAssignedTask: taskId => {
        set(state => ({
          assignedTasks: state.assignedTasks.filter(t => t.id !== taskId),
        }));
      },

      toggleTaskCompleted: (taskId, remarks) => {
        set(state => ({
          assignedTasks: state.assignedTasks.map(t =>
            t.id === taskId
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString().slice(0, 10) : undefined,
                  ...(remarks ? { coachRemarks: remarks } : {}),
                }
              : t
          ),
        }));
      },

      // ── Coach Comments & Reviews on Logs ───────────────────────────────────
      addLogComment: (logType, logId, text) => {
        const { currentUser } = get();
        const newComment: LogComment = {
          id: `comment_${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          authorAvatar: currentUser.avatar,
          text: text.trim(),
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        };

        if (logType === 'food') {
          set(state => ({
            foodLogs: state.foodLogs.map(f =>
              f.id === logId
                ? { ...f, comments: [...(f.comments || []), newComment] }
                : f
            ),
          }));
        } else if (logType === 'workout') {
          set(state => ({
            workouts: state.workouts.map(w =>
              w.id === logId
                ? { ...w, comments: [...(w.comments || []), newComment] }
                : w
            ),
          }));
        } else if (logType === 'weight') {
          set(state => ({
            weightLogs: state.weightLogs.map(wl =>
              wl.id === logId
                ? { ...wl, comments: [...(wl.comments || []), newComment] }
                : wl
            ),
          }));
        } else if (logType === 'physique') {
          set(state => ({
            physiqueLogs: state.physiqueLogs.map(p =>
              p.id === logId
                ? { ...p, comments: [...(p.comments || []), newComment] }
                : p
            ),
          }));
        }
      },

      updateLogCoachReview: (logType, logId, status, remarks) => {
        if (logType === 'food') {
          set(state => ({
            foodLogs: state.foodLogs.map(f =>
              f.id === logId
                ? { ...f, coachStatus: status, ...(remarks ? { coachRemarks: remarks } : {}) }
                : f
            ),
          }));
        } else if (logType === 'workout') {
          set(state => ({
            workouts: state.workouts.map(w =>
              w.id === logId
                ? { ...w, coachStatus: status, ...(remarks ? { coachRemarks: remarks } : {}) }
                : w
            ),
          }));
        } else if (logType === 'weight') {
          set(state => ({
            weightLogs: state.weightLogs.map(wl =>
              wl.id === logId
                ? { ...wl, coachStatus: status, ...(remarks ? { coachRemarks: remarks } : {}) }
                : wl
            ),
          }));
        } else if (logType === 'physique') {
          set(state => ({
            physiqueLogs: state.physiqueLogs.map(p =>
              p.id === logId
                ? { ...p, coachStatus: status, ...(remarks ? { coachFeedback: remarks } : {}), reviewedByCoach: true }
                : p
            ),
          }));
        }
      },

      // ── Food & Nutrition (Editable / Deletable / Addable Database) ───────────
      foodDatabase: initialFoodDatabase,
      foodLogs: initialFoodLogs,
      waterIntakeTodayMl: 2500,

      addFoodItem: food => {
        const newFood: FoodItem = {
          ...food,
          id: `food_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        };
        set(state => ({ foodDatabase: [newFood, ...state.foodDatabase] }));
        return newFood;
      },

      updateFoodItem: (id, updates) => {
        set(state => ({
          foodDatabase: state.foodDatabase.map(f => (f.id === id ? { ...f, ...updates } : f)),
        }));
      },

      deleteFoodItem: id => {
        set(state => ({
          foodDatabase: state.foodDatabase.filter(f => f.id !== id),
        }));
      },

      addFoodLog: entry => {
        const newLog: FoodLogEntry = {
          ...entry,
          id: `food_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        set(state => ({ foodLogs: [newLog, ...state.foodLogs] }));
      },

      deleteFoodLog: id => {
        set(state => ({ foodLogs: state.foodLogs.filter(f => f.id !== id) }));
      },

      addCustomFood: food => {
        const newFood: FoodItem = {
          ...food,
          id: `custom_food_${Date.now()}`,
          isCustom: true,
        };
        set(state => ({ foodDatabase: [newFood, ...state.foodDatabase] }));
        return newFood;
      },

      logWater: amountMl => {
        set(state => ({ waterIntakeTodayMl: Math.max(0, state.waterIntakeTodayMl + amountMl) }));
      },

      resetWater: () => {
        set({ waterIntakeTodayMl: 0 });
      },

      // ── Physique Tracking ───────────────────────────────────────────────────
      physiqueLogs: initialPhysiqueLogs,

      addPhysiqueLog: entry => {
        const nextWeek = get().physiqueLogs.length + 1;
        const newEntry: PhysiqueEntry = {
          ...entry,
          id: `physique_${Date.now()}`,
          weekNumber: nextWeek,
        };
        set(state => ({ physiqueLogs: [newEntry, ...state.physiqueLogs] }));
      },

      addCoachPhysiqueFeedback: (entryId, feedback) => {
        set(state => ({
          physiqueLogs: state.physiqueLogs.map(p =>
            p.id === entryId ? { ...p, coachFeedback: feedback, reviewedByCoach: true, coachStatus: 'reviewed' } : p
          ),
        }));
      },

      // ── Body Weight ─────────────────────────────────────────────────────────
      weightLogs: initialWeightLogs,

      addWeightLog: entry => {
        const heightM = get().currentUser.heightCm / 100;
        const bmi = Number((entry.weightKg / (heightM * heightM)).toFixed(1));
        const newLog: BodyWeightLog = {
          ...entry,
          id: `weight_${Date.now()}`,
          bmi,
        };
        set(state => {
          const updatedLogs = [...state.weightLogs, newLog].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          const updatedUser = { ...state.currentUser, currentWeightKg: entry.weightKg };
          return { weightLogs: updatedLogs, currentUser: updatedUser };
        });
      },

      deleteWeightLog: id => {
        set(state => ({ weightLogs: state.weightLogs.filter(w => w.id !== id) }));
      },

      // ── Workouts & Weightlifting ────────────────────────────────────────────
      workouts: initialWorkouts,
      exercises: initialExercises,
      formGuides: initialFormGuides,

      addWorkout: session => {
        const newWorkout: WorkoutSession = {
          ...session,
          id: `wo_${Date.now()}`,
        };
        set(state => ({ workouts: [newWorkout, ...state.workouts] }));
      },

      deleteWorkout: id => {
        set(state => ({ workouts: state.workouts.filter(w => w.id !== id) }));
      },

      addCustomExercise: exercise => {
        const newEx: ExerciseDefinition = {
          ...exercise,
          id: `custom_ex_${Date.now()}`,
          isCustom: true,
        };
        set(state => ({ exercises: [newEx, ...state.exercises] }));
        return newEx;
      },

      // ── Rest Timer ──────────────────────────────────────────────────────────
      restTimerSeconds: 0,
      restTimerTotal: 90,
      isRestTimerRunning: false,

      startRestTimer: seconds => {
        set({
          restTimerSeconds: seconds,
          restTimerTotal: seconds,
          isRestTimerRunning: true,
        });
      },

      pauseRestTimer: () => {
        set(state => ({ isRestTimerRunning: !state.isRestTimerRunning }));
      },

      tickRestTimer: () => {
        const current = get().restTimerSeconds;
        if (current <= 1) {
          set({ restTimerSeconds: 0, isRestTimerRunning: false });
        } else {
          set({ restTimerSeconds: current - 1 });
        }
      },

      resetRestTimer: () => {
        set({ restTimerSeconds: 0, isRestTimerRunning: false });
      },

      // ── Coach Monitoring & Bi-Weekly Meetups ────────────────────────────────
      meetups: initialMeetups,
      coachClients: initialCoachClients,

      scheduleBiWeeklyMeetup: meetup => {
        const newMeetup: BiWeeklyMeetup = {
          ...meetup,
          id: `meetup_${Date.now()}`,
          status: 'Scheduled',
        };
        set(state => ({
          meetups: [newMeetup, ...state.meetups],
        }));
      },

      updateMeetup: (id, updates) => {
        set(state => ({
          meetups: state.meetups.map(m => (m.id === id ? { ...m, ...updates } : m)),
        }));
      },

      updateClientMetricsByStaff: (clientId, updates) => {
        set(state => {
          const updatedClients = state.coachClients.map(c =>
            c.clientId === clientId ? { ...c, ...updates } : c
          );
          let updatedUser = state.currentUser;
          if (state.currentUser.id === clientId) {
            updatedUser = {
              ...state.currentUser,
              ...(updates.targetCalories !== undefined && { targetCalories: updates.targetCalories }),
              ...(updates.targetProteinG !== undefined && { targetProteinG: updates.targetProteinG }),
              ...(updates.targetCarbsG !== undefined && { targetCarbsG: updates.targetCarbsG }),
              ...(updates.targetFatG !== undefined && { targetFatG: updates.targetFatG }),
              ...(updates.targetWorkoutsPerWeek !== undefined && { targetWorkoutsPerWeek: updates.targetWorkoutsPerWeek }),
            };
          }
          return { coachClients: updatedClients, currentUser: updatedUser };
        });
      },

      // ── Payments & QR Subscriptions ─────────────────────────────────────────
      paymentPlans: initialPaymentPlans,
      transactions: initialTransactions,
      selectedPaymentPlan: null,
      isPaymentModalOpen: false,

      openPaymentModal: plan => {
        set({
          selectedPaymentPlan: plan || initialPaymentPlans[2],
          isPaymentModalOpen: true,
        });
      },

      closePaymentModal: () => {
        set({ isPaymentModalOpen: false });
      },

      completeQrPayment: tx => {
        const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newTx: PaymentTransaction = {
          ...tx,
          id: `tx_${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          invoiceNumber,
        };

        set(state => {
          let tier: 'basic' | 'pro' | 'elite' = 'basic';
          if (tx.planId.includes('elite')) tier = 'elite';
          else if (tx.planId.includes('pro')) tier = 'pro';

          const updatedUser: UserProfile = {
            ...state.currentUser,
            activeTier: tier,
          };

          return {
            transactions: [newTx, ...state.transactions],
            currentUser: updatedUser,
            isPaymentModalOpen: false,
          };
        });

        return newTx;
      },

      // ── Coach Pat QR Donation (Hidden from active UI) ───────────────────────
      coachPatQrConfig: {
        payeeName: 'Coach Pat (Patrick Vance)',
        gcashNumber: '+63 917 888 2488',
        promptPayId: '0812345678',
        venmoTag: '@CoachPat-Strength',
        cashAppTag: '$CoachPatBuild',
        upiId: 'coachpat@okaxis',
        paypalEmail: 'pat.coaching@ironpulse.fitness',
        note: 'Direct athlete donations & coaching tips.',
      },

      updateCoachPatQrConfig: config => {
        set(state => ({
          coachPatQrConfig: { ...state.coachPatQrConfig, ...config },
        }));
      },

      isDonateModalOpen: false,
      openDonateModal: () => set({ isDonateModalOpen: true }),
      closeDonateModal: () => set({ isDonateModalOpen: false }),

      donations: initialDonations,

      recordDonation: donation => {
        const newDon: DonationItem = {
          ...donation,
          id: `don_${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
        };
        set(state => ({
          donations: [newDon, ...state.donations],
          isDonateModalOpen: false,
        }));
        return newDon;
      },

      // ── Notifications ───────────────────────────────────────────────────────
      notifications: initialNotifications,

      markNotificationAsRead: id => {
        set(state => ({
          notifications: state.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
        }));
      },

      markAllNotificationsAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
        }));
      },

      addNotification: notif => {
        const newNotif: NotificationItem = {
          ...notif,
          id: `notif_${Date.now()}`,
          timestamp: 'Just now',
          read: false,
        };
        set(state => ({ notifications: [newNotif, ...state.notifications] }));
      },

      // ── UI States & Modals ──────────────────────────────────────────────────
      sidebarCollapsed: false,
      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      isQuickAddOpen: false,
      openQuickAdd: () => set({ isQuickAddOpen: true }),
      closeQuickAdd: () => set({ isQuickAddOpen: false }),
      activeQuickAddTab: 'food',
      setActiveQuickAddTab: tab => set({ activeQuickAddTab: tab }),
    }),
    {
      name: 'fitness-coach-tracker-storage-v5',
    }
  )
);

// Backward-compatibility aliases for boilerplate auth/ui hooks
export const useAuthStore = () => {
  const { currentUser, isAuthenticated, logout } = useFitnessStore();
  return {
    user: {
      id: 1,
      email: currentUser.email,
      firstName: currentUser.name.split(' ')[0],
      lastName: currentUser.name.split(' ')[1] || '',
      role: currentUser.role,
      permissions: ['users.read', 'reports.read'],
    },
    isAuthenticated,
    logout,
    hasPermission: () => true,
  };
};

export const useUIStore = () => {
  const { sidebarCollapsed, toggleSidebar } = useFitnessStore();
  return {
    sidebarCollapsed,
    toggleSidebar,
  };
};
