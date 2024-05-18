import { faker } from '@faker-js/faker';
import {
  SeatGeekRawEvent,
  EventDTO,
  Venue,
  EventDatabaseDTO,
} from './event.dto';
import { normalizeKeys } from '../helpers/shared';

export const toEventDatabaseDTO = (
  sourceEvent: SeatGeekRawEvent
): EventDatabaseDTO => {
  const venue: Venue = {
    city: sourceEvent.venue?.city || '',
    name: sourceEvent.venue?.name || '',
    country: sourceEvent.venue?.country || '',
    address: sourceEvent.venue?.address || null,
    state: sourceEvent.venue?.state || '',
    id: sourceEvent.venue?.id || 0,
  };

  const eventDTO: EventDatabaseDTO = {
    id: sourceEvent.id,
    title: sourceEvent.title,
    description:
      sourceEvent.description ||
      faker.lorem.paragraph(Math.floor(Math.random() * 20) + 1),
    event_date: new Date(sourceEvent.datetime_local)
      .toISOString()
      .substring(0, 10),
    organizer: faker.company.name(),
    venue: venue,
    cost: sourceEvent.stats?.average_price ?? 0,
    image: sourceEvent.performers?.[0]?.image || null,
  };

  return eventDTO;
};

export const toEventDTO = (sourceEvent: EventDatabaseDTO): EventDTO => {
  const { event_date: starting_at, ...eventDTO } = sourceEvent;

  return normalizeKeys({ ...eventDTO, starting_at });
};
export const toEventPreviewDTO = (sourceEvent: EventDatabaseDTO): EventDTO => {
  const { event_date: starting_at, ...eventDTO } = sourceEvent;

  return normalizeKeys({ ...eventDTO, starting_at });
};
