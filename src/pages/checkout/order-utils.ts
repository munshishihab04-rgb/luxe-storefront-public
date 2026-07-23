export function isPaidOrderStatus(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const payload = value as { ok?: boolean; order?: { status?: string } };
  return payload.ok === true && payload.order?.status === "paid";
}
