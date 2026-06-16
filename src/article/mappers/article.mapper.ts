import { type ArticleResponsePayload } from '../dto/article-response.dto';

type ArticleWithTags = {
  slug: string;
  title: string;
  description: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  tags: { name: string }[];
  author: {
    username: string;
    bio: string;
    image: string;
  };
  _count?: {
    favoritedBy: number;
  };
  favoritedBy?: { id: number }[];
};

/** Converts a Prisma article result into the public article response payload. */
export function toArticlePayload(
  article: ArticleWithTags,
): ArticleResponsePayload {
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: article.tags.map(tag => tag.name),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    favorited: (article.favoritedBy?.length ?? 0) > 0,
    favoritesCount: article._count?.favoritedBy ?? 0,
    author: {
      username: article.author.username,
      bio: article.author.bio,
      image: article.author.image,
      following: false,
    },
  };
}
