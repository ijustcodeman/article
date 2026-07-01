import { type ZodType, ZodError } from 'zod';
import { specError } from './spec-error';

/** Parses an unknown value with a Zod schema and converts validation issues into the error response. */
export function parseWithSchema<T>(schema: ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw specError(
        error.issues.map(issue => {
          const path = issue.path.join('.');

          return path ? `${path}: ${issue.message}` : issue.message;
        }),
      );
    }

    throw error;
  }
}
