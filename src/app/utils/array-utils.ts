export function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

// example
//const values = range(5); // [0, 1, 2, 3, 4]
