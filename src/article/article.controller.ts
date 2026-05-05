import { Controller, Get, Post, Body } from '@nestjs/common';
import { ArticleService } from './article.service';
import { type CreateArticleDto } from './dto/create-article.dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  getHello(): string {
    return this.articleService.getHello();
  }

  @Post()
  create(@Body() createArticleDto: CreateArticleDto){
    return this.articleService.create(createArticleDto);
  }
}
