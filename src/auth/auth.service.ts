import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client';
import { type AuthResponse } from './dto/auth-response.dto';
import { type LoginUserDto } from './dto/login-user.dto';
import { type RegisterUserDto } from './dto/register-user.dto';
import { type UpdateUserDto } from '../user/dto/update-user.dto';
import { specError } from '../common/spec-error';
import { UserService } from '../user/user.service';
import { toUserResponsePayload } from '../user/mappers/user.mapper';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /** Registers a unique user, hashes the password, and returns the user with a JWT. */
  async register(registerUserDto: RegisterUserDto): Promise<AuthResponse> {
    const existingEmail = await this.userService.findByEmail(
      registerUserDto.user.email,
    );

    if (existingEmail) {
      throw specError('Email already exists');
    }

    const existingUsername = await this.userService.findByUsername(
      registerUserDto.user.username,
    );

    if (existingUsername) {
      throw specError('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.user.password, 10);

    const user = await this.createUserWithSpecErrors({
      username: registerUserDto.user.username,
      email: registerUserDto.user.email,
      password: hashedPassword,
    });

    const token = await this.signToken(user.id);

    return {
      user: toUserResponsePayload({
        ...user,
        token,
      }),
    };
  }

  /** Authenticates a user's credentials and returns the user with a new JWT. */
  async login(loginUserDto: LoginUserDto): Promise<AuthResponse> {
    const user = await this.userService.findByEmail(loginUserDto.user.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      loginUserDto.user.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.signToken(user.id);

    return {
      user: toUserResponsePayload({
        ...user,
        token,
      }),
    };
  }

  /** Returns the authenticated user's current data with a refreshed JWT. */
  async getCurrentUser(userId: number): Promise<AuthResponse> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      user: toUserResponsePayload({
        ...user,
        token: await this.signToken(user.id),
      }),
    };
  }

  /** Validates uniqueness and updates the authenticated user's supplied fields. */
  async updateCurrentUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<AuthResponse> {
    const { email, username, password } = updateUserDto.user;

    if (email) {
      const existingEmail = await this.userService.findByEmail(email);

      if (existingEmail && existingEmail.id !== userId) {
        throw specError('Email already exists');
      }
    }

    if (username) {
      const existingUsername = await this.userService.findByUsername(username);

      if (existingUsername && existingUsername.id !== userId) {
        throw specError('Username already exists');
      }
    }

    const user = await this.updateUserWithSpecErrors(userId, {
      ...updateUserDto.user,
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    });

    return {
      user: toUserResponsePayload({
        ...user,
        token: await this.signToken(user.id),
      }),
    };
  }

  /** Signs a JWT containing the user's database identifier. */
  private async signToken(userId: number): Promise<string> {
    return this.jwtService.signAsync({
      sub: userId,
    });
  }

  /** Creates a user and converts database uniqueness errors into the error response. */
  private async createUserWithSpecErrors(user: {
    username: string;
    email: string;
    password: string;
  }) {
    try {
      return await this.userService.createUser(user);
    } catch (error) {
      this.throwSpecErrorForUniqueUserFields(error);
    }
  }

  /** Updates a user and converts database uniqueness errors into the error response. */
  private async updateUserWithSpecErrors(
    userId: number,
    updateUserDto: UpdateUserDto['user'],
  ) {
    try {
      return await this.userService.updateUser(userId, updateUserDto);
    } catch (error) {
      this.throwSpecErrorForUniqueUserFields(error);
    }
  }

  /** Converts Prisma unique constraint errors for users into the error response. */
  private throwSpecErrorForUniqueUserFields(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw specError('Email or username already exists');
    }

    throw error;
  }
}
