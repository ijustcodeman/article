import * as z from 'zod';

export const UpdateUserPayloadSchema = z
  .object({
    email: z.email().optional(),
    password: z.string().min(8).optional(),
    username: z.string().min(1).optional(),
    bio: z.string().optional(),
    image: z.string().optional(),
  })
  .refine(user => Object.values(user).some(value => value !== undefined), {
    message: 'At least one user field is required',
  });

export const UpdateUserDtoSchema = z.object({
  user: UpdateUserPayloadSchema,
});

export type UpdateUserPayload = z.infer<typeof UpdateUserPayloadSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>;
