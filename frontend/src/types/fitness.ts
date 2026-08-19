// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/types/fitness.ts
// Complete Domain Models for Fitness Coach Tracker
// ─────────────────────────────────────────────────────────────────────────────

export type AppRole = 'client' | 'coach' | 'staff';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  roleTitle: string;
  avatar: string;
  phone?: string;
  heightCm: number;
  startingWeightKg: number;
  currentWeightKg: number;
  goalWeightKg: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetFiberG: number;
  targetWaterMl: number;
  targetWorkoutsPerWeek: number;
  assignedCoach: string;
  activeTier: 'basic' | 'pro' | 'elite';
  subscriptionExpiry: string;
  password?: string;
  status?: 'active' | 'inactive';
  joinedDate?: string;
}

// ── Food & Nutrition ──────────────────────────────────────────────────────────

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodiumMg?: number;
  potassiumMg?: number;
  ironMg?: number;
  calciumMg?: number;
  isCustom?: boolean;
}

export interface FoodLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealCategory: MealCategory;
  food: FoodItem;
  servings: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  loggedAt: string;
}

export interface DailyNutritionLog {
  date: string;
  entries: FoodLogEntry[];
  waterIntakeMl: number;
  notes?: string;
}

// ── Physique Tracking ─────────────────────────────────────────────────────────

export interface PhysiqueEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weekNumber: number;
  frontPhoto: string;
  sidePhoto: string;
  backPhoto: string;
  weightKg: number;
  bodyFatPercent?: number;
  measurements: {
    chestCm: number;
    waistCm: number;
    hipsCm: number;
    leftArmCm: number;
    rightArmCm: number;
    leftThighCm: number;
    rightThighCm: number;
    shouldersCm?: number;
    neckCm?: number;
  };
  notes: string;
  coachFeedback?: string;
  reviewedByCoach?: boolean;
}

// ── Weight Tracking ───────────────────────────────────────────────────────────

export interface BodyWeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  timeOfDay: 'morning' | 'evening';
  notes?: string;
  bmi?: number;
}

// ── Weightlifting & Workouts ──────────────────────────────────────────────────

export type SplitType =
  | 'Push'
  | 'Pull'
  | 'Legs'
  | 'Upper Body'
  | 'Lower Body'
  | 'Full Body'
  | 'Arms & Shoulders'
  | 'Core & Cardio';

export interface WeightliftingSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe?: number; // Rate of Perceived Exertion (1 - 10)
  completed: boolean;
  isPR?: boolean;
  notes?: string;
}

export interface WorkoutExerciseLog {
  exerciseId: string;
  exerciseName: string;
  targetMuscle: string;
  sets: WeightliftingSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  splitType: SplitType;
  durationMinutes: number;
  exercises: WorkoutExerciseLog[];
  totalVolumeKg: number;
  totalSets: number;
  totalReps: number;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  completed: boolean;
}

// ── Exercise Library & Form Correction ────────────────────────────────────────

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Quadriceps'
  | 'Hamstrings'
  | 'Glutes'
  | 'Biceps'
  | 'Triceps'
  | 'Calves'
  | 'Core'
  | 'Cardio';

export type EquipmentType =
  | 'Minimal / Home (Bodyweight)'
  | 'Minimal / Home (Dumbbells)'
  | 'Minimal / Home (Resistance Bands)'
  | 'Minimal / Home (Kettlebell)'
  | 'Minimal / Home (Pull-up Bar)'
  | 'Gym (Barbell)'
  | 'Gym (Cable Machine)'
  | 'Gym (Weight Machine)'
  | 'Gym (Smith Machine)'
  | 'Gym (Dumbbells)';

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  isMinimalEquipment: boolean;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string[];
  tips: string[];
  isCustom?: boolean;
  imageUrl?: string;
}

export interface FormCorrectionGuide {
  id: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  svgVisualType: 'squat' | 'deadlift' | 'bench_press' | 'overhead_press' | 'barbell_row' | 'pull_up' | 'rdl' | 'bicep_curl' | 'lunge' | 'lateral_raise';
  summary: string;
  correctFormPoints: string[];
  dangerousMistakes: {
    mistake: string;
    risk: string;
    correction: string;
  }[];
  setupSteps: string[];
  executionCues: string[];
  breathingCue: string;
  jointAngleCheckpoints: {
    joint: string;
    optimalAngle: string;
    tip: string;
  }[];
  preLiftChecklist: string[];
}

// ── Payment & Subscriptions ───────────────────────────────────────────────────

export interface PaymentPlan {
  id: string;
  title: string;
  priceUsd: number;
  period: string;
  badge?: string;
  popular?: boolean;
  description: string;
  features: string[];
  qrPayload: string;
}

export interface PaymentTransaction {
  id: string;
  date: string;
  planId: string;
  planTitle: string;
  amountUsd: number;
  method: 'QR_PROMPTPAY' | 'QR_GCASH' | 'QR_VENMO' | 'QR_UPI' | 'QR_SEPA';
  qrReferenceCode: string;
  status: 'Completed' | 'Pending Verification' | 'Processing';
  invoiceNumber: string;
  payerName: string;
}

// ── Coach Monitoring & Bi-Weekly Meetups ───────────────────────────────────────

export interface BiWeeklyMeetup {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  coachId: string;
  coachName: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  cycleNumber: number; // e.g. Cycle #6 (Week 12)
  status: 'Scheduled' | 'Completed' | 'Rescheduled';
  agenda: string[];
  inBodyScan?: {
    weightKg: number;
    skeletalMuscleKg: number;
    bodyFatPercent: number;
    visceralFatLevel: number;
    waterPercent: number;
  };
  physicalScreeningNotes?: string;
  coachPrescriptions?: string[];
  coachNotes?: string;
}

export interface ClientCoachRecord {
  clientId: string;
  clientName: string;
  clientEmail: string;
  avatar: string;
  joinDate: string;
  currentPhase: string;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetWorkoutsPerWeek: number;
  adherenceScorePercent: number;
  lastCheckInDate: string;
  nextMeetupDate: string;
  coachNotes: string;
  assignedWorkoutProgram: string;
  formReviewAlerts: string[];
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'meetup' | 'workout' | 'nutrition' | 'coach' | 'system';
  timestamp: string;
  read: boolean;
  linkUrl?: string;
}

// ── Theme & Donations ─────────────────────────────────────────────────────────

export type ThemeMode = 'dark' | 'light' | 'auto';

export interface DonationItem {
  id: string;
  amountUsd: number;
  donorName: string;
  message: string;
  date: string;
  method: 'QR_GCASH' | 'QR_PROMPTPAY' | 'QR_VENMO' | 'QR_CASHAPP' | 'QR_UPI' | 'QR_PAYPAL' | 'QR_SEPA';
}

