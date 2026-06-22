import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { type CreateArticleDto } from './dto/create-article.dto';
import {
  type ArticlePaginationQuery,
  type ListArticlesQuery,
} from './dto/list-articles-query.dto';
import { type UpdateArticleDto } from './dto/update-article.dto';
import {
  type ArticleResponse,
  type ArticlesResponse,
} from './dto/article-response.dto';
import { toArticlePayload } from './mappers/article.mapper';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';

/** Builds the Prisma relations needed to return article response data for an optional current user. */
function articleInclude(currentUserId?: number): Prisma.ArticleInclude {
  return {
    tags: true,
    _count: {
      select: {
        favoritedBy: true,
      },
    },
    author: {
      include: {
        ...(currentUserId && {
          followers: {
            where: {
              id: currentUserId,
            },
            select: {
              id: true,
            },
          },
        }),
      },
    },
    ...(currentUserId && {
      favoritedBy: {
        where: {
          id: currentUserId,
        },
        select: {
          id: true,
        },
      },
    }),
  };
}

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  /** Creates an article with its author and tags and returns the API response representation. */
  async create(
    createArticleDto: CreateArticleDto,
    authorId: number,
  ): Promise<ArticleResponse> {
    const article = createArticleDto.article;

    const slug = slugify(article.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    try {
      const createdArticle = await this.prisma.article.create({
        data: {
          slug,
          title: article.title,
          description: article.description,
          body: article.body,
          author: {
            connect: {
              id: authorId,
            },
          },

          tags: {
            connectOrCreate: article.tagList?.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        },

        include: articleInclude(authorId),
      });

      return {
        article: toArticlePayload(createdArticle),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new UnprocessableEntityException(
          'An article with this title already exists',
        );
      }

      throw error;
    }
  }

  /** Returns a filtered and paginated list of articles ordered from newest to oldest. */
  async findAll(
    filters: ListArticlesQuery,
    currentUserId?: number,
  ): Promise<ArticlesResponse> {
    const where: Prisma.ArticleWhereInput = {
      ...(filters.tag && {
        tags: {
          some: {
            name: filters.tag,
          },
        },
      }),
      ...(filters.author && {
        author: {
          username: filters.author,
        },
      }),
      ...(filters.favorited && {
        favoritedBy: {
          some: {
            username: filters.favorited,
          },
        },
      }),
    };

    const [articlesCount, articles] = await this.prisma.$transaction([
      this.prisma.article.count({
        where,
      }),
      this.prisma.article.findMany({
        where,
        skip: filters.offset,
        take: filters.limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: articleInclude(currentUserId),
      }),
    ]);

    return {
      articles: articles.map(toArticlePayload),
      articlesCount,
    };
  }

  /** Returns articles from authors followed by the authenticated user ordered from newest to oldest. */
  async findFeed(
    pagination: ArticlePaginationQuery,
    userId: number,
  ): Promise<ArticlesResponse> {
    const where: Prisma.ArticleWhereInput = {
      author: {
        followers: {
          some: {
            id: userId,
          },
        },
      },
    };

    const [articlesCount, articles] = await this.prisma.$transaction([
      this.prisma.article.count({
        where,
      }),
      this.prisma.article.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: articleInclude(userId),
      }),
    ]);

    return {
      articles: articles.map(toArticlePayload),
      articlesCount,
    };
  }

  /** Finds one article by its slug and throws an error when it does not exist. */
  async findArticleBySlug(
    slug: string,
    currentUserId?: number,
  ): Promise<ArticleResponse> {
    const article = await this.prisma.article.findUnique({
      where: {
        slug,
      },

      include: articleInclude(currentUserId),
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return {
      article: toArticlePayload(article),
    };
  }

  /** Updates an article owned by the authenticated user and returns the updated response representation. */
  async updateArticle(
    slug: string,
    updateArticleDto: UpdateArticleDto,
    userId: number,
  ): Promise<ArticleResponse> {
    const existingArticle = await this.findArticleForOwnerCheck(slug, userId);
    const article = updateArticleDto.article;

    try {
      const updatedArticle = await this.prisma.article.update({
        where: {
          id: existingArticle.id,
        },
        data: {
          ...article,
          ...(article.title && {
            slug: slugify(article.title, {
              lower: true,
              strict: true,
              trim: true,
            }),
          }),
        },
        include: articleInclude(userId),
      });

      return {
        article: toArticlePayload(updatedArticle),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new UnprocessableEntityException(
          'An article with this title already exists',
        );
      }

      throw error;
    }
  }

  /** Deletes an article owned by the authenticated user. */
  async deleteArticle(slug: string, userId: number): Promise<void> {
    const existingArticle = await this.findArticleForOwnerCheck(slug, userId);

    await this.prisma.article.delete({
      where: {
        id: existingArticle.id,
      },
    });
  }

  /** Adds an article to the authenticated user's favorites. */
  async favorite(slug: string, userId: number): Promise<ArticleResponse> {
    return this.updateFavorite(slug, userId, 'connect');
  }

  /** Removes an article from the authenticated user's favorites. */
  async unfavorite(slug: string, userId: number): Promise<ArticleResponse> {
    return this.updateFavorite(slug, userId, 'disconnect');
  }

  /** Updates the favorite relation and returns the article with its current favorite state. */
  private async updateFavorite(
    slug: string,
    userId: number,
    action: 'connect' | 'disconnect',
  ): Promise<ArticleResponse> {
    try {
      const article = await this.prisma.article.update({
        where: {
          slug,
        },
        data: {
          favoritedBy: {
            [action]: {
              id: userId,
            },
          },
        },
        include: articleInclude(userId),
      });

      return {
        article: toArticlePayload(article),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Article not found');
      }

      throw error;
    }
  }

  /** Finds an article and verifies that the authenticated user is its author. */
  private async findArticleForOwnerCheck(
    slug: string,
    userId: number,
  ): Promise<{ id: number; authorId: number }> {
    const article = await this.prisma.article.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('Only the author can modify this article');
    }

    return article;
  }
}
