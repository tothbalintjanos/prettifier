export default function(branch: string, botConfig): boolean {
  return ((botConfig || {})['exclude-branches'] || []).includes(branch)
}
