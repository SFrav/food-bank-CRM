/**
 * Cache keys.
 *
 * Rules that keep realtime + optimistic updates predictable:
 *  1. Every query has ONE full key. Writes (setQueryData) always target a full key.
 *  2. Prefix matching is only used on purpose, via invalidateQueries / setQueriesData:
 *       ['contacts']          -> everything about contacts (use for merge/delete)
 *       ['contacts', 'list']  -> only the contact lists (all order/queue variants)
 *       ['contacts', 'days']  -> only the days queries, and so on
 *  3. Entries under the same prefix may have DIFFERENT data shapes (list vs days vs
 *     notes). Never patch by the bare ['contacts'] prefix.
 */
export const queryKeys = {
  profile: (userId?: string) => ['profile', userId] as const,
  notifications: (userId?: string) => ['notifications', userId] as const,
  userSettings: (userId?: string) => ['user_settings', userId] as const,

  // --- contacts family ---
  contacts: () => ['contacts'] as const,
  contactsLists: () => ['contacts', 'list'] as const,
  contactsList: (orderDesc: boolean, filterQueue: boolean) =>
    ['contacts', 'list', { orderDesc, filterQueue }] as const,
  contactsDays: (contactId?: string) =>
    contactId ? (['contacts', 'days', contactId] as const) : (['contacts', 'days'] as const),
  contactsNotes: (contactId?: string) =>
    contactId ? (['contacts', 'notes', contactId] as const) : (['contacts', 'notes'] as const),
  allotment: (contactId?: string) =>
    contactId ? (['contacts', 'allotment', contactId] as const) : (['contacts', 'allotment'] as const),

  referrerRating: (referrerId?: string) =>
    referrerId ? (['referrerRating', referrerId] as const) : (['referrerRating'] as const),
  referrerRatingsAverage: (regionId?: string) =>
    regionId ? (['referrerRatingsAverage', regionId] as const) : (['referrerRatingsAverage'] as const),
};
