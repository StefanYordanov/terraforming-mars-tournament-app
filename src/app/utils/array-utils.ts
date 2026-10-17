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

export function getRandomInt(min: number, max: number): number {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

export function getRandomIntegerExceptValue(min: number, max: number, exceptValue: number): number {
  if(exceptValue < min ||  max < exceptValue){
    return getRandomInt(min, max);
  } else {
    const result = getRandomInt(min, max - 1);
    if(result >= exceptValue){
      return result + 1;
    }
    return result;
  }

}

