import * as z from 'zod';

export const RegisterUserPayloadSchema = z.object({
  username: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
});

export const RegisterUserDtoSchema = z.object({
  user: RegisterUserPayloadSchema,
});

export type RegisterUserPayload = z.infer<typeof RegisterUserPayloadSchema>;
export type RegisterUserDto = z.infer<typeof RegisterUserDtoSchema>;
