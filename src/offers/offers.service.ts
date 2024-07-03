import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer } from './entities/offer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Wish } from 'src/wishes/entities/wish.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    private readonly connection: Connection,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createOfferDto: CreateOfferDto): Promise<Offer> {
    const { userId, wishId, amount, hidden } = createOfferDto;

    return await this.connection.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const wish = await manager.findOne(Wish, { where: { id: wishId } });
      if (!wish) {
        throw new NotFoundException(`Wish with ID ${wishId} not found`);
      }

      if (wish.raised >= wish.price) {
        throw new ConflictException('Funds already raised for this wish');
      }

      if (amount > wish.price - wish.raised) {
        throw new ConflictException(
          'Amount exceeds remaining needed funds for this wish',
        );
      }

      wish.raised += amount;
      await manager.save(wish);

      const offer = manager.create(Offer, {
        user,
        item: wish,
        amount,
        hidden,
      });

      return await manager.save(offer);
    });
  }

  async findAll(): Promise<Offer[]> {
    return this.offerRepository.find();
  }

  async findOne(id: number): Promise<Offer | undefined> {
    return await this.offerRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateOfferDto: UpdateOfferDto,
  ): Promise<Offer | undefined> {
    await this.offerRepository.update(id, updateOfferDto);
    return await this.offerRepository.findOne({ where: { id } });
  }

  async remove(id: number, userId: number): Promise<void> {
    const offer = this.offerRepository.findOne({ where: { id } });
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    if ((await offer).user.id != userId) {
      throw new ForbiddenException(
        `You do not have permission to delete this wishlist`,
      );
    }
    await this.offerRepository.delete(id);
  }
}
