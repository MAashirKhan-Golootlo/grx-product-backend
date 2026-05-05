import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { IUserService } from './interfaces/user-service.interface';

@Injectable()
export class UserService implements IUserService {
  private readonly users: UserEntity[] = [];

  public create(createUserDto: CreateUserDto): UserEntity {
    const user: UserEntity = {
      id: randomUUID(),
      email: createUserDto.email,
      fullName: createUserDto.fullName,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  public findAll(): UserEntity[] {
    return this.users;
  }

  public findOne(id: string): UserEntity {
    const user = this.users.find((storedUser) => storedUser.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  public update(id: string, updateUserDto: UpdateUserDto): UserEntity {
    const user = this.findOne(id);
    const updatedUser = { ...user, ...updateUserDto };
    const userIndex = this.users.findIndex(
      (storedUser) => storedUser.id === id,
    );
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }
}
