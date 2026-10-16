export const queryKeys = {
  notifications: (userId?: string) => ['notifications', userId] as const,
  settings: (userId?: string) => ['settings', userId] as const,
};
