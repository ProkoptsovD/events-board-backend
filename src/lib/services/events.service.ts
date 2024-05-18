import { DEFAULT_PER_PAGE, SORT_BY_KEY_VALUES_DICT } from '../const';
import { db } from '../database/db';
import {
  EventPreviewDatabaseDTO,
  ParticipantDatabaseDTO,
  VenueDatabaseDTO,
} from '../dto/event.dto';
import { EventsSearchParams } from '../validation/event.schema';

type PartialParticipant = Omit<
  ParticipantDatabaseDTO,
  'birth_date' | 'event_chanel'
>;

export const eventsService = {
  selectAllEvents: async ({
    page = 1,
    perPage = DEFAULT_PER_PAGE,
    sortBy,
    q,
  }: EventsSearchParams): Promise<EventPreviewDatabaseDTO[] | null> => {
    const offset = (Number(page) - 1) * Number(perPage);
    const sortByKey = SORT_BY_KEY_VALUES_DICT[sortBy];

    let searchQuery = '';

    if (q) {
      searchQuery = `WHERE events.title iLIKE '%${q}%' OR events.description iLIKE '%${q}%'`;
    }

    try {
      const queryResult = await db.query<EventPreviewDatabaseDTO>(
        `
        SELECT events.*,
        CAST(COUNT(event_registration.participant_id) AS INTEGER) AS participants_count
        FROM events
        LEFT JOIN event_registration ON events.id = event_registration.event_id
        ${searchQuery}
        GROUP BY events.id
        ORDER BY ${sortByKey}
        LIMIT $1 OFFSET $2;
      `,
        [perPage, offset]
      );

      const events = queryResult.rows;

      return events;
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  selectEventsCount: async (): Promise<number | null> => {
    try {
      const queryResult = await db.query(`
        SELECT COUNT(*)
        FROM events;
      `);

      return (await queryResult.rows[0]?.count) ?? 0;
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  selectParticipants: async (
    id: number
  ): Promise<PartialParticipant[] | null> => {
    try {
      const queryResult = await db.query<PartialParticipant>(
        `
        SELECT participants.id, participants.name, participants.email
          FROM participants
          JOIN event_registration ON participants.id = event_registration.participant_id
          WHERE event_registration.event_id = $1;
      `,
        [id]
      );

      const participants = queryResult.rows;

      return participants;
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  selectEventVenue: async (id: number): Promise<VenueDatabaseDTO | null> => {
    try {
      const queryResult = await db.query<VenueDatabaseDTO>(
        `
          SELECT venues.id, venues.name, venues.city, venues.state, venues.country, venues.address
            FROM venues
            JOIN events
            ON venues.id = events.venue_id
            WHERE events.id = $1;
      `,
        [id]
      );

      const venues = queryResult.rows[0];

      return venues;
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  selectEventById: async (id: number) => {
    const eventQueryResult = db.query(
      `
      SELECT events.id, events.title, events.description, events.event_date, events.organizer, events.cost, events.image
        FROM events
        WHERE id = $1
    `,
      [id]
    );
    const eventVenueQueryResult = eventsService.selectEventVenue(id);

    const result = await Promise.all([eventQueryResult, eventVenueQueryResult]);

    const event = await result[0].rows[0];

    if (!event) return null;

    const venue = result[1] ?? {};

    return { ...event, venue };
  },
  hasEventRecord: async (id: number) => {
    try {
      const eventQueryResult = await db.query(
        `
          SELECT events.id
          FROM events
          WHERE events.id = $1
      `,
        [id]
      );

      const hasRecord = eventQueryResult.rows.length > 0;

      return hasRecord;
    } catch (error) {
      console.log(error);
    }
  },
};
