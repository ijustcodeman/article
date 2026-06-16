import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { type Request } from 'express';
import { type UserModel } from '../../generated/prisma/models/User';
import { AuthService } from './auth.service';
import { type AuthResponse } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdateUserDtoSchema } from '../user/dto/update-user.dto';
import { parseWithSchema } from '../common/zod-validation';

type AuthenticatedRequest = Request & {
  user: UserModel;
};

@Controller('user')
@UseGuards(JwtAuthGuard)
export class CurrentUserController {
  constructor(private readonly authService: AuthService) {}

  /** Returns the currently authenticated user's data. */
  @Get()
  getCurrentUser(
    @Req() request: AuthenticatedRequest,
  ): Promise<AuthResponse> {
    return this.authService.getCurrentUser(request.user.id);
  }

  /** Validates and applies updates to the currently authenticated user. */
  @Put()
  updateCurrentUser(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<AuthResponse> {
    const updateUserDto = parseWithSchema(UpdateUserDtoSchema, body);

    return this.authService.updateCurrentUser(
      request.user.id,
      updateUserDto,
    );
  }
}
