import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and receive access token' })
  @ApiOkResponse({
    schema: {
      example: {
        accessToken: 'mocked-jwt-token',
      },
    },
  })
  public login(@Body() loginDto: LoginDto): { accessToken: string } {
    return this.authService.login(loginDto);
  }
}
