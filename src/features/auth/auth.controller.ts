import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @ApiOperation({ summary: 'Signup and receive access token' })
  @ApiOkResponse({
    schema: {
      example: {
        accessToken: '<jwt-token>',
      },
    },
  })
  public signup(
    @Body() signupDto: SignupDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login and receive access token' })
  @ApiOkResponse({
    schema: {
      example: {
        accessToken: 'mocked-jwt-token',
      },
    },
  })
  public login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(loginDto);
  }
}
