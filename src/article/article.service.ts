import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  async create(createArticleDto: CreateArticleDto){
    const article = createArticleDto.article;

    const slug = slugify(article.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const createdArticle = await this.prisma.article.create({
      data: {
        slug,
        title: article.title,
        description: article.description,
        body: article.body,

        tags: {
          connectOrCreate: article.tagList?.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },

      include: {
        tags: true,
      },
    });

    return {
      article: {
        slug: createdArticle.slug,
        title: createdArticle.title,
        description: createdArticle.description,
        body: createdArticle.body,
        tagList: createdArticle.tags.map(t => t.name),
      },
    };
  }

  async findAll() {
  const articles = await this.prisma.article.findMany({
    include: {
      tags: true,
    },
  });

  if (!articles){
    throw new NotFoundException('No articles found');
  }

  return {
    articles: articles.map(article => ({
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tags.map(t => t.name),
    })),
  };
  }

  /* We wanna find an article by a slug.
    The slug has to be created with the 
    articles title. This means that we need
    to generate a slug while creating an article,
    save it in the local database and then use it
    to get an article with the corresponding slug.

    TODO: 
    - add slug to article schema (done)
    - modify the create article method (done)
    - modify findArticleBySlug() method (done)
    - integrate into controller (done)
  */
  async findArticleBySlug(slug: string){
    const article = await this.prisma.article.findUnique({
      where: {
        slug,
      },

      include: {
        tags: true,
      },
    });

    if (!article){
      throw new NotFoundException('Article not found');
    }

    return {
      article: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tags.map(t => t.name),
      },
    };
  }



}
