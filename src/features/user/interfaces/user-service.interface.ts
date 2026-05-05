import type { CreateUserDto } from '../dto/create-user.dto';
import type { UpdateUserDto } from '../dto/update-user.dto';
import type { UserEntity } from '../entities/user.entity';

export interface IUserService {
  create(createUserDto: CreateUserDto): UserEntity;
  findAll(): UserEntity[];
  findOne(id: string): UserEntity;
  update(id: string, updateUserDto: UpdateUserDto): UserEntity;
}
