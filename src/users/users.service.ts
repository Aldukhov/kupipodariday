import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, FindOptionsWhere, Not } from 'typeorm';
import { hashPassword } from 'src/utils/bcrypt.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username } = createUserDto;
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким email или username уже существует',
      );
    }

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
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User | undefined> {
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }

    const { email, username } = updateUserDto;
    if (email || username) {
      const existingUser = await this.userRepository.findOne({
        where: [
          { email, id: Not(id) },
          { username, id: Not(id) },
        ],
      });
      if (existingUser) {
        throw new ConflictException(
          'Пользователь с таким email или username уже зарегистрирован',
        );
      }
    }
    await this.userRepository.update(id, updateUserDto);
    const updatedUser = await this.userRepository.findOne({ where: { id } });

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return await this.userRepository.findOne({ where: { id } });
  }

  async remove(query: FindOptionsWhere<User>): Promise<void> {
    await this.userRepository.delete(query);
  }
}
