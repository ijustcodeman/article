import { type CommentResponsePayload } from '../dto/comment-response.dto';

type CommentWithAuthor = {
  id: number;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    username: string;
    bio: string;
    image: string;
    followers?: { id: number }[];
  };
};

/** Converts a Prisma comment result into the public comment response payload. */
export function toCommentPayload(
  comment: CommentWithAuthor,
): CommentResponsePayload {
  return {
    id: comment.id,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    body: comment.body,
    author: {
      username: comment.author.username,
      bio: comment.author.bio,
      image: comment.author.image,
      following: (comment.author.followers?.length ?? 0) > 0,
    },
  };
}
