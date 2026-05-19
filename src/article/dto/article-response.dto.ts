import { ArticlePayload } from './create-article.dto';

// Article shape extended with slug
export type ArticleResponsePayload = ArticlePayload & {
    slug: string;
};

// Response for a single article
export type ArticleResponse = {
    article: ArticleResponsePayload;
};

// Response for many articles
export type ArticlesResponse = {
  articles: ArticleResponsePayload[];
};
