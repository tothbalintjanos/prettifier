export function concatToSet<T>(set: Set<T>, array: T[]) {
  array.forEach(set.add, set)
}

export function removeAllFromSet<T>(set: Set<T>, array: T[]) {
  array.forEach(set.delete, set)
}
