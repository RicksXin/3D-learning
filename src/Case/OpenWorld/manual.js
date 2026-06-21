export const CONTROL_MANUAL = [
  { group: 'Movement', key: 'W A S D', action: 'Move player or vehicle' },
  { group: 'Movement', key: 'Space', action: 'Jump' },
  { group: 'Movement', key: 'Mouse', action: 'Look around after clicking the canvas' },
  { group: 'Interaction', key: 'E', action: 'Use or exit the computer' },
  { group: 'Interaction', key: 'H', action: 'Start or continue dialogue' },
  { group: 'Interaction', key: 'K', action: 'Close dialogue' },
  { group: 'Interaction', key: 'J', action: 'Dance after dancer dialogue' },
  { group: 'Interaction', key: 'L', action: 'Stop dancing' },
  { group: 'Vehicles', key: 'X', action: 'Enter or exit the car' },
  { group: 'Vehicles', key: 'C', action: 'Enter or exit the plane' },
  { group: 'Vehicles', key: 'Shift', action: 'Lower plane altitude' },
  { group: 'Interface', key: 'M', action: 'Toggle full map' },
  { group: 'Interface', key: 'F1', action: 'Toggle manual' },
  { group: 'Interface', key: 'Esc', action: 'Close panels' },
];

export function getManualGroups(entries = CONTROL_MANUAL) {
  const groups = new Map();
  entries.forEach((entry) => {
    if (!groups.has(entry.group)) {
      groups.set(entry.group, []);
    }
    groups.get(entry.group).push(entry);
  });

  return Array.from(groups, ([name, items]) => ({ name, items }));
}
