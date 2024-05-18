import { normalizeKeys } from '../helpers/shared';
import {
  CreateParticipantDatabaseDTO,
  CreateParticipantDTO,
} from './event.dto';

export const participantToDatabaseDTO = (
  participant: CreateParticipantDTO
): CreateParticipantDatabaseDTO => {
  return normalizeKeys(participant, { toCase: 'snake' });
};
