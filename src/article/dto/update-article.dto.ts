import * as z from 'zod';

export const UpdateArticlePayloadSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    body: z.string().min(1).optional(),
  })
  .refine(article => Object.values(article).some(value => value !== undefined), {
    message: 'At least one article field is required',
  });

export const UpdateArticleDtoSchema = z.object({
  article: UpdateArticlePayloadSchema,
});

export type UpdateArticlePayload = z.infer<typeof UpdateArticlePayloadSchema>;
export type UpdateArticleDto = z.infer<typeof UpdateArticleDtoSchema>;
