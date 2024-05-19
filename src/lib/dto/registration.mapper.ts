import { normalizeKeys } from './../helpers/shared';
import { RegistrationDatabaseDTO, RegistrationDTO } from './event.dto';

export const toRegistrationDTO = (
  reg: RegistrationDatabaseDTO | undefined
): RegistrationDTO => {
  const entries = Object.entries(normalizeKeys<RegistrationDTO>(reg ?? {}));

  const dto = entries.reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: value,
    };
  }, {} as RegistrationDTO);

  return dto;
};
