import type { CreateUserDto } from '../dto/create-user.dto';
import type { UpdateUserDto } from '../dto/update-user.dto';
import type { UserEntity } from '../entities/user.entity';

export interface IUserService {
  create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<UserEntity, 'passwordHash'>>;
  findAll(): Promise<Array<Omit<UserEntity, 'passwordHash'>>>;
  findOne(id: string): Promise<Omit<UserEntity, 'passwordHash'>>;
  update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<UserEntity, 'passwordHash'>>;
}
