import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, ownerId: number): Promise<Wish> {
    const wish = this.wishRepository.create({
      ...createWishDto,
      owner: { id: ownerId },
    });

    return await this.wishRepository.save(wish);
  }

  async findAll(): Promise<Wish[]> {
    return this.wishRepository.find({ relations: ['owner', 'offers'] });
  }

  async findOne(id: number): Promise<Wish | undefined> {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner', 'offers'],
    });

    if (!wish) {
      throw new NotFoundException(`Wish #${id} not found`);
    }
    return wish;
  }

  async update(
    userId: number,
    id: number,
    updateWishDto: UpdateWishDto,
  ): Promise<Wish | undefined> {
    const wish = await this.wishRepository.findOne({ where: { id } });
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('You can only edit your own wishes');
    }
    if (wish.offers.length > 0) {
      throw new ForbiddenException(
        'Cannot update the wish as it already has contributions.',
      );
    }
    await this.wishRepository.update(id, updateWishDto);
    return await this.wishRepository.findOne({ where: { id } });
  }

  async remove(id: number, userId: number): Promise<void> {
    const wish = await this.wishRepository.findOne({ where: { id } });
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('You can only delete your own wishes');
    }
    if (wish.offers.length > 0) {
      throw new ForbiddenException(
        'Cannot update the wish as it already has contributions.',
      );
    }
    await this.wishRepository.delete(id);
  }

  async copyWish(id: number, userId: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({ where: { id } });
    const copiedWish = this.wishRepository.create({
      ...wish,
      owner: { id: userId },
      id: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    wish.copied += 1;

    await this.wishRepository.save(wish);
    return await this.wishRepository.save(copiedWish);
  }
}
