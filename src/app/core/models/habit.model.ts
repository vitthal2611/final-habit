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
}

export interface HabitLog {
  habitId: string;
  date: string;
  completed: boolean;
  note?: string;
  milestoneCount?: number;
}

export type HabitState = 'pending' | 'done' | 'missed';
