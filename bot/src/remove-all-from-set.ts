export function removeAllFromSet<T>(set: Set<T>, array: T[]) {
  array.forEach(set.delete, set)
}
