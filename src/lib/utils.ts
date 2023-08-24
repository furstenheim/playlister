export function isNil (x: unknown): x is null | undefined {
  return x === null || x === undefined
}

export function getTimeAfterSeconds (seconds: number): number {
  const parsedDate = new Date()
  return parsedDate.getTime() + (1000 * seconds)
}

export function isTimeExpired (time: number): boolean {
  const parsedDate = new Date()
  return parsedDate.getTime() > time
}

export function debounce<T extends (...args: Parameters<T>) => unknown> (f: T, timeInMiliseconds: number): (...args: Parameters<T>) => unknown {
  let t: number | undefined
  return function (...args: Parameters<T>): void {
    clearTimeout(t)
    t = setTimeout(() => {
      f(...args)
    }, timeInMiliseconds) as unknown as number
  }
}

export function compareTwoStrings (first: string, second: string): number {
  first = first.replace(/\s+/g, '')
  second = second.replace(/\s+/g, '')

  if (first === second) return 1 // identical or empty
  if (first.length < 2 || second.length < 2) return 0 // if either is a 0-letter or 1-letter string

  const firstBigrams = new Map<string, number>()
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2)
    const count = firstBigrams.has(bigram)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ? firstBigrams.get(bigram)! + 1
      : 1

    firstBigrams.set(bigram, count)
  }

  let intersectionSize = 0
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2)
    const count = firstBigrams.has(bigram)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ? firstBigrams.get(bigram)!
      : 0

    if (count > 0) {
      firstBigrams.set(bigram, count - 1)
      intersectionSize++
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2)
}
