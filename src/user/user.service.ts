import { Injectable } from '@nestjs/common';
import { type UserModel } from '../../generated/prisma/models/User';
import { type UpdateUserPayload } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /** Creates and returns a user database record. */
  async createUser(user: {
    username: string;
    email: string;
    password: string;
  }): Promise<UserModel> {
    return this.prisma.user.create({
      data: user,
    });
  }

  /** Finds a user by email or returns null when none exists. */
  async findByEmail(email: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  /** Finds a user by username or returns null when none exists. */
  async findByUsername(username: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  /** Finds a user by database identifier or returns null when none exists. */
  async findById(id: number): Promise<UserModel | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  /** Updates the supplied fields of a user and returns the resulting record. */
  async updateUser(
    id: number,
    user: UpdateUserPayload,
  ): Promise<UserModel> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: user,
    });
  }
}
