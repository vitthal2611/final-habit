# Atomic Habits Tracker

A complete habit-tracking system inspired by James Clear's Atomic Habits, built with Angular and modern UI architecture.

## Philosophy

- **Identity-based habits**: Focus on who you're becoming, not what you're achieving
- **Systems over goals**: Build sustainable processes, not temporary targets
- **Consistency over intensity**: Show up regularly, not perfectly
- **Low guilt, high clarity**: No red indicators, no punishment
- **Long-term behavior change**: Designed for years, not weeks

## Architecture

### Tech Stack
- Angular 17+ (standalone components)
- Signals for reactive state management
- TypeScript
- LocalStorage for persistence
- Mobile-first responsive design

### Folder Structure

```
src/app/
├── core/
│   ├── models/           # Data models
│   │   ├── habit.model.ts
│   │   ├── identity.model.ts
│   │   └── metrics.model.ts
│   └── services/         # Business logic
│       ├── habit.service.ts
│       └── storage.service.ts
├── features/             # Feature modules
│   ├── habit-creation/
│   ├── daily-view/
│   │   └── habit-card/   # Reusable habit card
│   ├── metrics/
│   ├── reviews/
│   └── identity-dashboard/
└── shared/
    └── ui/               # Reusable UI primitives
        ├── button.component.ts
        └── card.component.ts
```

### Component Architecture

**Smart Components** (Container):
- DailyViewComponent
- MetricsComponent
- ReviewComponent
- IdentityDashboardComponent
- HabitCreationComponent

**Dumb Components** (Presentational):
- HabitCardComponent
- ButtonComponent
- CardComponent

### State Management

Uses Angular Signals for reactive state:
- `habits` signal in HabitService
- `logs` signal for habit completions
- Computed signals for derived data
- Automatic change detection optimization

## Features

### 1. Habit Creation Flow
Minimal, beginner-friendly form:
- Habit name (action-based)
- Identity reinforcement
- Trigger (when + where)
- Time, location, cue
- Reward (emotional outcome)
- Frequency (daily or custom days)
- Color selection

### 2. Daily Habit Card
Core reusable component with:
- Identity reinforcement at top
- Clear habit name
- Trigger-based subtitle
- Primary CTA: "I showed up today"
- Three states: pending, done, missed (no guilt)
- Weekly consistency indicator
- Collapsible reflection note
- Subtle cue and reward display

### 3. Metrics (Progressive Disclosure)

**Default View**: Today's habits only

**Monthly Metrics**:
- Consistency percentage
- Active days count
- Trend indicator (improving/stable/declining)

**Quarterly Metrics**:
- 3-month consistency trend
- Habits maintained vs dropped
- Identity alignment summary

**Yearly Metrics**:
- Total days showed up
- Strongest habits
- Identity evolution narrative

### 4. Review Screens

**Weekly**: "What helped you show up this week?"
**Monthly**: "What can you simplify next month?"
**Quarterly**: "Which identity did you live into the most?"
**Yearly**: Narrative-style growth summary

### 5. Identity Dashboard

Shows:
- All identities from your habits
- Number of supporting habits
- Actions this month/year
- Identity reinforcement messages

## UI/UX Principles

- **Calm design**: Generous spacing, minimal shadows
- **No red indicators**: Missed habits shown neutrally
- **Mobile-first**: Optimized for phone usage
- **Accessible**: High contrast, clear typography
- **One accent color per habit**: Visual distinction
- **Progressive disclosure**: Advanced metrics hidden by default

## Data Models

### Habit
```typescript
{
  id: string;
  name: string;
  identity: string;
  trigger: { when: string; where: string };
  time: string;
  cue: string;
  reward: string;
  frequency: 'daily' | number[];
  color: string;
  createdAt: Date;
}
```

### HabitLog
```typescript
{
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  note?: string;
}
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Future Enhancements

- Data import/export (JSON)
- Offline support (Service Worker)
- Performance optimization (virtual scrolling)
- Habit templates
- Habit streaks (optional)
- Dark mode
- Habit archiving

## Design Decisions

### Why no streaks by default?
Streaks can create pressure and guilt. We show weekly consistency instead, which is forgiving and sustainable.

### Why "I showed up today" instead of "Mark complete"?
Language matters. "Showing up" reinforces identity and effort over perfection.

### Why no red for missed habits?
Red creates negative emotions. We use neutral gray to acknowledge without punishing.

### Why progressive disclosure for metrics?
Cognitive load reduction. Most users only need today's view. Advanced metrics are there when needed.

### Why identity-first?
James Clear's core principle: behavior change is identity change. Every habit reinforces "I am becoming..."

## License

MIT
