import * as z from 'zod';

export const CreateCommentPayloadSchema = z.object({
  body: z.string().min(1),
});

export const CreateCommentDtoSchema = z.object({
  comment: CreateCommentPayloadSchema,
});

export type CreateCommentPayload = z.infer<typeof CreateCommentPayloadSchema>;
export type CreateCommentDto = z.infer<typeof CreateCommentDtoSchema>;
