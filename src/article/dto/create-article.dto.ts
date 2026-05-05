// id is not needed, since prisma generates it automatically
export type ArticlePayload = {
    title: string;
    description: string;
    body: string;
    tagList: string[];
};

export type CreateArticleDto = {
    article: ArticlePayload;
};