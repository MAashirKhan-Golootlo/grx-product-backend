import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  public constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  public async signup(signupDto: SignupDto): Promise<{ accessToken: string }> {
    const existingUser = await this.userRepository.findOneBy({
      email: signupDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const user = this.userRepository.create({
      email: signupDto.email,
      fullName: signupDto.fullName,
      passwordHash: await bcrypt.hash(signupDto.password, 10),
    });
    const savedUser = await this.userRepository.save(user);
    return this.generateToken(savedUser.id, savedUser.email);
  }

  public async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOneBy({
      email: loginDto.email,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user.id, user.email);
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
