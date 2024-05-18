export const DEFAULT_PER_PAGE = '10';

export const EVENTS_ALLOWED_VALUES = {
  perPage: ['5', '10', '20', '50'] as const,
  sortBy: ['title', 'event-date', 'organizer'] as const,
  eventChanel: ['friends', 'social-media', 'found-myself'] as const,
  order: ['desc', 'asc'] as const,
};

export const SORT_BY_KEY_VALUES_DICT = {
  title: 'events.title',
  'event-date': 'events.event_date',
  organizer: 'events.organizer',
};
