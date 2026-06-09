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
};

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
    favorited: false,
    favoritesCount: 0,
    author: {
      username: article.author.username,
      bio: article.author.bio,
      image: article.author.image,
      following: false,
    },
  };
}
