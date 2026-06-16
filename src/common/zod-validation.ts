import { BadRequestException } from '@nestjs/common';
import { type ZodType, ZodError } from 'zod';

/** Parses an unknown value with a Zod schema and converts validation issues into a bad request response. */
export function parseWithSchema<T>(schema: ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(
        error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      );
    }

    throw error;
  }
}
