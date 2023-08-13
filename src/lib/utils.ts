export function isNil (x: unknown): x is null | undefined {
  return x === null || x === undefined
}

export function debounce<T extends (...args: Parameters<T>) => void> (f: T, timeInMiliseconds: number): (...args: Parameters<T>) => void {
  let t: number | undefined
  return function (...args: Parameters<T>): void {
    clearTimeout(t)
    t = setTimeout(() => {
      f(...args)
    }, timeInMiliseconds)
  }
}
