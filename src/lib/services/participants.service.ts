import { db } from '../database/db';
import { CreateParticipantDTO, ParticipantDTO } from '../dto/event.dto';
import { participantToDatabaseDTO } from '../dto/participant.mapper';
import { normalizeKeys, prepareSQLInsertionData } from '../helpers/shared';

export const participantsService = {
  selectByEmail: async (
    email: string
  ): Promise<ParticipantDTO | null | undefined> => {
    try {
      const queryResult = await db.query(
        `
          SELECT *
            FROM participants
            WHERE participants.email = $1;
        `,
        [email]
      );

      const hasRecord = queryResult.rows.length > 0;

      if (!hasRecord) return null;

      const participant = await queryResult.rows[0];

      return normalizeKeys<ParticipantDTO>(participant);
    } catch (err) {
      console.log(err);
    }
  },
  createParticipant: async (
    dto: CreateParticipantDTO
  ): Promise<ParticipantDTO | null | undefined> => {
    try {
      const hasRecord = await participantsService.selectByEmail(dto.email);

      if (hasRecord) return null;

      const dbDTO = participantToDatabaseDTO(dto);
      const { keys, values, parameterizedKeys } =
        prepareSQLInsertionData(dbDTO);

      const queryResult = await db.query(
        `
          INSERT INTO participants (${keys.join(', ')})
          VALUES (${parameterizedKeys.join(', ')})
          RETURNING *;
        `,
        values
      );

      const participant = await queryResult.rows[0];

      return normalizeKeys<ParticipantDTO>(participant);
    } catch (error) {
      console.log(error);
    }
  },
};
