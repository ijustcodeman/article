import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { type ProfileResponse } from './dto/profile-response.dto';
import { toProfilePayload } from './mappers/profile.mapper';
import { specError } from '../common/spec-error';
import { PrismaService } from '../prisma/prisma.service';

/** Builds the Prisma relation needed to return whether the current user follows a profile. */
function profileInclude(currentUserId?: number): Prisma.UserInclude {
  return {
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
  };
}

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  /** Returns a user's public profile with the current user's following state. */
  async findByUsername(
    username: string,
    currentUserId?: number,
  ): Promise<ProfileResponse> {
    const profile = await this.prisma.user.findUnique({
      where: {
        username,
      },
      include: profileInclude(currentUserId),
    });

    if (!profile) {
      throw specError('Profile not found');
    }

    return {
      profile: toProfilePayload(profile),
    };
  }

  /** Makes the authenticated user follow the selected profile and returns that profile. */
  async follow(username: string, currentUserId: number): Promise<ProfileResponse> {
    return this.updateFollow(username, currentUserId, 'connect');
  }

  /** Makes the authenticated user unfollow the selected profile and returns that profile. */
  async unfollow(
    username: string,
    currentUserId: number,
  ): Promise<ProfileResponse> {
    return this.updateFollow(username, currentUserId, 'disconnect');
  }

  /** Updates the follow relation between the authenticated user and the selected profile. */
  private async updateFollow(
    username: string,
    currentUserId: number,
    action: 'connect' | 'disconnect',
  ): Promise<ProfileResponse> {
    const profile = await this.prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });

    if (!profile) {
      throw specError('Profile not found');
    }

    if (profile.id === currentUserId) {
      throw specError('You cannot follow yourself');
    }

    await this.prisma.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        following: {
          [action]: {
            id: profile.id,
          },
        },
      },
    });

    return this.findByUsername(username, currentUserId);
  }
}
