import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type AuthResponse } from './dto/auth-response.dto';
import { LoginUserDtoSchema } from './dto/login-user.dto';
import { RegisterUserDtoSchema } from './dto/register-user.dto';
import { parseWithSchema } from '../common/zod-validation';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Validates a registration request and creates a new user account. */
  @Post()
  register(@Body() body: unknown): Promise<AuthResponse> {
    const registerUserDto = parseWithSchema(RegisterUserDtoSchema, body);

    return this.authService.register(registerUserDto);
  }

  /** Validates login credentials and returns the authenticated user. */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: unknown): Promise<AuthResponse> {
    const loginUserDto = parseWithSchema(LoginUserDtoSchema, body);

    return this.authService.login(loginUserDto);
  }
}
