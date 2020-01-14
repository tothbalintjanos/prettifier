export function concatToSet<T>(set: Set<T>, array: T[]) {
  array.forEach(set.add, set)
}
