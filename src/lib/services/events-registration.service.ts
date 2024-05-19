import { db } from '../database/db';

export const eventsRegistrationService = {
  selectRegistrationsCount: async () => {
    try {
      return await db.query(
        `
          SELECT COUNT(*)
          FROM event_registration;
        `
      );
    } catch (error) {
      console.log(error);
    }
  },
  hasRegistration: async (email: string, eventId: number) => {
    try {
      const queryResult = await db.query(
        `
          SELECT COUNT(*)
            FROM participants
            JOIN event_registration
              ON participants.id = event_registration.participant_id
            JOIN events
              ON events.id = event_registration.event_id
            WHERE participants.email = $1
            AND events.id = $2;
        `,
        [email, eventId]
      );

      const hasRecord = (await queryResult.rows[0]?.count) > 0;

      return hasRecord;
    } catch (error) {
      console.log(error);
    }
  },
  register: async (eventId: number, participantId: number) => {
    try {
      const queryResult = await db.query<{
        event_id: number;
        participant_id: number;
      }>(
        `
          INSERT INTO event_registration (event_id, participant_id)
          VALUES ($1, $2)
          RETURNING *;
        `,
        [eventId, participantId]
      );

      const registration = queryResult.rows[0] ?? {};

      return registration;
    } catch (err) {
      console.log(err);
    }
  },
  getRegistrationsPerDay: async (id: number) => {
    try {
      const records = await db.query(
        `
          SELECT 
            DATE(event_registration.registered_at) AS date,
            COUNT(event_registration.participant_id)
          FROM event_registration
          WHERE event_registration.event_id = $1
          GROUP BY 
            DATE(event_registration.registered_at)
          ORDER BY date;
        `,
        [id]
      );

      const registrationStats = records.rows;

      return registrationStats;
    } catch (error) {
      console.log(error);
    }
  },
};
