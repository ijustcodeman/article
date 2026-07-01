import { UnprocessableEntityException } from '@nestjs/common';

type SpecErrorResponse = {
  errors: {
    body: string[];
  };
};

/** Creates the error response shape. */
export function specError(message: string | string[]): UnprocessableEntityException {
  const messages = Array.isArray(message) ? message : [message];

  return new UnprocessableEntityException({
    errors: {
      body: messages,
    },
  } satisfies SpecErrorResponse);
}
