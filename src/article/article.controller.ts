import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { type Request } from 'express';
import { type UserModel } from '../../generated/prisma/models/User';
import { ArticleService } from './article.service';
import { type ArticleResponse } from './dto/article-response.dto';
import { CreateArticleDtoSchema } from './dto/create-article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { parseWithSchema } from '../common/zod-validation';

type AuthenticatedRequest = Request & {
  user: UserModel;
};

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createArticle(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<ArticleResponse> {
    const createArticleDto = parseWithSchema(CreateArticleDtoSchema, body);

    return this.articleService.create(createArticleDto, request.user.id);
  }

  @Get()
  getAllArticles() {
    return this.articleService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articleService.findArticleBySlug(slug);
  }
}
