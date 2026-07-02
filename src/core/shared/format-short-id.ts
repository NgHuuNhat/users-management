export function formatShortId(id: string): string {
  return id?.slice(-4).toUpperCase() ?? "";
}