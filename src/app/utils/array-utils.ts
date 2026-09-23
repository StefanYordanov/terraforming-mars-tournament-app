export function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

// example
//const values = range(5); // [0, 1, 2, 3, 4]