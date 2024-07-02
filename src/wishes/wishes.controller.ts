import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createWishDto: CreateWishDto) {
    return this.wishesService.create(createWishDto, req.user.userId);
  }

  @Get()
  async findAll() {
    return this.wishesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.wishesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    const wish = await this.wishesService.findOne(id);
    if (wish.owner.id !== req.user.id) {
      throw new ForbiddenException('You can only edit your own wishes');
    }
    if (wish.offers.length > 0) {
      throw new ForbiddenException(
        'Cannot update the wish as it already has contributions.',
      );
    }
    return this.wishesService.update(id, updateWishDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: number) {
    const wish = await this.wishesService.findOne(id);
    if (wish.owner.id !== req.user.id) {
      throw new ForbiddenException('You can only edit your own wishes');
    }
    if (wish.offers.length > 0) {
      throw new ForbiddenException(
        'Cannot update the wish as it already has contributions.',
      );
    }
    return this.wishesService.remove(id);
  }
}
