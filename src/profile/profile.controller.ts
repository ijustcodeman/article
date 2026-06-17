import {
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
import { type ProfileResponse } from './dto/profile-response.dto';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

type AuthenticatedRequest = Request & {
  user: UserModel;
};

type OptionalAuthenticatedRequest = Request & {
  user?: UserModel;
};

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /** Returns the selected user's public profile. */
  @Get(':username')
  @UseGuards(OptionalJwtAuthGuard)
  findByUsername(
    @Req() request: OptionalAuthenticatedRequest,
    @Param('username') username: string,
  ): Promise<ProfileResponse> {
    return this.profileService.findByUsername(username, request.user?.id);
  }

  /** Follows the selected user for the authenticated user. */
  @Post(':username/follow')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  follow(
    @Req() request: AuthenticatedRequest,
    @Param('username') username: string,
  ): Promise<ProfileResponse> {
    return this.profileService.follow(username, request.user.id);
  }

  /** Unfollows the selected user for the authenticated user. */
  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  unfollow(
    @Req() request: AuthenticatedRequest,
    @Param('username') username: string,
  ): Promise<ProfileResponse> {
    return this.profileService.unfollow(username, request.user.id);
  }
}
