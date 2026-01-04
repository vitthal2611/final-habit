export interface HabitStack {
  id: string;
  name: string;
  habitIds: string[];
  anchor: string; // "After I [anchor], I will..."
}
