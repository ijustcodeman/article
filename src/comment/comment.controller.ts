import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { type Request } from 'express';
import { type UserModel } from '../../generated/prisma/models/User';
import {
  type CommentResponse,
  type CommentsResponse,
} from './dto/comment-response.dto';
import { CreateCommentDtoSchema } from './dto/create-comment.dto';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { parseWithSchema } from '../common/zod-validation';
import * as z from 'zod';

const CommentIdParamSchema = z.coerce.number().int().positive();

type AuthenticatedRequest = Request & {
  user: UserModel;
};

type OptionalAuthenticatedRequest = Request & {
  user?: UserModel;
};

@Controller('articles/:slug/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /** Returns all comments for the selected article. */
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findForArticle(
    @Req() request: OptionalAuthenticatedRequest,
    @Param('slug') slug: string,
  ): Promise<CommentsResponse> {
    return this.commentService.findForArticle(slug, request.user?.id);
  }

  /** Validates and creates a comment for the selected article. */
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  create(
    @Req() request: AuthenticatedRequest,
    @Param('slug') slug: string,
    @Body() body: unknown,
  ): Promise<CommentResponse> {
    const createCommentDto = parseWithSchema(CreateCommentDtoSchema, body);

    return this.commentService.create(slug, createCommentDto, request.user.id);
  }

  /** Deletes a comment owned by the authenticated user. */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  delete(
    @Req() request: AuthenticatedRequest,
    @Param('slug') slug: string,
    @Param('id') id: string,
  ): Promise<void> {
    const commentId = parseWithSchema(CommentIdParamSchema, id);

    return this.commentService.delete(slug, commentId, request.user.id);
  }
}
