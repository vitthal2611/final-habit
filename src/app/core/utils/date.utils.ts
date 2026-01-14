export class DateUtils {
  static format(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  static isToday(date: Date): boolean {
    return this.format(date) === this.format(new Date());
  }

  static isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.format(date) === this.format(yesterday);
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static getDateLabel(date: Date): string {
    if (this.isToday(date)) return 'Today';
    if (this.isYesterday(date)) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
