export function isConfigurationFile(filePath: string): boolean {
  return filePath === ".github/prettifier.yml" || filePath === ".prettierrc"
}
