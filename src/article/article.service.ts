import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async create(createArticleDto: CreateArticleDto){
    const article = createArticleDto.article;
    const createdArticle = await this.prisma.article.create({
      data: {
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
        title: createdArticle.title,
        description: createdArticle.description,
        body: createdArticle.body,
        tagList: createdArticle.tags.map(t => t.name),
      },
    };
  }

}
