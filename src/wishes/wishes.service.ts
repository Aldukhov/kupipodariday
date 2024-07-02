import { Injectable, NotFoundException } from '@nestjs/common';
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
    id: number,
    updateWishDto: UpdateWishDto,
  ): Promise<Wish | undefined> {
    await this.wishRepository.update(id, updateWishDto);
    return await this.wishRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.wishRepository.delete(id);
  }
}
