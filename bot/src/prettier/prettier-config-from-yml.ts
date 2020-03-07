import yml from "js-yaml"
import { UserError } from "../logging/user-error"
import { PrettierConfiguration } from "./prettier-configuration"

/** Returns a PrettierConfiguration with the given content */
export function prettierConfigFromYML(configText: string): PrettierConfiguration {
  try {
    return yml.safeLoad(configText) || {}
  } catch (e) {
    throw new UserError("parsing .prettierrc:", e)
  }
}
