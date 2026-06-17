import * as z from 'zod';

export const ProfileResponsePayloadSchema = z.object({
  username: z.string(),
  bio: z.string(),
  image: z.string(),
  following: z.boolean(),
});

export const ProfileResponseSchema = z.object({
  profile: ProfileResponsePayloadSchema,
});

export type ProfileResponsePayload = z.infer<
  typeof ProfileResponsePayloadSchema
>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
