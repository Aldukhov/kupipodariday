import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, FindOptionsWhere } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);

    return await this.userRepository.save(user);
  }

  async findAll(query?: FindOptionsWhere<User>): Promise<User[]> {
    return this.userRepository.find({ where: query });
  }

  async findOne(query: FindOptionsWhere<User>): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: query });
  }

  async findMany(search: string): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.username LIKE :search', { search: `%${search}%` })
      .orWhere('user.email LIKE :search', { search: `%${search}%` })
      .getMany();
  }

  async update(
    query: FindOptionsWhere<User>,
    updateUserDto: UpdateUserDto,
  ): Promise<User | undefined> {
    await this.userRepository.update(query, updateUserDto);
    return await this.userRepository.findOne({ where: query });
  }

  async remove(query: FindOptionsWhere<User>): Promise<void> {
    await this.userRepository.delete(query);
  }
}
