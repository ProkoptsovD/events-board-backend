import { z } from 'zod';
import { EVENTS_ALLOWED_VALUES } from '../const';

export const EventSearchParamsSchema = z.object({
  q: z.string().nullable().optional(),
  page: z.coerce.number().int().catch(1),
  perPage: z
    .enum(EVENTS_ALLOWED_VALUES.perPage)
    .catch(EVENTS_ALLOWED_VALUES.perPage[1]),
  sortBy: z
    .enum(EVENTS_ALLOWED_VALUES.sortBy)
    .catch(EVENTS_ALLOWED_VALUES.sortBy[0]),
});

export const EventIdSchema = z.object({
  id: z.coerce.number().int(),
});

export const CreateParticipantSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  birthDate: z.coerce.date(),
  eventChannel: z.enum(EVENTS_ALLOWED_VALUES.eventChanel),
});

export const RegisterToEventSchema = z.object({
  eventId: z.number(),
  participant: CreateParticipantSchema,
});

export type EventsSearchParams = z.infer<typeof EventSearchParamsSchema>;
