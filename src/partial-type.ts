/**
 * A mapped type that converts the given type into one where all fields are optional.
 *
 * Assuming we have this type:
 *
 *     interface Person {
 *       name: string
 *       age: number
 *     }
 *
 * We want to also have this type, but be sure all fields match the `Person` type.
 *
 *     interface PersonPartial {
 *       name?: string
 *       age?: number
 *     }
 *
 * This can be done by calling:
 *
 *     type PersonPartial = Partial<Person>
 */
export type Partial<T> = { [P in keyof T]?: T[P] }
