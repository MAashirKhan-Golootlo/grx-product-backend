import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { IUserService } from './interfaces/user-service.interface';

@Injectable()
export class UserService implements IUserService {
  public constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<UserEntity, 'passwordHash'>> {
    const existingUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const user = this.userRepository.create({
      email: createUserDto.email,
      fullName: createUserDto.fullName,
      passwordHash: await bcrypt.hash(createUserDto.password, 10),
    });
    const savedUser = await this.userRepository.save(user);
    return this.withoutPassword(savedUser);
  }

  public async findAll(): Promise<Omit<UserEntity, 'passwordHash'>[]> {
    const users = await this.userRepository.find();
    return users.map((user) => this.withoutPassword(user));
  }

  public async findOne(id: string): Promise<Omit<UserEntity, 'passwordHash'>> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.withoutPassword(user);
  }

  public async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<UserEntity, 'passwordHash'>> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updatedUser = this.userRepository.merge(user, updateUserDto);
    const savedUser = await this.userRepository.save(updatedUser);
    return this.withoutPassword(savedUser);
  }

  public async findOneByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ email });
  }

  private withoutPassword(user: UserEntity): Omit<UserEntity, 'passwordHash'> {
    const { passwordHash, ...safeUser } = user;
    void passwordHash;
    return safeUser;
  }
}
