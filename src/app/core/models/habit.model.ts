export interface Habit {
  id: string;
  name: string;
  identity: string;
  trigger: {
    when: string;
    where: string;
  };
  time: string;
  cue: string;
  reward: string;
  frequency: 'daily' | number[];
  color: string;
  createdAt: Date;
  startDate?: string;
  twoMinuteRule?: string;
  milestone?: {
    target: number;
    unit: string;
    period: 'year' | 'month';
  };
  difficulty?: 'tiny' | 'easy' | 'moderate';
  stackedAfter?: string;
  contract?: {
    commitment: string;
    consequence: string;
    accountabilityPartner?: string;
  };
  dailyProgress?: {
    required: boolean;
    measure: string;
    target?: number;
  };
}

export interface HabitLog {
  habitId: string;
  date: string;
  completed: boolean;
  note?: string;
  milestoneCount?: number;
  progressValue?: number;
}

export type HabitState = 'pending' | 'done' | 'missed';
