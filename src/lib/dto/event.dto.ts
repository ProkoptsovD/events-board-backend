import { KeysToCamelCase } from '../types';

export type Venue = {
  city: string;
  name: string;
  country: string;
  address: string | null;
  state: string;
  id: number;
};

export type EventDatabaseDTO = {
  id: number;
  title: string;
  description: string;
  event_date: string;
  organizer: string;
  venue: Venue;
  cost: number;
  image: string | null;
};

export type EventPreviewDatabaseDTO = EventDatabaseDTO & {
  participants_count: number;
};
export type VenueDatabaseDTO = Venue;

export type EventDTO = Omit<EventDatabaseDTO, 'event_date'> & {
  startingAt: EventDatabaseDTO['event_date'];
};
export type EventPreviewDTO = EventDTO & {
  participantsCount: EventPreviewDatabaseDTO['participants_count'];
};

export type SeatGeekRawEvent = {
  id: number;
  stats: {
    average_price: number | null;
  };
  title: string;
  description: string;
  datetime_local: Date | string;
  organizer: string;
  venue?: Venue;
  performers: { image: string }[];
};

export type ParticipantDatabaseDTO = {
  id: number;
  name: string;
  email: string;
  birth_date: Date;
  event_channel: string;
};

export type CreateParticipantDatabaseDTO = Omit<ParticipantDatabaseDTO, 'id'>;
export type ParticipantDTO = KeysToCamelCase<ParticipantDatabaseDTO>;
export type CreateParticipantDTO = Omit<ParticipantDTO, 'id'>;
