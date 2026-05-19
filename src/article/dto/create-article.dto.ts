// Payload used when creating an article
export type ArticlePayload = {
    title: string;
    description: string;
    body: string;
    tagList: string[];
};

// Request body shape for POST /articles
export type CreateArticleDto = {
    article: ArticlePayload;
};