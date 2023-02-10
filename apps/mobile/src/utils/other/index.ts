import {GoalsEntry} from '@fitlink/api/src/modules/goals-entries/entities/goals-entry.entity';

export function calculateGoalsPercentage(goalsEntry: GoalsEntry) {
  const d1 = goalsEntry.current_steps / goalsEntry.target_steps;
  const d2 =
    goalsEntry.current_floors_climbed / goalsEntry.target_floors_climbed;
  const d3 = goalsEntry.current_water_litres / goalsEntry.target_water_litres;
  const d4 = goalsEntry.current_sleep_hours / goalsEntry.target_sleep_hours;
  const d5 =
    goalsEntry.current_mindfulness_minutes /
    goalsEntry.target_mindfulness_minutes;
  const total = [d1, d2, d3, d4, d5]
    .map(i => (i > 1 ? 1 : i))
    .reduce((a, b) => a + b, 0);
  return Math.round((total / 5) * 100) / 100;
}

export const getPositiveValueOrZero = (value?: number | null) =>
  value !== null && value !== undefined && value >= 0 ? value : 0;
