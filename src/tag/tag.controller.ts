import { Controller, Get } from '@nestjs/common';
import { type TagsResponse } from './dto/tags-response.dto';
import { TagService } from './tag.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  /** Returns all tags available in the application. */
  @Get()
  findAll(): Promise<TagsResponse> {
    return this.tagService.findAll();
  }
}
