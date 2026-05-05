import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { AuthAccountEntity } from './entities/auth-account.entity';

@Injectable()
export class AuthService {
  public constructor(
    @InjectRepository(AuthAccountEntity)
    private readonly authAccountRepository: Repository<AuthAccountEntity>,
    private readonly jwtService: JwtService,
  ) {}

  public async signup(signupDto: SignupDto): Promise<{ accessToken: string }> {
    const existingAccount = await this.authAccountRepository.findOneBy({
      email: signupDto.email,
    });
    if (existingAccount) {
      throw new ConflictException('Email is already registered');
    }

    const account = this.authAccountRepository.create({
      email: signupDto.email,
      fullName: signupDto.fullName,
      passwordHash: await bcrypt.hash(signupDto.password, 10),
    });
    const savedAccount = await this.authAccountRepository.save(account);
    return this.generateToken(savedAccount.id, savedAccount.email);
  }

  public async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const account = await this.authAccountRepository.findOneBy({
      email: loginDto.email,
    });
    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      account.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(account.id, account.email);
  }

  private generateToken(
    userId: string,
    email: string,
  ): { accessToken: string } {
    return {
      accessToken: this.jwtService.sign({ sub: userId, email }),
    };
  }
}
