import * as z from 'zod';

const IntegerQuerySchema = z
  .string()
  .regex(/^\d+$/, 'Expected a non negative integer')
  .transform(Number);

export const ListArticlesQuerySchema = z.object({
  tag: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  favorited: z.string().min(1).optional(),
  limit: IntegerQuerySchema.pipe(z.number().int().min(1)).default(20),
  offset: IntegerQuerySchema.pipe(z.number().int().min(0)).default(0),
});

export const ArticlePaginationQuerySchema = ListArticlesQuerySchema.pick({
  limit: true,
  offset: true,
});

export type ListArticlesQuery = z.infer<typeof ListArticlesQuerySchema>;
export type ArticlePaginationQuery = z.infer<
  typeof ArticlePaginationQuerySchema
>;
