import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createWishlistDto: CreateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const wishlist = this.wishlistRepository.create({
      ...createWishlistDto,
      user,
    });

    return await this.wishlistRepository.save(wishlist);
  }

  async findAll(): Promise<Wishlist[]> {
    return this.wishlistRepository.find({ relations: ['user', 'items'] });
  }

  async findOne(id: number): Promise<Wishlist | undefined> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['user', 'items'],
    });
    if (!wishlist) {
      throw new NotFoundException(`Wishlist #${id} not found`);
    }
    return wishlist;
  }

  async update(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ): Promise<Wishlist | undefined> {
    const wishlist = await this.wishlistRepository.findOne({ where: { id } });
    if (!wishlist) {
      throw new NotFoundException(`Wishlist with ID ${id} not found`);
    }
    if (wishlist.user.id !== userId) {
      throw new ForbiddenException(
        `You do not have permission to update this wishlist`,
      );
    }
    await this.wishlistRepository.update(id, updateWishlistDto);
    return await this.wishlistRepository.findOne({ where: { id } });
  }

  async remove(id: number, userId: number): Promise<void> {
    const wishlist = await this.wishlistRepository.findOne({ where: { id } });
    if (!wishlist) {
      throw new NotFoundException(`Wishlist with ID ${id} not found`);
    }
    if (wishlist.user.id !== userId) {
      throw new ForbiddenException(
        `You do not have permission to delete this wishlist`,
      );
    }
    await this.wishlistRepository.delete(id);
  }
}
