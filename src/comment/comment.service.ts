import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import {
  type CommentResponse,
  type CommentsResponse,
} from './dto/comment-response.dto';
import { type CreateCommentDto } from './dto/create-comment.dto';
import { toCommentPayload } from './mappers/comment.mapper';
import { specError } from '../common/spec-error';
import { PrismaService } from '../prisma/prisma.service';

/** Builds the Prisma relations needed to return comment response data for an optional current user. */
function commentInclude(currentUserId?: number): Prisma.CommentInclude {
  return {
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
  };
}

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  /** Returns comments for an article ordered from newest to oldest. */
  async findForArticle(
    slug: string,
    currentUserId?: number,
  ): Promise<CommentsResponse> {
    await this.findArticleIdBySlug(slug);

    const comments = await this.prisma.comment.findMany({
      where: {
        article: {
          slug,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: commentInclude(currentUserId),
    });

    return {
      comments: comments.map(toCommentPayload),
    };
  }

  /** Creates a comment on an article for the authenticated user. */
  async create(
    slug: string,
    createCommentDto: CreateCommentDto,
    userId: number,
  ): Promise<CommentResponse> {
    const articleId = await this.findArticleIdBySlug(slug);

    const comment = await this.prisma.comment.create({
      data: {
        body: createCommentDto.comment.body,
        article: {
          connect: {
            id: articleId,
          },
        },
        author: {
          connect: {
            id: userId,
          },
        },
      },
      include: commentInclude(userId),
    });

    return {
      comment: toCommentPayload(comment),
    };
  }

  /** Deletes a comment owned by the authenticated user. */
  async delete(slug: string, commentId: number, userId: number): Promise<void> {
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        article: {
          slug,
        },
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!comment) {
      throw specError('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw specError('Only the author can delete this comment');
    }

    await this.prisma.comment.delete({
      where: {
        id: comment.id,
      },
    });
  }

  /** Finds an article id by slug and throws an error when it does not exist. */
  private async findArticleIdBySlug(slug: string): Promise<number> {
    const article = await this.prisma.article.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!article) {
      throw specError('Article not found');
    }

    return article.id;
  }
}
