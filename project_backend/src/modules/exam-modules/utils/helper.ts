export function getRandomElements<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, n);
}

export function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function generateUniqueShuffledLists<T>(items: T[], desiredCount: number): T[][] {
  if (!Array.isArray(items) || items.length === 0 || desiredCount <= 0) {
    return [];
  }

  const uniqueLists: T[][] = [];
  const seen = new Set<string>();
  const maxAttempts = Math.max(desiredCount * 30, 100);
  let attempts = 0;

  while (uniqueLists.length < desiredCount && attempts < maxAttempts) {
    const shuffled = shuffleArray(items);
    const key = JSON.stringify(shuffled);

    if (!seen.has(key)) {
      seen.add(key);
      uniqueLists.push(shuffled);
    }

    attempts += 1;
  }

  return uniqueLists;
}
