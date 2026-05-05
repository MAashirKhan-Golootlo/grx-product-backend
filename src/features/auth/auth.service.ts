import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  public login(loginDto: LoginDto): { accessToken: string } {
    if (!loginDto.email.endsWith('@example.com')) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: 'mocked-jwt-token',
    };
  }
}
