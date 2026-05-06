import { Controller, Get, Post, Body } from '@nestjs/common';
import { ArticleService } from './article.service';
import { type CreateArticleDto } from './dto/create-article.dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  createArticle(@Body() createArticleDto: CreateArticleDto){
    return this.articleService.create(createArticleDto);
  }

  @Get()
  getAllArticles(){
    return this.articleService.findAll();
  }
}
