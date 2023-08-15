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
    }, timeInMiliseconds)
  }
}
