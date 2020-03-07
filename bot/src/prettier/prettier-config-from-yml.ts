import yml from "js-yaml"
import { UserError } from "../logging/user-error"

/** Returns a PrettierConfiguration with the given content */
export function prettierConfigFromYML(configText: string): object {
  try {
    return yml.safeLoad(configText) || {}
  } catch (e) {
    throw new UserError("parsing .prettierrc:", e)
  }
}
