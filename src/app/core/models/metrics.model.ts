export interface WeeklyMetrics {
  completedDays: number;
  totalDays: number;
}

export interface MonthlyMetrics {
  consistency: number;
  activeDays: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface QuarterlyMetrics {
  consistencyTrend: number[];
  habitsActive: number;
  habitsDropped: number;
  identityAlignment: string;
}

export interface YearlyMetrics {
  totalDaysShowedUp: number;
  strongestHabits: string[];
  longestStreak?: number;
  identityEvolution: string;
}
