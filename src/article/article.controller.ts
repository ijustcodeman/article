import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { type Request } from 'express';
import { type UserModel } from '../../generated/prisma/models/User';
import { ArticleService } from './article.service';
import { type ArticleResponse } from './dto/article-response.dto';
import { CreateArticleDtoSchema } from './dto/create-article.dto';
import { ListArticlesQuerySchema } from './dto/list-articles-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { parseWithSchema } from '../common/zod-validation';

type AuthenticatedRequest = Request & {
  user: UserModel;
};

type OptionalAuthenticatedRequest = Request & {
  user?: UserModel;
};

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  /** Validates and creates an article for the authenticated user. */
  @Post()
  @UseGuards(JwtAuthGuard)
  createArticle(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<ArticleResponse> {
    const createArticleDto = parseWithSchema(CreateArticleDtoSchema, body);

    return this.articleService.create(createArticleDto, request.user.id);
  }

  /** Returns articles matching the validated query filters and optional current user. */
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  getAllArticles(
    @Req() request: OptionalAuthenticatedRequest,
    @Query() query: unknown,
  ) {
    const filters = parseWithSchema(ListArticlesQuerySchema, query);

    return this.articleService.findAll(filters, request.user?.id);
  }

  /** Returns the article identified by the given slug. */
  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  findBySlug(
    @Req() request: OptionalAuthenticatedRequest,
    @Param('slug') slug: string,
  ) {
    return this.articleService.findArticleBySlug(slug, request.user?.id);
  }

  /** Favorites the selected article for the authenticated user. */
  @Post(':slug/favorite')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  favoriteArticle(
    @Req() request: AuthenticatedRequest,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    return this.articleService.favorite(slug, request.user.id);
  }

  /** Unfavorites the selected article for the authenticated user. */
  @Delete(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  unfavoriteArticle(
    @Req() request: AuthenticatedRequest,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    return this.articleService.unfavorite(slug, request.user.id);
  }
}
