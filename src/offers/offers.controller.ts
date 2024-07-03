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
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  async create(@Body() createOfferDto: CreateOfferDto) {
    return this.offersService.create(createOfferDto);
  }

  @Get()
  async findAll() {
    return this.offersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.offersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateOfferDto: UpdateOfferDto,
  ) {
    return this.offersService.update(id, updateOfferDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: number) {
    const offer = await this.offersService.findOne(id);
    if (offer.user !== req.user.id) {
      throw new ForbiddenException('You can only delete your own wishlists.');
    }

    return this.offersService.remove(id, req.user.id);
  }
}
