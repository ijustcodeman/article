import * as z from 'zod';
import { ProfileResponsePayloadSchema } from '../../profile/dto/profile-response.dto';

export const CommentResponsePayloadSchema = z.object({
  id: z.number().int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  body: z.string(),
  author: ProfileResponsePayloadSchema,
});

export const CommentResponseSchema = z.object({
  comment: CommentResponsePayloadSchema,
});

export const CommentsResponseSchema = z.object({
  comments: z.array(CommentResponsePayloadSchema),
});

export type CommentResponsePayload = z.infer<
  typeof CommentResponsePayloadSchema
>;
export type CommentResponse = z.infer<typeof CommentResponseSchema>;
export type CommentsResponse = z.infer<typeof CommentsResponseSchema>;
