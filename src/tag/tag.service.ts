import { Injectable } from '@nestjs/common';
import { type TagsResponse } from './dto/tags-response.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  /** Returns all tag names in alphabetical order. */
  async findAll(): Promise<TagsResponse> {
    const tags = await this.prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        name: true,
      },
    });

    return {
      tags: tags.map(tag => tag.name),
    };
  }
}
