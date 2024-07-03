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
    return this.wishesService.update(req.user.id, id, updateWishDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  async copyWish(@Param('id') id: number, @Request() req) {
    return this.wishesService.copyWish(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: number) {
    return this.wishesService.remove(id, req.user.id);
  }
}
