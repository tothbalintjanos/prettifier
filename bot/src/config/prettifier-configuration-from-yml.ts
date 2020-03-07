import { PrettifierConfiguration } from "./prettifier-configuration"
import { UserError } from "../logging/user-error"
import yml from "js-yaml"

/** Provides a PrettifierConfiguration instance populated with the values in the given YML file */
export function prettifierConfigFromYML(configText: string): PrettifierConfiguration {
  if (configText.trim() === "") {
    return new PrettifierConfiguration({})
  }
  let parsed = {}
  try {
    parsed = yml.safeLoad(configText)
  } catch (e) {
    throw new UserError(`Prettifier configuration is not valid YML format:\n${configText}`, e)
  }
  return new PrettifierConfiguration(parsed)
}
