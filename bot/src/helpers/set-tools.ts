export function concatToSet<T>(set: Set<T>, array: T[]): void {
  array.forEach(set.add, set)
}

export function removeAllFromSet<T>(set: Set<T>, array: T[]): void {
  array.forEach(set.delete, set)
}
