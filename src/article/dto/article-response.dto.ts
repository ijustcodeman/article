import * as z from 'zod';
import { ArticlePayloadSchema } from './create-article.dto';

export const ArticleAuthorSchema = z.object({
  username: z.string(),
  bio: z.string(),
  image: z.string(),
  following: z.boolean(),
});

export const ArticleResponsePayloadSchema = ArticlePayloadSchema.extend({
  slug: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  favorited: z.boolean(),
  favoritesCount: z.number().int().nonnegative(),
  author: ArticleAuthorSchema,
});

export const ArticleResponseSchema = z.object({
  article: ArticleResponsePayloadSchema,
});

export const ArticlesResponseSchema = z.object({
  articles: z.array(ArticleResponsePayloadSchema),
  articlesCount: z.number().int().nonnegative(),
});

export type ArticleAuthor = z.infer<typeof ArticleAuthorSchema>;
export type ArticleResponsePayload = z.infer<
  typeof ArticleResponsePayloadSchema
>;
export type ArticleResponse = z.infer<typeof ArticleResponseSchema>;
export type ArticlesResponse = z.infer<typeof ArticlesResponseSchema>;
