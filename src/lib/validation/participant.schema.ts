import { z } from 'zod';
import { EVENTS_ALLOWED_VALUES } from '../const';
import { addYears, differenceInYears, isAfter, isLeapYear } from 'date-fns';

const birthDate = z.coerce
  .date({
    invalid_type_error: 'Must be valid date',
  })
  .refine(
    (date) => {
      const today = new Date();
      const minAgeDate = addYears(today, -18);

      const age = differenceInYears(today, date);
      const isLeapYearBirthday = date.getMonth() === 1 && date.getDate() === 29;

      if (age > 18) {
        return true;
      } else if (age < 18) {
        return false;
      } else {
        if (isLeapYearBirthday) {
          if (
            isLeapYear(today.getFullYear()) &&
            today.getMonth() === 1 &&
            today.getDate() === 29
          ) {
            return true;
          } else if (
            !isLeapYear(today.getFullYear()) &&
            today.getMonth() === 1 &&
            today.getDate() === 28
          ) {
            return true;
          }
          return false;
        }
        return !isAfter(date, minAgeDate);
      }
    },
    {
      message: 'Age must be 18 years or older',
    }
  );

export const CreateParticipantSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 chars long'),
  email: z.string().email(),
  birthDate,
  eventChannel: z.enum(EVENTS_ALLOWED_VALUES.eventChanel),
});
