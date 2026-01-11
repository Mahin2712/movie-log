export const uuid = () =>
  crypto.randomUUID?.() ??
  Math.random().toString(36).slice(2);
