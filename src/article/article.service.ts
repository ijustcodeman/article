import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { type CreateArticleDto } from './dto/create-article.dto';
import {
  type ArticleResponse,
  type ArticlesResponse,
} from './dto/article-response.dto';
import { toArticlePayload } from './mappers/article.mapper';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}


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

        include: {
          tags: true,
          author: true,
        },
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

  // returns all articles
  async findAll(): Promise<ArticlesResponse> {
    const articles = await this.prisma.article.findMany({
      include: {
        tags: true,
        author: true,
      },
    });

    return {
      articles: articles.map(toArticlePayload),
      articlesCount: articles.length,
    };
  }

  async findArticleBySlug(slug: string): Promise<ArticleResponse> {
    const article = await this.prisma.article.findUnique({
      where: {
        slug,
      },

      include: {
        tags: true,
        author: true,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return {
      article: toArticlePayload(article),
    };
  }
}
